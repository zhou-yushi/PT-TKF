// POST /api/inquiries/:id/read  鉴权：标记已读/未读
import { json, requireAuth } from "../lib.js";

export async function onRequestPost({ request, params, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未授权，请先登录" }, 401);
  let body;
  try { body = await request.json(); } catch { body = {}; }
  const want = (body && typeof body.read === "boolean") ? body.read : true;
  const info = await env.TKF_DB.prepare("UPDATE inquiries SET read = ? WHERE id = ?")
    .bind(want ? 1 : 0, params.id).run();
  if (!info.success || (info.meta && info.meta.changes === 0)) {
    return json({ error: "未找到该留言" }, 404);
  }
  return json({ ok: true });
}
