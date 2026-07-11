// POST /api/login  公开：校验密码，返回无状态令牌
import { json, createToken } from "../lib.js";

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "无效的请求" }, 400); }
  const pwd = (body && body.password) || "";
  if (!env.ADMIN_PASSWORD || pwd !== env.ADMIN_PASSWORD) {
    return json({ error: "密码错误" }, 401);
  }
  const token = await createToken(env.AUTH_SECRET || "dev-insecure-secret");
  return json({ token });
}
