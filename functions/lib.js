// ===== PT-TKF 共享库（Cloudflare Pages Functions） =====
// 提供：JSON 响应、Bearer 提取、无状态 HMAC 令牌、D1 键值助手、内容/配置读写。
import { DEFAULT_CONTENT } from "./defaults.js";

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers }
  });
}

export function getBearer(req) {
  const h = req.headers.get("authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : "";
}

// ---------- 无状态 HMAC 令牌（Edge 无内存态，故用签名令牌） ----------
const enc = new TextEncoder();

async function hmac(msg, secret) {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function b64urlEncode(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

export async function createToken(secret, ttl = 60 * 60 * 24 * 7) {
  const payload = { exp: Date.now() + ttl * 1000 };
  const p = b64urlEncode(JSON.stringify(payload));
  const s = await hmac(p, secret);
  return p + "." + s;
}

export async function verifyToken(token, secret, db) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const [p, s] = token.split(".");
  if (!p || !s) return false;
  const expected = await hmac(p, secret);
  if (expected.length !== s.length) return false;
  let ok = true;
  for (let i = 0; i < expected.length; i++) if (expected[i] !== s[i]) ok = false;
  if (!ok) return false;
  try {
    const payload = JSON.parse(b64urlDecode(p));
    if (!payload.exp || payload.exp < Date.now()) return false;
  } catch { return false; }
  // 注销检查（登出时写入 revoke:<token>）
  if (db) {
    const row = await db.prepare("SELECT v FROM kv WHERE k = ?").bind("revoke:" + token).first();
    if (row) return false;
  }
  return true;
}

export async function requireAuth(req, env) {
  const token = getBearer(req);
  if (!token) return false;
  return verifyToken(token, env.AUTH_SECRET || "dev-insecure-secret", env.TKF_DB);
}

export async function revokeToken(token, db) {
  await db.prepare("INSERT OR REPLACE INTO kv (k, v) VALUES (?, ?)").bind("revoke:" + token, "1").run();
}

// ---------- D1 键值助手（用 kv 表模拟 KV） ----------
export async function kvGet(db, key) {
  const row = await db.prepare("SELECT v FROM kv WHERE k = ?").bind(key).first();
  return row ? row.v : null;
}
export async function kvSet(db, key, value) {
  await db.prepare(
    "INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v"
  ).bind(key, value).run();
}

// ---------- 内容（i18n + brochures） ----------
export async function getContent(db) {
  const v = await kvGet(db, "content");
  if (v) {
    try { return JSON.parse(v); } catch { /* 损坏则回落种子 */ }
  }
  return DEFAULT_CONTENT;
}
export async function setContent(db, obj) {
  await kvSet(db, "content", JSON.stringify(obj));
}

// ---------- 翻译服务配置 ----------
export function defaultConfig(env) {
  return {
    provider: (env && env.TRANSLATE_PROVIDER) || "google"
  };
}
export async function getConfig(db, env) {
  const base = defaultConfig(env);
  const v = await kvGet(db, "config");
  if (!v) return base;
  try {
    return Object.assign(base, JSON.parse(v));
  } catch { return base; }
}
export async function setConfig(db, obj) {
  await kvSet(db, "config", JSON.stringify(obj));
}
