// POST /api/translate  鉴权：调用外部翻译服务，翻译内容对象
// 引擎链：Google → MyMemory；均为真正的机器翻译，失败返回 null 由调用方保留目标旧值。
// 注意：不再使用 LLM(agnes) 做翻译——它会返回自我介绍/拒答等垃圾文本，污染译文。
import { json, requireAuth, getConfig } from "../lib.js";

const LANG_MAP = { zh: "zh-CN", id: "id", en: "en" };

// 跳过代码/联系方式/品牌/型号等，但保留含空格的拉丁句子
function isTranslatable(text) {
  if (!text || typeof text !== "string" || !text.trim()) return false;
  const t = text.trim();
  if (/@/.test(t) || /^https?:/i.test(t)) return false;
  if (/^[\d\s+()\-./]+$/.test(t)) return false;
  if (/^[A-Za-z0-9_\-]+$/.test(t) && /\d/.test(t)) return false;
  if (/^[A-Z0-9_\-]+$/.test(t)) return false;
  return true;
}
const SKIP_KEYS = new Set(["en", "dir", "langName", "model", "img", "pdf", "num"]);
function hasHan(s) { return /[一-鿿]/.test(s); }
function shouldTranslate(text, key) {
  if (SKIP_KEYS.has(key)) return false;
  return isTranslatable(text);
}
function guessSource(text) { return hasHan(text) ? "zh" : "en"; }

// ---------- 各翻译引擎（返回译文字符串或 null 表示失败） ----------
async function mtGoogle(text, sl, tl) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    const r = await fetch(url, { headers: { "Accept-Encoding": "identity" } });
    if (!r.ok) return null;
    const arr = await r.json();
    const out = (arr[0] || []).map(seg => seg[0]).join("").trim();
    return out || null;
  } catch { return null; }
}

async function mtMyMemory(text, sl, tl) {
  try {
    // 带 de=邮箱 参数可将每日配额从 5000 提升到 50000 字（缓解 Cloudflare 共享 IP 触发配额告警）
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${tl}&de=admin@pt-tkf.pages.dev`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = await r.json();
    if (j.responseStatus === 200 && j.responseData && j.responseData.translatedText) {
      const out = j.responseData.translatedText.trim();
      if (!out || /MYMEMORY WARNING|INVALID|QUERY LENGTH LIMIT|NO QUERY SPECIFIED/i.test(out)) return null;
      return out;
    }
    return null;
  } catch { return null; }
}

// 返回译文字符串；失败或无需翻译时返回 null（由调用方决定回退到目标旧值，绝不回退到源语言）
async function translateOne(text, source, target, SVC) {
  const sl = LANG_MAP[source] || LANG_MAP[guessSource(text)];
  const tl = LANG_MAP[target];
  if (!tl || sl === tl) return null; // 源=目标或未知目标：不翻译
  // 引擎链：Google → MyMemory
  let o = await mtGoogle(text, sl, tl);
  if (o) return o;
  o = await mtMyMemory(text, sl, tl);
  if (o) return o;
  return null; // 全部失败：交给调用方保留目标旧值，绝不写入源语言（否则英文栏会变中文）
}

// 递归翻译对象（带并发限制）
// srcObj: 源语言内容；tgtObj: 目标语言现有内容（翻译失败时回退用，避免污染成源语言）
async function translateObject(srcObj, tgtObj, source, target, SVC, limit = 5) {
  const tasks = [];
  (function collect(o, key) {
    if (typeof o === "string") { if (shouldTranslate(o, key || "")) tasks.push(o); }
    else if (Array.isArray(o)) o.forEach(v => collect(v, key));
    else if (o && typeof o === "object") { for (const k of Object.keys(o)) { if (SKIP_KEYS.has(k)) continue; collect(o[k], k); } }
  })(srcObj, "");
  const unique = [...new Set(tasks)];
  const cache = {};
  let idx = 0;
  async function worker() {
    while (idx < unique.length) {
      const t = unique[idx++];
      cache[t] = await translateOne(t, source, target, SVC); // 译文字符串 或 null
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, unique.length || 1) }, worker));
  // 源结构与目标结构并行遍历：翻译成功→用译文；失败→保留目标旧值；目标为空才兜底用源
  function walk(s, tg, key) {
    if (typeof s === "string") {
      if (SKIP_KEYS.has(key)) return s;              // 固定字段（型号/路径/固定英文标签）用源值
      if (!shouldTranslate(s, key)) return s;        // 电话/邮箱/代码等不译
      const c = cache[s];
      if (c) return c;                               // 翻译成功
      if (typeof tg === "string" && tg.trim()) return tg; // 失败：保留目标已有值（绝不写入源语言）
      return s;                                       // 目标为空时才兜底用源
    }
    if (Array.isArray(s)) return s.map((v, i) => walk(v, Array.isArray(tg) ? tg[i] : undefined, key));
    if (s && typeof s === "object") {
      const out = {};
      for (const k of Object.keys(s)) out[k] = walk(s[k], (tg && typeof tg === "object") ? tg[k] : undefined, k);
      return out;
    }
    return s;
  }
  return walk(srcObj, tgtObj, "");
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未授权，请先登录" }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: "无效的请求" }, 400); }
  const { source, target, data, targetData } = body || {};
  if (!source || !target || !data || !LANG_MAP[source] || !LANG_MAP[target]) {
    return json({ error: "参数缺失或语言不支持" }, 400);
  }
  const SVC = await getConfig(env.TKF_DB, env);
  try {
    const result = await translateObject(data, targetData || {}, source, target, SVC);
    return json({ ok: true, result });
  } catch (e) {
    return json({ error: "翻译失败: " + e.message }, 500);
  }
}
