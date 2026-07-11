// POST /api/translate  鉴权：调用外部翻译服务，翻译内容对象
// 引擎链：DeepL(有 Key 时优先) → Google → MyMemory；均为真正的机器翻译。
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
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${tl}`;
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

async function mtDeepL(text, sl, tl, key) {
  try {
    // DeepL 源/目标语言用大写基础码（zh-CN → ZH）
    const dSl = sl.split("-")[0].toUpperCase();
    const dTl = tl.split("-")[0].toUpperCase();
    const body = `auth_key=${encodeURIComponent(key)}&text=${encodeURIComponent(text)}&source_lang=${dSl}&target_lang=${dTl}`;
    const r = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    if (!r.ok) return null;
    const j = await r.json();
    const out = j.translations && j.translations[0] && j.translations[0].text;
    return (out && out.trim()) || null;
  } catch { return null; }
}

async function translateOne(text, source, target, SVC) {
  if (!isTranslatable(text)) return text;
  const sl = LANG_MAP[source] || LANG_MAP[guessSource(text)];
  const tl = LANG_MAP[target];
  if (!tl || sl === tl) return text; // 源=目标，或未知目标，原样返回
  // 引擎链：DeepL(有 Key) → Google → MyMemory
  if (SVC.deeplKey) {
    const o = await mtDeepL(text, sl, tl, SVC.deeplKey);
    if (o) return o;
  }
  let o = await mtGoogle(text, sl, tl);
  if (o) return o;
  o = await mtMyMemory(text, sl, tl);
  if (o) return o;
  return text; // 全部失败：保留原文（好过写入垃圾）
}

// 递归翻译对象（带并发限制）
async function translateObject(obj, source, target, SVC, limit = 5) {
  const tasks = [];
  (function collect(o, key) {
    if (typeof o === "string") { if (shouldTranslate(o, key || "")) tasks.push(o); }
    else if (Array.isArray(o)) o.forEach(v => collect(v, key));
    else if (o && typeof o === "object") { for (const k of Object.keys(o)) { if (SKIP_KEYS.has(k)) continue; collect(o[k], k); } }
  })(obj, "");
  const unique = [...new Set(tasks)];
  const cache = {};
  let idx = 0;
  async function worker() {
    while (idx < unique.length) {
      const t = unique[idx++];
      cache[t] = await translateOne(t, source, target, SVC);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, unique.length || 1) }, worker));
  function walk(o, key) {
    if (typeof o === "string") {
      if (SKIP_KEYS.has(key)) return o; // 固定英文标签等不替换
      return cache[o] !== undefined ? cache[o] : o;
    }
    if (Array.isArray(o)) return o.map(v => walk(v, key));
    if (o && typeof o === "object") { const out = {}; for (const k of Object.keys(o)) out[k] = walk(o[k], k); return out; }
    return o;
  }
  return walk(obj, "");
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未授权，请先登录" }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: "无效的请求" }, 400); }
  const { source, target, data } = body || {};
  if (!source || !target || !data || !LANG_MAP[source] || !LANG_MAP[target]) {
    return json({ error: "参数缺失或语言不支持" }, 400);
  }
  const SVC = await getConfig(env.TKF_DB, env);
  try {
    const result = await translateObject(data, source, target, SVC);
    return json({ ok: true, result });
  } catch (e) {
    return json({ error: "翻译失败: " + e.message }, 500);
  }
}
