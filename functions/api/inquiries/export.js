// GET /api/inquiries/export  鉴权：导出 CSV
import { json, requireAuth } from "../../lib.js";

export async function onRequestGet({ request, env }) {
  if (!(await requireAuth(request, env))) return json({ error: "未授权，请先登录" }, 401);
  const { results } = await env.TKF_DB.prepare(
    "SELECT id, name, phone, message, lang, time, read FROM inquiries ORDER BY time DESC"
  ).all();
  const list = results || [];
  const langName = { zh: "中文", id: "印尼语", en: "英语" };
  const esc = s => '"' + (s == null ? "" : String(s).replace(/"/g, '""')) + '"';
  const header = ["时间", "语言", "姓名", "电话", "需求", "状态"];
  const rows = list.map(x => [
    new Date(x.time).toLocaleString("zh-CN"),
    langName[x.lang] || x.lang,
    x.name, x.phone || "", x.message,
    x.read ? "已读" : "未读"
  ]);
  const csv = "﻿" + [header, ...rows].map(r => r.map(esc).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename=inquiries.csv'
    }
  });
}
