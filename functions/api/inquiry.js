// POST /api/inquiry  公开：前台提交联系表单留言
import { json } from "../lib.js";

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ error: "无效的请求" }, 400); }
  const name = (b.name || "").toString().trim();
  const phone = (b.phone || "").toString().trim();
  const message = (b.message || "").toString().trim();
  const lang = ["zh", "id", "en"].includes(b.lang) ? b.lang : "zh";
  if (!name || !message) return json({ error: "请填写姓名与需求" }, 400);

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const time = new Date().toISOString();
  await env.TKF_DB.prepare(
    "INSERT INTO inquiries (id, name, phone, message, lang, time, read) VALUES (?, ?, ?, ?, ?, ?, 0)"
  ).bind(id, name, phone, message, lang, time).run();
  return json({ ok: true, id });
}
