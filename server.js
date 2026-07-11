// ===== PT-TKF 后台服务 / Backend server =====
// 提供：静态前台托管 + 后台管理界面 + 内容读取/保存 API + 简单登录鉴权 + 图片上传
// 运行： npm install && npm start  →  http://localhost:8080  (后台: /admin)

const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const https = require("https");
const zlib = require("zlib");

const app = express();
const PORT = process.env.PORT || 8080;
// 后台登录密码：必须通过环境变量 ADMIN_PASSWORD 设置，例如 ADMIN_PASSWORD=xxxx npm start
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_FILE = path.join(__dirname, "data", "content.json");
const IMG_DIR = path.join(__dirname, "assets", "img");

// ---------- 联系表单留言（公开提交，鉴权查看） ----------
const INQUIRY_FILE = path.join(__dirname, "data", "inquiries.json");
function readInquiries() {
  try { return JSON.parse(fs.readFileSync(INQUIRY_FILE, "utf-8")); }
  catch (e) { return []; }
}
function writeInquiries(list) {
  fs.mkdirSync(path.dirname(INQUIRY_FILE), { recursive: true });
  fs.writeFileSync(INQUIRY_FILE, JSON.stringify(list, null, 2), "utf-8");
}

// 内存中的有效登录令牌（重启后失效，需重新登录）
const TOKENS = new Set();

app.use(express.json({ limit: "25mb" }));
app.use(express.static(__dirname)); // 前台（index.html 等）
app.use("/admin", express.static(path.join(__dirname, "admin"))); // 后台界面

// ---------- 数据读写 ----------
function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (e) {
    console.error("读取内容失败:", e.message);
    return { i18n: {}, brochures: [] };
  }
}
function writeData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ---------- 鉴权中间件 ----------
function requireAuth(req, res, next) {
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (TOKENS.has(token)) return next();
  return res.status(401).json({ error: "未授权，请先登录" });
}

// ---------- 公开：获取内容（前台渲染用） ----------
app.get("/api/content", (req, res) => {
  res.json(readData());
});

// ---------- 登录 ----------
app.post("/api/login", (req, res) => {
  const pwd = req.body && req.body.password;
  if (pwd === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(24).toString("hex");
    TOKENS.add(token);
    return res.json({ token });
  }
  return res.status(401).json({ error: "密码错误" });
});

app.post("/api/logout", requireAuth, (req, res) => {
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  TOKENS.delete(token);
  res.json({ ok: true });
});

// ---------- 保存内容（鉴权） ----------
app.post("/api/content", requireAuth, (req, res) => {
  const data = req.body;
  if (!data || typeof data !== "object" || !data.i18n || !Array.isArray(data.brochures)) {
    return res.status(400).json({ error: "内容格式不正确" });
  }
  try {
    writeData(data);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "保存失败: " + e.message });
  }
});

// ---------- 图片上传（base64，鉴权） ----------
// body: { name: "110.png", dataUrl: "data:image/png;base64,...." }
app.post("/api/upload", requireAuth, (req, res) => {
  const { name, dataUrl } = req.body || {};
  if (!name || !dataUrl || !/^data:image\//.test(dataUrl)) {
    return res.status(400).json({ error: "无效的图片数据" });
  }
  const m = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!m) return res.status(400).json({ error: "无法解析图片" });
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  // 安全文件名
  const safe = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  const finalName = safe.replace(/\.[^.]+$/, "") + "." + ext;
  const buf = Buffer.from(m[2], "base64");
  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.writeFileSync(path.join(IMG_DIR, finalName), buf);
  res.json({ ok: true, url: "assets/img/" + finalName });
});

// ---------- 联系表单留言 API ----------
const INQ_LANGS = ["zh", "id", "en"];

// 公开：前台提交留言
app.post("/api/inquiry", (req, res) => {
  const b = req.body || {};
  const name = (b.name || "").toString().trim();
  const phone = (b.phone || "").toString().trim();
  const message = (b.message || "").toString().trim();
  const lang = INQ_LANGS.includes(b.lang) ? b.lang : "zh";
  if (!name || !message) return res.status(400).json({ error: "请填写姓名与需求" });
  const list = readInquiries();
  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: name, phone: phone, message: message, lang: lang,
    time: new Date().toISOString(),
    read: false
  };
  list.unshift(item);
  writeInquiries(list);
  res.json({ ok: true, id: item.id });
});

// 鉴权：查看留言列表（最新在前）
app.get("/api/inquiries", requireAuth, (req, res) => {
  res.json(readInquiries());
});

// 鉴权：标记已读 / 未读
app.post("/api/inquiries/:id/read", requireAuth, (req, res) => {
  const list = readInquiries();
  const it = list.find(x => x.id === req.params.id);
  if (!it) return res.status(404).json({ error: "未找到该留言" });
  const want = req.body && typeof req.body.read === "boolean" ? req.body.read : true;
  it.read = want;
  writeInquiries(list);
  res.json({ ok: true });
});

// 鉴权：删除留言
app.delete("/api/inquiries/:id", requireAuth, (req, res) => {
  const list = readInquiries();
  const next = list.filter(x => x.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ error: "未找到该留言" });
  writeInquiries(next);
  res.json({ ok: true });
});

// 鉴权：导出 CSV
app.get("/api/inquiries/export", requireAuth, (req, res) => {
  const list = readInquiries();
  const langName = { zh: "中文", id: "印尼语", en: "英语" };
  const esc = s => '"' + (s == null ? "" : String(s).replace(/"/g, '""')) + '"';
  const header = ["时间", "语言", "姓名", "电话", "需求", "状态"];
  const rows = list.map(x => [
    new Date(x.time).toLocaleString("zh-CN"),
    langName[x.lang] || x.lang,
    x.name, x.phone || "", x.message,
    x.read ? "已读" : "未读"
  ]);
  const csv = "﻿" + [header, ...rows].map(r => r.map(esc).join(",")).join("\r\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=inquiries.csv");
  res.send(csv);
});

// ---------- 自动翻译 ----------
// 翻译服务配置：优先读取 data/config.json（后台可设置），缺失时回退环境变量
const CONFIG_FILE = path.join(__dirname, "data", "config.json");
function loadConfig() {
  let c = {};
  try { c = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8")); } catch (e) {}
  return Object.assign({
    provider: process.env.TRANSLATE_PROVIDER || "agnes",
    deeplKey: process.env.DEEPL_KEY || "",
    agnesApiKey: process.env.AGNES_API_KEY || "",
    agnesBase: process.env.AGNES_BASE || "https://apihub.agnes-ai.com/v1",
    agnesModel: process.env.AGNES_MODEL || "agnes-2.0-flash"
  }, c);
}
let SVC = loadConfig();
function saveConfig() {
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(SVC, null, 2), "utf-8");
}
const LANG_MAP = { zh: "zh-CN", id: "id", en: "en" };
const LANG_NAME = { zh: "中文", id: "印尼语", en: "英语" };
// 判断是否为“可翻译的真实文本”：跳过代码/联系方式/品牌/型号，
// 但保留含空格的拉丁句子（印尼语/英语文案）以便自动识别源语言后翻译。
function isTranslatable(text) {
  if (!text || typeof text !== "string" || !text.trim()) return false;
  const t = text.trim();
  if (/@/.test(t) || /^https?:/i.test(t)) return false;          // 邮箱 / 网址
  if (/^[\d\s+()\-./]+$/.test(t)) return false;                  // 纯电话号码/数字
  if (/^[A-Za-z0-9_\-]+$/.test(t) && /\d/.test(t)) return false; // 无空格且含数字（型号如 KR110D-A）
  if (/^[A-Z0-9_\-]+$/.test(t)) return false;                    // 全大写代号/品牌（如 PT-TKF）
  return true;
}
// 永不参与“按语言翻译”的字段（固定语言或结构化数据）
//  en       : 设备项里固定英语副标题（双语标签，需保持英文）
//  dir/langName : 排版/语言名元信息
//  model/img/pdf/num : 型号、图片路径、文件、数字
const SKIP_KEYS = new Set(["en", "dir", "langName", "model", "img", "pdf", "num"]);
function hasHan(s) { return /[一-鿿]/.test(s); } // 含汉字

// 判断某字段值是否需要翻译：固定字段/代码不译；其余真实文本都参与翻译，
// 由翻译接口按“目标语言”输出并自动识别各自的源语言，避免三语互相错位。
function shouldTranslate(text, key) {
  if (SKIP_KEYS.has(key)) return false;
  return isTranslatable(text);
}
// 非 Agnes（需显式源语言）时，粗略判断字段源语言：含汉字→中文，否则→英语（兜底）
function guessSource(text) {
  return hasHan(text) ? "zh" : "en";
}
function translateOne(text, source, target) {
  return new Promise((resolve) => {
    if (!isTranslatable(text)) return resolve(text);
    const sl = LANG_MAP[guessSource(text)], tl = LANG_MAP[target];
    const q = encodeURIComponent(text);
    if (SVC.provider === "agnes") {
      // Agnes AI（OpenAI 兼容 chat/completions），用提示词实现翻译
      const AGNES_API_KEY = SVC.agnesApiKey || process.env.AGNES_API_KEY || "";
      if (!AGNES_API_KEY) { console.warn("[translate] Agnes API Key 未配置，跳过翻译"); return resolve(text); }
      const sys = "你是一个专业翻译引擎。只输出翻译结果，不要任何解释、前缀或引号。"
        + "自动识别源语言，将文本翻译为" + LANG_NAME[target] + "。"
        + "保持原文中的型号、数字、百分比、邮箱、电话、网址、单位等原样不译。"
        + "若原文已是目标语言或无意义符号，原样返回。";
      const user = `请将以下文本翻译为${LANG_NAME[target]}：\n"""${text}"""`;
      const body = JSON.stringify({ model: SVC.agnesModel, temperature: 0.2, max_tokens: 2048,
        messages: [ { role: "system", content: sys }, { role: "user", content: user } ] });
      const u = new URL(SVC.agnesBase + "/chat/completions");
      const req = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + AGNES_API_KEY, "Accept-Encoding": "identity" } },
        (res2) => {
          let d = ""; res2.on("data", c => d += c); res2.on("end", () => {
            try {
              const j = JSON.parse(d);
              let out = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || "").trim();
              out = out.replace(/^[\s"'“”「」]+|[\s"'“”「」]+$/g, ""); // 去除模型可能裹上的引号/三引号
              resolve(out || text);
            } catch (e) { resolve(text); }
          });
        });
      req.on("error", () => resolve(text));
      req.write(body); req.end();
    } else if (SVC.deeplKey) {
      // DeepL 免费接口
      const body = `auth_key=${encodeURIComponent(SVC.deeplKey)}&text=${q}&source_lang=${sl.toUpperCase()}&target_lang=${tl.toUpperCase()}`;
      const req = https.request(
        { hostname: "api-free.deepl.com", path: "/v2/translate", method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept-Encoding": "identity" } },
        (res2) => { let d = ""; res2.on("data", c => d += c); res2.on("end", () => {
          try { resolve(JSON.parse(d).translations[0].text || text); } catch (e) { resolve(text); }
        }); });
      req.on("error", () => resolve(text));
      req.write(body); req.end();
    } else if (SVC.provider === "mymemory") {
      const url = `https://api.mymemory.translated.net/get?q=${q}&langpair=${sl}|${tl}`;
      https.get(url, { headers: { "Accept-Encoding": "identity" } }, (res2) => { let d = ""; res2.on("data", c => d += c); res2.on("end", () => {
        try {
          const j = JSON.parse(d);
          if (j.responseStatus === 200 && j.responseData && j.responseData.translatedText) resolve(j.responseData.translatedText);
          else resolve(text);
        } catch (e) { resolve(text); }
      }); }).on("error", () => resolve(text));
    } else {
      // Google 翻译（非官方 gtx 接口，无需密钥）
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${q}`;
      https.get(url, { headers: { "Accept-Encoding": "identity" } }, (res2) => { let d = ""; res2.on("data", c => d += c); res2.on("end", () => {
        try {
          const arr = JSON.parse(d);
          const out = (arr[0] || []).map(seg => seg[0]).join("");
          resolve(out || text);
        } catch (e) { resolve(text); }
      }); }).on("error", () => resolve(text));
    }
  });
}
// 递归翻译对象（带并发限制，避免触发配额）
function translateObject(obj, source, target, limit = 5) {
  const tasks = [];
  (function collect(o, key) {
    if (typeof o === "string") {
      if (shouldTranslate(o, key || "")) tasks.push(o);
    } else if (Array.isArray(o)) {
      o.forEach(v => collect(v, key));
    } else if (o && typeof o === "object") {
      for (const k of Object.keys(o)) {
        if (SKIP_KEYS.has(k)) continue; // 整棵子树跳过（如固定英语标签 en、代码等）
        collect(o[k], k);
      }
    }
  })(obj, "");
  const unique = [...new Set(tasks)];
  const cache = {};
  let idx = 0;
  async function worker() {
    while (idx < unique.length) {
      const t = unique[idx++];
      cache[t] = await translateOne(t, source, target);
    }
  }
  return Promise.all(Array.from({ length: Math.min(limit, unique.length || 1) }, worker)).then(() => {
    function walk(o) {
      if (typeof o === "string") return cache[o] !== undefined ? cache[o] : o;
      if (Array.isArray(o)) return o.map(walk);
      if (o && typeof o === "object") { const out = {}; for (const k of Object.keys(o)) out[k] = walk(o[k]); return out; }
      return o;
    }
    return walk(obj);
  });
}

app.post("/api/translate", requireAuth, async (req, res) => {
  const { source, target, data } = req.body || {};
  if (!source || !target || !data || !LANG_MAP[source] || !LANG_MAP[target]) {
    return res.status(400).json({ error: "参数缺失或语言不支持" });
  }
  // 未配置必要 Key 时直接报错，避免前端把“原文”当译文覆盖目标语言（再次造成混排）
  const ak = SVC.agnesApiKey || process.env.AGNES_API_KEY;
  if (SVC.provider === "agnes" && !ak) {
    return res.status(400).json({ error: "未配置 Agnes API Key，请先在「翻译服务设置」中填写 Key" });
  }
  if (SVC.provider === "deepl" && !SVC.deeplKey) {
    return res.status(400).json({ error: "未配置 DeepL Key，请先在「翻译服务设置」中填写" });
  }
  try {
    const result = await translateObject(data, source, target);
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ error: "翻译失败: " + e.message });
  }
});

// ---------- 翻译服务配置（后台设置，持久化） ----------
app.get("/api/config", requireAuth, (req, res) => {
  res.json({
    provider: SVC.provider,
    agnesBase: SVC.agnesBase,
    agnesModel: SVC.agnesModel,
    agnesApiKey: SVC.agnesApiKey ? "******" : "",
    hasAgnesKey: !!SVC.agnesApiKey
  });
});
app.post("/api/config", requireAuth, (req, res) => {
  const b = req.body || {};
  if (b.provider) SVC.provider = b.provider;
  if (b.agnesBase) SVC.agnesBase = b.agnesBase;
  if (b.agnesModel) SVC.agnesModel = b.agnesModel;
  if (typeof b.agnesApiKey === "string") {
    // 仅当填写了新值（非掩码占位）才更新
    if (b.agnesApiKey && b.agnesApiKey !== "******") SVC.agnesApiKey = b.agnesApiKey;
  }
  if (typeof b.deeplKey === "string") {
    if (b.deeplKey && b.deeplKey !== "******") SVC.deeplKey = b.deeplKey;
  }
  try {
    saveConfig();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "保存配置失败: " + e.message });
  }
});

// 后台入口
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin", "index.html"));
});

app.listen(PORT, () => {
  console.log("=============================================");
  console.log(" PT-TKF 官网已启动");
  console.log(" 前台:  http://localhost:" + PORT);
  console.log(" 后台:  http://localhost:" + PORT + "/admin");
  console.log(" 后台密码: " + (ADMIN_PASSWORD ? "已通过环境变量 ADMIN_PASSWORD 设置" : "未设置！请用 ADMIN_PASSWORD 环境变量配置后再启动"));
  console.log("=============================================");
});
