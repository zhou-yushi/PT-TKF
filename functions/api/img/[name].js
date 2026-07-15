// GET /api/img/:name  公开：优先从 R2 读取；未绑定 R2 或 R2 未命中时，回退 D1（kv: img:<name>，旧 dataURL）
import { kvGet } from "../../lib.js";

export async function onRequestGet({ params, env }) {
  const key = "brochures/" + params.name;

  // 主路径：从 R2 读取（生产环境）
  if (env.TKF_BUCKET) {
    const obj = await env.TKF_BUCKET.get(key);
    if (obj) {
      return new Response(obj.body, {
        headers: {
          "Content-Type": obj.httpMetadata?.contentType || "image/*",
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    }
  }

  // 回退：未绑定 R2，或 R2 中尚无该文件（兼容迁移期旧数据）时，从 D1 读取 base64
  const row = await kvGet(env.TKF_DB, "img:" + params.name);
  if (!row) return new Response("Not found", { status: 404 });
  const m = /^data:(image\/\w+);base64,(.+)$/.exec(row);
  if (!m) return new Response("Invalid image", { status: 500 });
  const bin = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
  return new Response(bin, {
    headers: {
      "Content-Type": m[1],
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
