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

## 九、绑定自定义一级域名（如 pt-tkf.top）

本项目的 Pages 项目名为 `pt-tkf`，默认域名为 `pt-tkf.pages.dev`。要使用你自己的一级域名（如 `pt-tkf.top`），按下面步骤操作，无需改动代码（代码使用同源相对路径 `/api/...`、`/admin`）。

> 根域（apex，如 `pt-tkf.top`）要生效，域名必须交由 **Cloudflare 托管**（把 NS 指向 Cloudflare）。仅加 CNAME 的方式不支持根域。

### 情形 A：域名已在 Cloudflare 托管（推荐）
1. Cloudflare 控制台 → 左侧 **Workers & Pages** → 选择 **pt-tkf** 项目。
2. 进入 **Custom domains（自定义域）** → 点击 **Set up a domain / 添加自定义域**。
3. 输入 `pt-tkf.top` 并确认。Cloudflare 会自动：
   - 添加根域的 `A` / `AAAA` 记录指向 Pages；
   - 自动签发并续期 SSL 证书。
4. 几分钟后访问 `https://pt-tkf.top` 即可（证书生效可能需几分钟到数小时，状态从 Pending 变 Active）。

### 情形 B：域名在其它注册商（阿里云 / 腾讯云 / NameSilo 等）
1. Cloudflare 控制台 **Add a Site（添加站点）** 输入 `pt-tkf.top`，选 Free 套餐。
2. Cloudflare 会给出两个 NS 服务器（如 `xxx.ns.cloudflare.com` / `yyy.ns.cloudflare.com`）。
3. 到域名注册商后台，把该域名的 **Name Server (NS)** 改为 Cloudflare 提供的两个并保存。
4. 回到 Cloudflare 等待 NS 生效（通常几分钟，最长 24–48 小时），站点状态变为 Active。
5. 然后按【情形 A】第 2–4 步，在 Pages 项目里添加自定义域 `pt-tkf.top`。

### 注意事项
- 后台登录态（localStorage 的 token）与 `pt-tkf.pages.dev` 是不同源，请改用 `https://pt-tkf.top/admin` **重新登录一次**。
- D1 数据库、密钥绑定都是项目级，切换域名 **不影响已存数据**，无需迁移。
- 如需同时支持 `www.pt-tkf.top`：在 Custom domains 里再加一条 `www.pt-tkf.top`；或设「根域 → www」重定向（Cloudflare 的 Redirect Rules）。
- 旧域名 `pt-tkf.pages.dev` 仍可继续访问，两者指向同一份部署。
