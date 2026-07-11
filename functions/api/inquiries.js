// GET /api/inquiries  鉴权：查看留言列表（最新在前）
import { json, requireAuth } from "../lib.js";

export async function onRequestGet({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未授权，请先登录" }, 401);
  const { results } = await env.TKF_DB.prepare(
    "SELECT id, name, phone, message, lang, time, read FROM inquiries ORDER BY time DESC"
  ).all();
  const list = (results || []).map(r => ({
    id: r.id, name: r.name, phone: r.phone, message: r.message,
    lang: r.lang, time: r.time, read: !!r.read
  }));
  return json(list);
}
