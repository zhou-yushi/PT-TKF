// GET /api/img/:name  公开：从 D1 kv（img:<name>，dataURL 形式）回读图片二进制
import { kvGet } from "../../lib.js";

export async function onRequestGet({ params, env }) {
  const row = await kvGet(env.TKF_DB, "img:" + params.name);
  if (!row) return new Response("Not found", { status: 404 });
  const m = /^data:(image\/\w+);base64,(.+)$/.exec(row);
  if (!m) return new Response("Invalid image", { status: 500 });
  const mime = m[1];
  const bin = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
  return new Response(bin, {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
