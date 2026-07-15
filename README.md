# PT-TKF 官方网站

PT-TKF 是一家印度尼西亚基础施工公司，专注于旋挖钻孔灌注桩（Rotary Drilling / Bored Pile）工程。
本仓库为其中文 / 印尼文 / 英文三语企业官网，**纯静态站点**，可直接部署到 Cloudflare Pages。

## 项目结构

```
My-TKF/
├── index.html              # 主页面（所有内容由 JS 按语言渲染）
├── assets/
│   ├── css/style.css       # 样式
│   ├── js/
│   │   ├── i18n.js         # 三语言内容字典（在此修改文案）
│   │   └── main.js         # 语言切换、动态渲染、交互逻辑
│   └── img/                # 各型号展示图片与首页背景图（JPG 格式）
│       ├── 110.jpg  125.jpg  300.jpg  360.jpg
│       └── hero-jakarta.jpg
├── _headers                # Cloudflare Pages 缓存与安全头
└── README.md
```

## 本地预览

任意静态服务器即可，例如：

```bash
# 方式一：Python
python -m http.server 8080

# 方式二：Node
npx serve .
```

然后浏览器访问 `http://localhost:8080`。

## 部署到 Cloudflare Pages

### 方式一：Git 关联（推荐，支持自动更新）
1. 将本仓库推送到 GitHub / GitLab。
2. 登录 Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → 连接仓库。
3. 构建设置：
   - **Framework preset**: `None`
   - **Build command**: 留空
   - **Build output directory**: `/`（根目录，即仓库根）
4. 点击 **Save and Deploy**。

### 方式二：直接拖拽上传
1. 将整个 `My-TKF` 文件夹压缩，或在 Cloudflare Pages 控制台选择 **Upload assets / Drag & drop**。
2. 把仓库内所有文件（含 `index.html`、`assets` 等）拖入上传区即可。

### 自定义域名
在 Cloudflare Pages 项目 → **Custom domains** 中添加你的域名（如 `www.pt-tkf.com`），按提示在域名 DNS 处添加 CNAME 记录。

## 修改内容

> **推荐方式：使用后台管理系统**（见下方「内容管理后台」），无需改代码即可在线修改全部文案、联系方式和宣传册型号/图片。

- 文案与结构化内容的**默认种子（单一权威源）**统一维护在 **`data/content.js`**；后台「保存更改」会写入 D1（`TKF_DB` 的 `content` 键值），前台从 `/api/content` 读取 D1 作为**运行时真相**。
- `assets/js/i18n.js` 仅作为**静态兜底**：当后台服务不可用时（例如直接以纯静态方式部署），前台会使用其中内置的内容。

### 本地内容管理后台

项目内置一个轻量后台（Node + Express），可对前台所有内容进行可视化编辑：

```bash
npm install        # 安装依赖（express）
npm start          # 启动服务
```

启动后访问：

- 前台网站：<http://localhost:8080>
- 后台管理：<http://localhost:8080/admin>

后台默认密码 `13621977041@iloveyou`，可用环境变量覆盖：

```bash
ADMIN_PASSWORD=你的密码 npm start
```

后台功能：

- 顶部切换 **中文 / Indonesia / English**，分别编辑三语文案；
- 分板块编辑：导航、首屏、关于我们、设备实力、宣传册文案、业务范围、优势、工程案例、联系我们、页脚；
- 列表类（数据统计、设备、业务、优势、案例）可**增删条目**；
- **宣传册型号与图片**：可增删型号、修改英文名，并直接**上传展示图片**；
- 点击「保存更改」即写入 D1（`TKF_DB` 的 `content` 键值），前台刷新即生效。

> 注意：令牌保存在服务器内存中，重启服务后需重新登录；图片上传保存到 `assets/img/`。

### 仍想直接改文件？

- **文案翻译**：编辑 `data/content.js` 中 `i18n` 的 `zh` / `id` / `en` 三个对象（这是默认种子；线上已保存内容请在后台修改并保存）。
- **联系方式**：同文件中 `contact` 部分修改地址、电话、邮箱、WhatsApp。
- **宣传册（图片展示）**：`brochures` 数组维护型号→图片映射；各型号描述在 `i18n.*.brochures.descs` 中。
- **配图**：`assets/css/style.css` 中 `.hero-bg` 使用了 Unsplash 图片，可替换为你公司的实景照片（建议放到 `assets/img/` 并改为本地路径，避免外链失效）。
- **新增语言**：在 `data/content.js` 的 `i18n` 增加语言对象，并在 `index.html` 的语言切换栏与 `assets/js/main.js` 的 `SUPPORTED` 中补充。

> 说明：联系表单采用 `mailto:` 方式提交（无需后端），用户提交后会唤起其邮件客户端；也可直接通过 WhatsApp 联系。

### 部署说明（含后台）

- **仅静态站点**（无后台）：直接拖拽到 Cloudflare Pages 即可，前台使用 `i18n.js` 内置兜底内容，但**无法在线编辑**。
- **带后台部署**：需运行 Node 服务（如 CloudBase / 任意云服务器 / 容器）。将整个仓库部署到支持 Node 的环境，`npm install && npm start`，并用环境变量设置 `ADMIN_PASSWORD` 与 `PORT`。前台通过 `/api/content` 读取最新内容。
# PT-TKF
