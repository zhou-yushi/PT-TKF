// DELETE /api/inquiries/:id  鉴权：删除留言
import { json, requireAuth } from "../lib.js";

export async function onRequestDelete({ request, params, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未授权，请先登录" }, 401);
  const info = await env.TKF_DB.prepare("DELETE FROM inquiries WHERE id = ?").bind(params.id).run();
  if (!info.success || (info.meta && info.meta.changes === 0)) {
    return json({ error: "未找到该留言" }, 404);
  }
  return json({ ok: true });
}
