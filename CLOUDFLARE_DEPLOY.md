# PT-TKF 部署到 Cloudflare Pages（原生方案）

本项目后端已改造为 **Cloudflare Pages Functions + 单一 D1 数据库**，无需 Node 服务器。
所有动态能力（留言、后台登录、内容编辑、翻译、图片上传）均运行在 Cloudflare 边缘。

## 架构

| 能力 | 实现 |
|------|------|
| 静态站点（前台/后台页面） | Cloudflare Pages 静态托管 |
| API 接口 | `functions/api/*.js`（Pages Functions） |
| 数据存储 | 单一 D1 数据库 `pt-tkf-db`：<br>• `kv` 表：内容、翻译配置、上传图片（dataURL）<br>• `inquiries` 表：联系表单留言 |
| 后台鉴权 | 无状态 HMAC 签名令牌（7 天有效，登出可撤销） |
| 敏感信息 | 密码/密钥走环境变量（Secret），不入库、不入 git |

> 注：你之前选的「方案2（KV/D1）」这里统一用 **D1** 承载（即「方案B」），只需一个数据库绑定。

## 一、准备

```bash
npm install -g wrangler
wrangler login        # 浏览器授权，登录到 zhou-yushi 账号
```

## 二、创建 D1 数据库

```bash
wrangler d1 create pt-tkf-db
```

命令会输出 `database_id`，把它填进 `wrangler.toml` 里的 `database_id`（替换 `REPLACE_WITH_YOUR_D1_DATABASE_ID`）。

建表（远程）：

```bash
wrangler d1 execute pt-tkf-db --file=db/schema.sql
```

（本地调试可加 `--local`。）

## 三、配置密钥 / 环境变量

在 Cloudflare 控制台 **Pages → pt-tkf → Settings → Environment variables** 添加：

| 名称 | 类型 | 说明 |
|------|------|------|
| `ADMIN_PASSWORD` | Secret | 后台登录密码（必填） |
| `AUTH_SECRET` | Secret | 令牌签名密钥，随便一段随机串，例如 `openssl rand -hex 32` |
| `TRANSLATE_PROVIDER` | 变量（可选） | 默认 `google` |

> 也可用 `wrangler pages secret put --project-name pt-tkf ADMIN_PASSWORD` 设置 Secret。

## 四、绑定 D1

控制台 **Pages → pt-tkf → Settings → Functions → D1 database bindings**：
- 变量名（Binding name）：`TKF_DB`
- 数据库：`pt-tkf-db`

（这样 `functions/` 里的代码就能通过 `env.TKF_DB` 访问数据库。）

## 五、部署

在控制台 **Pages → Create a project → Connect to Git → 选 `zhou-yushi/PT-TKF`**：
- **Build command**：留空
- **Output directory**：`/`（仓库根目录，静态资源所在）

保存并部署。之后每次 `git push` 到 `main` 会自动重新部署。

> 也可以本地预览：`wrangler pages dev --binding TKF_DB=pt-tkf-db .`（需先在 wrangler.toml 配好 database_id）。

## 六、首次使用

1. 打开 `https://<你的域名>/admin`，用 `ADMIN_PASSWORD` 登录。
2. 内容已内置种子数据（`functions/defaults.js`），可直接编辑后点「保存更改」，即写入 D1。
3. 翻译功能：默认使用 Google 免费引擎，无需任何 Key；备用引擎 MyMemory 同样免费。
4. 前台联系表单提交后会进入 D1，后台「留言管理」可查看/标记/删除/导出。

## 七、数据迁移说明

- 你之前在本地 `server.js` 下编辑过的内容（`data/content.json`）已作为种子内置，**无需迁移**；登录后台点一次「保存更改」即持久化到 D1。
- 本地 `server.js` 仍保留，仅供本机 `node server.js` 调试，**不会被 Pages 运行**。
- 已上传的历史图片在 `assets/` 静态目录，照常访问；新上传图片存入 D1，由 `/api/img/<name>` 提供。

## 八、本地调试

```bash
# 建本地 D1 并建表
wrangler d1 execute pt-tkf-db --local --file=db/schema.sql
# 启动本地 Pages（含 Functions）
wrangler pages dev --binding TKF_DB=pt-tkf-db .
```
