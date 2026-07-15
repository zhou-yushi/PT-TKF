// POST /api/upload  鉴权：上传图片（base64）。优先存入 R2，未绑定 R2 时回退 D1（kv: img:<name>）
import { json, requireAuth, kvSet, parseDataUrl } from "../lib.js";

export async function onRequestPost({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未授权，请先登录" }, 401);
  let b;
  try { b = await request.json(); } catch { return json({ error: "无效的请求" }, 400); }
  const { name, dataUrl } = b || {};
  if (!name || !dataUrl || !/^data:image\//.test(dataUrl)) {
    return json({ error: "无效的图片数据" }, 400);
  }
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return json({ error: "无法解析图片" }, 400);
  const { mime, ext, bin } = parsed;
  const safe = String(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  const finalName = safe.replace(/\.[^.]+$/, "") + "." + ext;
  const key = "brochures/" + finalName;

  if (env.TKF_BUCKET) {
    // 主路径：存入 R2 桶（适合存二进制大对象）
    await env.TKF_BUCKET.put(key, bin, { httpMetadata: { contentType: mime } });
  } else {
    // 回退：未配置 R2 时存入 D1（兼容本地调试）
    await kvSet(env.TKF_DB, "img:" + finalName, dataUrl);
  }
  return json({ ok: true, url: "/api/img/" + finalName });
}
