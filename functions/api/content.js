// GET  /api/content   公开：前台渲染用内容
// POST /api/content   鉴权：保存内容
import { json, requireAuth, getContent, setContent } from "../lib.js";

export async function onRequestGet({ env }) {
  const data = await getContent(env.TKF_DB);
  return json(data);
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未授权，请先登录" }, 401);
  let data;
  try { data = await request.json(); } catch { return json({ error: "无效的 JSON" }, 400); }
  if (!data || typeof data !== "object" || !data.i18n || !Array.isArray(data.brochures)) {
    return json({ error: "内容格式不正确" }, 400);
  }
  await setContent(env.TKF_DB, data);
  return json({ ok: true });
}
