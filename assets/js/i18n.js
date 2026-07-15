// ===== PT-TKF 内容兜底数据 / Fallback content =====
// 当后台服务（/api/content）不可用时，前台使用此处内置内容。
// 默认内容统一维护在 data/content.js（与后台种子同源，单一权威源），本文件仅引用并挂到 window。
import { DEFAULT_CONTENT } from "../../data/content.js";
window.DEFAULT_CONTENT = DEFAULT_CONTENT;
