// POST /api/logout  鉴权：注销（将当前令牌加入撤销列表）
import { json, getBearer, revokeToken } from "../lib.js";

export async function onRequestPost({ request, env }) {
  const token = getBearer(request);
  if (token) await revokeToken(token, env.TKF_DB);
  return json({ ok: true });
}
