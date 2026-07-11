// POST /api/upload  鉴权：上传图片（base64），存入 D1 kv（img:<name>）
import { json, requireAuth, kvSet } from "../lib.js";

export async function onRequestPost({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未授权，请先登录" }, 401);
  let b;
  try { b = await request.json(); } catch { return json({ error: "无效的请求" }, 400); }
  const { name, dataUrl } = b || {};
  if (!name || !dataUrl || !/^data:image\//.test(dataUrl)) {
    return json({ error: "无效的图片数据" }, 400);
  }
  const m = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!m) return json({ error: "无法解析图片" }, 400);
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const safe = String(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  const finalName = safe.replace(/\.[^.]+$/, "") + "." + ext;
  // 直接存储完整 dataURL（含前缀），读取时解析回二进制
  await kvSet(env.TKF_DB, "img:" + finalName, dataUrl);
  return json({ ok: true, url: "/api/img/" + finalName });
}
