// GET  /api/config  鉴权：获取翻译服务配置（密钥掩码）
// POST /api/config  鉴权：保存翻译服务配置
import { json, requireAuth, getConfig, setConfig } from "../lib.js";

export async function onRequestGet({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未授权，请先登录" }, 401);
  const c = await getConfig(env.TKF_DB, env);
  return json({
    provider: c.provider
  });
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未授权，请先登录" }, 401);
  let b;
  try { b = await request.json(); } catch { return json({ error: "无效的请求" }, 400); }
  const cur = await getConfig(env.TKF_DB, env);
  const next = { ...cur };
  if (b.provider) next.provider = b.provider;
  await setConfig(env.TKF_DB, next);
  return json({ ok: true });
}
