-- PT-TKF D1 数据库结构
-- 用法：
--   本地： wrangler d1 execute pt-tkf-db --local --file=db/schema.sql
--   远程： wrangler d1 execute pt-tkf-db --file=db/schema.sql

-- 通用键值表（模拟 KV）：存放 content / config / 上传图片(dataURL)
CREATE TABLE IF NOT EXISTS kv (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL
);

-- 联系表单留言
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  message TEXT,
  lang TEXT,
  time TEXT,
  read INTEGER DEFAULT 0
);
