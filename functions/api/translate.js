// POST /api/translate  鉴权：调用外部翻译服务，翻译内容对象
import { json, requireAuth, getConfig } from "../lib.js";

const LANG_MAP = { zh: "zh-CN", id: "id", en: "en" };
const LANG_NAME = { zh: "中文", id: "印尼语", en: "英语" };

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

async function translateOne(text, source, target, SVC) {
  if (!isTranslatable(text)) return text;
  const sl = LANG_MAP[guessSource(text)], tl = LANG_MAP[target];
  const q = encodeURIComponent(text);
  try {
    if (SVC.provider === "agnes") {
      const key = SVC.agnesApiKey || "";
      if (!key) return text;
      const sys = "你是一个专业翻译引擎。只输出翻译结果，不要任何解释、前缀或引号。"
        + "自动识别源语言，将文本翻译为" + LANG_NAME[target] + "。"
        + "保持原文中的型号、数字、百分比、邮箱、电话、网址、单位等原样不译。"
        + "若原文已是目标语言或无意义符号，原样返回。";
      const user = `请将以下文本翻译为${LANG_NAME[target]}：\n"""${text}"""`;
      const body = JSON.stringify({ model: SVC.agnesModel, temperature: 0.2, max_tokens: 2048,
        messages: [ { role: "system", content: sys }, { role: "user", content: user } ] });
      const r = await fetch(SVC.agnesBase + "/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
        body
      });
      const j = await r.json();
      let out = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || "").trim();
      out = out.replace(/^[\s"'“”「」]+|[\s"'“”「」]+$/g, "");
      return out || text;
    } else if (SVC.deeplKey) {
      const body = `auth_key=${encodeURIComponent(SVC.deeplKey)}&text=${q}&source_lang=${sl.toUpperCase()}&target_lang=${tl.toUpperCase()}`;
      const r = await fetch("https://api-free.deepl.com/v2/translate", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      });
      const j = await r.json();
      return (j.translations && j.translations[0] && j.translations[0].text) || text;
    } else if (SVC.provider === "mymemory") {
      const r = await fetch(`https://api.mymemory.translated.net/get?q=${q}&langpair=${sl}|${tl}`);
      const j = await r.json();
      if (j.responseStatus === 200 && j.responseData && j.responseData.translatedText) return j.responseData.translatedText;
      return text;
    } else {
      const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${q}`);
      const arr = await r.json();
      const out = (arr[0] || []).map(seg => seg[0]).join("");
      return out || text;
    }
  } catch { return text; }
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
  function walk(o) {
    if (typeof o === "string") return cache[o] !== undefined ? cache[o] : o;
    if (Array.isArray(o)) return o.map(walk);
    if (o && typeof o === "object") { const out = {}; for (const k of Object.keys(o)) out[k] = walk(o[k]); return out; }
    return o;
  }
  return walk(obj);
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
  if (SVC.provider === "agnes" && !SVC.agnesApiKey) {
    return json({ error: "未配置 Agnes API Key，请先在「翻译服务设置」中填写 Key" }, 400);
  }
  if (SVC.provider === "deepl" && !SVC.deeplKey) {
    return json({ error: "未配置 DeepL Key，请先在「翻译服务设置」中填写" }, 400);
  }
  try {
    const result = await translateObject(data, source, target, SVC);
    return json({ ok: true, result });
  } catch (e) {
    return json({ error: "翻译失败: " + e.message }, 500);
  }
}
