// ===== PT-TKF 后台逻辑 =====
(function () {
  "use strict";

  const LANGS = [
    { code: "zh", name: "中文" },
    { code: "id", name: "Indonesia" },
    { code: "en", name: "English" }
  ];

  // 各板块的可编辑字段（按当前语言渲染）
  const SCHEMA = [
    { id: "nav", title: "导航菜单", fields: [
      { key: "home", label: "首页" }, { key: "about", label: "关于我们" },
      { key: "equipment", label: "设备实力" }, { key: "brochures", label: "产品宣传册" },
      { key: "services", label: "业务范围" }, { key: "projects", label: "工程案例" },
      { key: "contact", label: "联系我们" }
    ]},
    { id: "hero", title: "首屏 Hero", fields: [
      { key: "badge", label: "徽章" }, { key: "title", label: "主标题" },
      { key: "subtitle", label: "副标题" }, { key: "desc", label: "描述", type: "textarea" },
      { key: "cta1", label: "按钮一" }, { key: "cta2", label: "按钮二" }
    ]},
    { id: "about", title: "关于我们", fields: [
      { key: "title", label: "标题" }, { key: "subtitle", label: "副标题" },
      { key: "p1", label: "段落一", type: "textarea" }, { key: "p2", label: "段落二", type: "textarea" }
    ], arrays: [
      { key: "stats", title: "数据统计", fields: [ { key: "num", label: "数值" }, { key: "label", label: "标签" } ] }
    ]},
    { id: "equipment", title: "设备实力", fields: [
      { key: "title", label: "标题" }, { key: "subtitle", label: "副标题" }
    ], arrays: [
      { key: "items", title: "设备项", fields: [ { key: "name", label: "名称" }, { key: "en", label: "英文名" }, { key: "desc", label: "描述", type: "textarea" } ] }
    ]},
    { id: "brochures", title: "宣传册文案", fields: [
      { key: "title", label: "标题" }, { key: "subtitle", label: "副标题" },
      { key: "download", label: "下载按钮" }, { key: "zoom", label: "放大提示" }
    ], descs: true },
    { id: "services", title: "业务范围", fields: [
      { key: "title", label: "标题" }, { key: "subtitle", label: "副标题" }
    ], arrays: [
      { key: "items", title: "业务项", fields: [ { key: "name", label: "名称" }, { key: "desc", label: "描述", type: "textarea" } ] }
    ]},
    { id: "advantages", title: "为什么选择我们", fields: [
      { key: "title", label: "标题" }
    ], arrays: [
      { key: "items", title: "优势项", fields: [ { key: "name", label: "名称" }, { key: "desc", label: "描述", type: "textarea" } ] }
    ]},
    { id: "projects", title: "工程案例", fields: [
      { key: "title", label: "标题" }, { key: "subtitle", label: "副标题" }
    ], arrays: [
      { key: "items", title: "案例项", fields: [ { key: "name", label: "名称" }, { key: "desc", label: "描述", type: "textarea" } ] }
    ]},
    { id: "contact", title: "联系我们", fields: [
      { key: "title", label: "标题" }, { key: "subtitle", label: "副标题" },
      { key: "company", label: "公司名" }, { key: "addressLabel", label: "地址标签" },
      { key: "address", label: "地址" }, { key: "phoneLabel", label: "电话标签" },
      { key: "phone", label: "电话" }, { key: "emailLabel", label: "邮箱标签" },
      { key: "email", label: "邮箱" }, { key: "whatsappLabel", label: "WhatsApp标签" },
      { key: "whatsapp", label: "WhatsApp" }, { key: "formName", label: "表单-姓名" },
      { key: "formPhone", label: "表单-电话" }, { key: "formMsg", label: "表单-需求" },
      { key: "formSubmit", label: "表单-提交" }, { key: "formNote", label: "表单-说明", type: "textarea" }
    ]},
    { id: "footer", title: "页脚", fields: [
      { key: "desc", label: "描述", type: "textarea" }, { key: "quickLinks", label: "快速导航标题" },
      { key: "contactUs", label: "联系我们标题" }, { key: "rights", label: "版权文字" },
      { key: "built", label: "建设标语" }
    ]}
  ];

  let token = localStorage.getItem("pt-tkf-token") || "";
  let state = null;
  let lang = "zh";

  const $ = (id) => document.getElementById(id);

  function getVal(path) {
    return path.reduce((o, k) => (o && o[k] !== undefined ? o[k] : ""), state);
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  // 将图片相对路径转为基于站点根的绝对路径（后台位于 /admin 子路径，必须用绝对路径）
  function absUrl(u) {
    if (!u) return "";
    if (/^(https?:)?\/\//i.test(u) || /^data:/i.test(u) || u.startsWith("/")) return u;
    return "/" + u;
  }

  // ---------- 登录 ----------
  async function doLogin() {
    const pwd = $("pwd").value;
    const r = await fetch("/api/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwd })
    });
    const d = await r.json();
    if (r.ok) {
      token = d.token;
      localStorage.setItem("pt-tkf-token", token);
      enterApp();
    } else {
      $("loginErr").textContent = d.error || "登录失败";
    }
  }

  async function enterApp() {
    const r = await fetch("/api/content");
    state = await r.json();
    $("login").classList.add("hidden");
    $("app").classList.remove("hidden");
    renderLangTabs();
    render();
    loadConfig();
    loadInquiryBadge();
  }

  // ---------- 语言切换 ----------
  function renderLangTabs() {
    $("langTabs").innerHTML = LANGS.map(l =>
      `<button data-lang="${l.code}" class="${l.code === lang ? "active" : ""}">${l.name}</button>`
    ).join("");
  }

  // ---------- 渲染表单 ----------
  function render() {
    let html = "";
    SCHEMA.forEach(sec => { html += renderSection(sec); });
    html += renderBrochureMeta();
    const area = $("contentArea");
    area.innerHTML = html;
    bindArea(area);
  }

  function renderSection(sec) {
    const L = state.i18n[lang] || {};
    const secData = L[sec.id] || {};
    let body = "";

    (sec.fields || []).forEach(f => {
      const val = secData[f.key] != null ? secData[f.key] : "";
      body += fieldHtml(f.label, f.type || "text", val, `data-sec="${sec.id}" data-key="${f.key}"`);
    });

    (sec.arrays || []).forEach(arr => {
      const items = (secData[arr.key] || []);
      let arrHtml = `<div style="margin-top:8px">`;
      items.forEach((it, idx) => {
        arrHtml += `<div class="array-item"><button class="del-btn" data-action="del-arr" data-sec="${sec.id}" data-arr="${arr.key}" data-idx="${idx}">删除</button>`;
        arrHtml += `<div class="item-title">${esc(arr.title)} #${idx + 1}</div>`;
        arr.fields.forEach(f => {
          const v = it[f.key] != null ? it[f.key] : "";
          arrHtml += fieldHtml(f.label, f.type || "text", v,
            `data-sec="${sec.id}" data-arr="${arr.key}" data-idx="${idx}" data-fkey="${f.key}"`);
        });
        arrHtml += `</div>`;
      });
      arrHtml += `<button class="add-btn" data-action="add-arr" data-sec="${sec.id}" data-arr="${arr.key}">+ 添加${esc(arr.title)}</button></div>`;
      body += arrHtml;
    });

    if (sec.descs) {
      const descs = (secData.descs) || {};
      const models = (state.brochures || []).map(b => b.model).filter(Boolean);
      let dHtml = `<div style="margin-top:10px"><div class="item-title">各型号描述</div>`;
      models.forEach(m => {
        const v = descs[m] != null ? descs[m] : "";
        dHtml += fieldHtml(m, "textarea", v, `data-desc="${esc(m)}"`);
      });
      if (!models.length) dHtml += `<p class="hint">请先在下方“宣传册型号与图片”中添加型号。</p>`;
      dHtml += `</div>`;
      body += dHtml;
    }

    return `<section class="section-card"><div class="section-head"><h2>${esc(sec.title)}</h2></div><div class="section-body">${body}</div></section>`;
  }

  function fieldHtml(label, type, val, attrs) {
    const v = esc(val);
    if (type === "textarea") {
      return `<div class="field"><label>${esc(label)}</label><textarea ${attrs}>${v}</textarea></div>`;
    }
    return `<div class="field"><label>${esc(label)}</label><input type="text" value="${v}" ${attrs} /></div>`;
  }

  function renderBrochureMeta() {
    const list = state.brochures || [];
    let body = "";
    list.forEach((b, idx) => {
      const img = b.img || "";
      body += `
        <div class="bro-card">
          <img class="bro-thumb" id="bro-thumb-${idx}" src="${esc(absUrl(img))}" alt="" />
          <div class="bro-fields">
            <button class="del-btn" data-action="del-bro" data-idx="${idx}">删除</button>
            <div class="field"><label>型号 (Model)</label><input type="text" value="${esc(b.model || "")}" data-bro="model" data-idx="${idx}" /></div>
            <div class="field"><label>英文名</label><input type="text" value="${esc(b.en || "")}" data-bro="en" data-idx="${idx}" /></div>
            <div class="field"><label>图片路径 / 上传</label>
              <input type="text" id="bro-img-${idx}" value="${esc(img)}" data-bro="img" data-idx="${idx}" />
              <button class="upload-btn" data-bro-idx="${idx}">上传图片</button>
              <input type="file" accept="image/*" class="bro-file" data-bro-idx="${idx}" hidden />
            </div>
            <div class="field"><label>PDF 路径</label><input type="text" value="${esc(b.pdf || "")}" data-bro="pdf" data-idx="${idx}" /></div>
          </div>
        </div>`;
    });
    body += `<button class="add-btn" data-action="add-bro">+ 添加宣传册型号</button>`;
    return `<section class="section-card"><div class="section-head"><h2>宣传册型号与图片</h2></div><div class="section-body">${body}</div></section>`;
  }

  // ---------- 事件绑定 ----------
  function bindArea(area) {
    area.addEventListener("input", onInput);
    area.addEventListener("click", onClick);
    area.querySelectorAll(".upload-btn").forEach(btn => {
      const idx = btn.getAttribute("data-bro-idx");
      const file = area.querySelector(`.bro-file[data-bro-idx="${idx}"]`);
      btn.addEventListener("click", () => file.click());
      file.addEventListener("change", () => onUpload(idx, file));
    });
  }

  function onInput(e) {
    const t = e.target;
    if (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") return;
    const v = t.value;

    if (t.hasAttribute("data-desc")) {
      const m = t.getAttribute("data-desc");
      state.i18n[lang].brochures.descs = state.i18n[lang].brochures.descs || {};
      state.i18n[lang].brochures.descs[m] = v;
      markSourceLang();
      return;
    }
    if (t.hasAttribute("data-bro")) {
      const idx = +t.getAttribute("data-idx");
      const key = t.getAttribute("data-bro");
      if (key === "img") {
        const thumb = $("bro-thumb-" + idx);
        if (thumb) thumb.src = absUrl(v);
      }
      state.brochures[idx][key] = v;
      return;
    }
    if (t.hasAttribute("data-arr")) {
      const sec = t.getAttribute("data-sec");
      const arr = t.getAttribute("data-arr");
      const idx = +t.getAttribute("data-idx");
      const fkey = t.getAttribute("data-fkey");
      state.i18n[lang][sec][arr][idx][fkey] = v;
      markSourceLang();
      return;
    }
    if (t.hasAttribute("data-sec")) {
      const sec = t.getAttribute("data-sec");
      const key = t.getAttribute("data-key");
      state.i18n[lang][sec][key] = v;
      markSourceLang();
      return;
    }
  }

  function onClick(e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    if (action === "add-arr") addArrayItem(btn.getAttribute("data-sec"), btn.getAttribute("data-arr"));
    else if (action === "del-arr") removeArrayItem(btn.getAttribute("data-sec"), btn.getAttribute("data-arr"), +btn.getAttribute("data-idx"));
    else if (action === "add-bro") { state.brochures.push({ model: "", en: "", img: "", pdf: "" }); render(); }
    else if (action === "del-bro") { state.brochures.splice(+btn.getAttribute("data-idx"), 1); render(); }
  }

  function addArrayItem(sec, arr) {
    LANGS.forEach(l => {
      const node = state.i18n[l.code][sec][arr];
      const def = (SCHEMA.find(s => s.id === sec).arrays.find(a => a.key === arr).fields)
        .reduce((o, f) => (o[f.key] = "", o), {});
      node.push(def);
    });
    render();
  }
  function removeArrayItem(sec, arr, idx) {
    LANGS.forEach(l => { state.i18n[l.code][sec][arr].splice(idx, 1); });
    render();
  }

  async function onUpload(idx, fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const r = await fetch("/api/upload", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ name: file.name, dataUrl: reader.result })
      });
      const d = await r.json();
      if (r.ok) {
        state.brochures[idx].img = d.url;
        $("bro-img-" + idx).value = d.url;
        $("bro-thumb-" + idx).src = absUrl(d.url);
      } else {
        alert("上传失败: " + (d.error || ""));
      }
    };
    reader.readAsDataURL(file);
  }

  // ---------- 保存 ----------
  async function save() {
    setSaveState("正在保存…", "");
    // 清理 descs 中已不存在的型号
    const models = (state.brochures || []).map(b => b.model).filter(Boolean);
    LANGS.forEach(l => {
      const descs = state.i18n[l.code].brochures.descs || {};
      Object.keys(descs).forEach(k => { if (!models.includes(k)) delete descs[k]; });
    });

    const r = await fetch("/api/content", {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify(state)
    });
    if (r.ok) {
      setSaveState("✓ 已保存 " + new Date().toLocaleTimeString(), "ok");
    } else if (r.status === 401) {
      setSaveState("登录已失效，请重新登录", "err");
      localStorage.removeItem("pt-tkf-token");
      location.reload();
    } else {
      const d = await r.json().catch(() => ({}));
      setSaveState("保存失败: " + (d.error || r.status), "err");
    }
  }

  function setSaveState(msg, cls) {
    const el = $("saveState");
    el.textContent = msg;
    el.className = "save-state " + (cls || "");
  }

  // ---------- 自动翻译 ----------
  function setTranslateState(msg, cls) {
    const el = $("translateState");
    if (!el) return;
    el.textContent = msg;
    el.className = "translate-state " + (cls || "");
  }

  // 把翻译源语言设为当前正在编辑的语言（随编辑自动更新，也可手动选下拉）
  function markSourceLang() {
    const sl = $("srcLang");
    if (sl) sl.value = lang;
    updateSrcHint();
  }
  // 在翻译栏提示当前将以哪种语言为源翻译另外两种
  function updateSrcHint() {
    const el = $("srcHint");
    if (!el) return;
    const code = $("srcLang").value;
    const name = (LANGS.find(l => l.code === code) || LANGS[0]).name;
    el.textContent = "（将把「" + name + "」翻译到另外两种）";
  }

  async function translateAll() {
    const src = $("srcLang").value;
    const targets = LANGS.map(l => l.code).filter(c => c !== src);
    const srcData = state.i18n[src];
    if (!srcData) { setTranslateState("源语言内容为空", "err"); return; }
    setTranslateState("正在翻译…", "");
    try {
      for (const tgt of targets) {
        const name = LANGS.find(l => l.code === tgt).name;
        setTranslateState("正在翻译到 " + name + "…", "");
        const r = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
          body: JSON.stringify({ source: src, target: tgt, data: srcData, targetData: state.i18n[tgt] || {} })
        });
        const d = await r.json();
        if (r.ok && d.result) {
          state.i18n[tgt] = d.result;
        } else {
          setTranslateState("翻译失败: " + (d.error || r.status), "err");
          return;
        }
      }
      render();
      setTranslateState("✓ 翻译完成，请检查后点“保存更改”", "ok");
    } catch (e) {
      setTranslateState("翻译出错: " + e.message, "err");
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST", headers: { "Authorization": "Bearer " + token } }).catch(() => {});
    localStorage.removeItem("pt-tkf-token");
    location.reload();
  }

  // ---------- 翻译服务设置 ----------
  function setCfgState(msg, cls) {
    const el = $("cfgState");
    if (!el) return;
    el.textContent = msg;
    el.className = "translate-state " + (cls || "");
  }
  async function loadConfig() {
    try {
      const r = await fetch("/api/config", { headers: { "Authorization": "Bearer " + token } });
      if (!r.ok) return;
      const c = await r.json();
      if (c.provider) $("cfgProvider").value = c.provider;
    } catch (e) { /* 忽略 */ }
  }
  async function saveConfig() {
    const payload = {
      provider: $("cfgProvider").value
    };
    setCfgState("正在保存…", "");
    try {
      const r = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(payload)
      });
      const d = await r.json();
      if (r.ok && d.ok) {
        setCfgState("✓ 设置已保存", "ok");
      } else {
        setCfgState("保存失败: " + (d.error || r.status), "err");
      }
    } catch (e) {
      setCfgState("保存出错: " + e.message, "err");
    }
  }

  // ---------- 留言管理（后台查看） ----------
  let view = "content";
  const INQ_LANG = { zh: "中文", id: "印尼语", en: "英语" };

  async function loadInquiryBadge() {
    try {
      const r = await fetch("/api/inquiries", { headers: { "Authorization": "Bearer " + token } });
      if (r.ok) refreshInquiryBadge(await r.json());
    } catch (e) { /* 忽略 */ }
  }
  function refreshInquiryBadge(list) {
    const badge = $("inqBadge");
    if (!badge) return;
    const unread = (list || []).filter(x => !x.read).length;
    if (unread > 0) { badge.textContent = unread; badge.classList.remove("hidden"); }
    else badge.classList.add("hidden");
  }
  async function loadInquiries() {
    const area = $("contentArea");
    area.innerHTML = `<div class="inq-empty">正在加载留言…</div>`;
    try {
      const r = await fetch("/api/inquiries", { headers: { "Authorization": "Bearer " + token } });
      if (r.status === 401) { area.innerHTML = `<div class="inq-empty">登录已失效，请刷新页面</div>`; return; }
      const list = await r.json();
      renderInquiries(list);
    } catch (e) {
      area.innerHTML = `<div class="inq-empty">加载失败：${esc(e.message)}</div>`;
    }
  }
  function renderInquiries(list) {
    refreshInquiryBadge(list);
    const area = $("contentArea");
    if (!list.length) {
      area.innerHTML = `<div class="inq-empty">暂无留言</div>`;
      return;
    }
    const rows = list.map(x => `
      <tr class="${x.read ? "" : "unread"}">
        <td>${esc(new Date(x.time).toLocaleString("zh-CN"))}</td>
        <td>${esc(INQ_LANG[x.lang] || x.lang)}</td>
        <td>${esc(x.name)}</td>
        <td>${esc(x.phone || "—")}</td>
        <td class="inq-msg">${esc(x.message)}</td>
        <td>${x.read ? "已读" : "未读"}</td>
        <td>
          <div class="inq-actions">
            <button data-act="read" data-id="${esc(x.id)}">${x.read ? "标为未读" : "标为已读"}</button>
            <button class="del" data-act="del" data-id="${esc(x.id)}">删除</button>
          </div>
        </td>
      </tr>`).join("");
    area.innerHTML = `
      <div class="inq-toolbar">
        <span class="inq-count">共 ${list.length} 条，未读 ${list.filter(x => !x.read).length} 条</span>
        <button class="inq-btn-refresh" data-act="refresh">刷新</button>
        <button class="inq-btn-export" data-act="export">导出 CSV</button>
      </div>
      <table class="inq-table">
        <thead><tr><th>时间</th><th>语言</th><th>姓名</th><th>电话</th><th>需求</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    area.querySelector(".inq-table").addEventListener("click", onInquiryClick);
    area.querySelector(".inq-toolbar").addEventListener("click", onInquiryTool);
  }
  async function onInquiryClick(e) {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const act = btn.getAttribute("data-act");
    if (act === "read") {
      const row = btn.closest("tr");
      const isUnread = row.classList.contains("unread");
      await fetch(`/api/inquiries/${id}/read`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ read: !isUnread })
      });
      loadInquiries();
    } else if (act === "del") {
      if (!confirm("确定删除该留言？")) return;
      const r = await fetch(`/api/inquiries/${id}`, { method: "DELETE", headers: { "Authorization": "Bearer " + token } });
      if (r.ok) loadInquiries(); else alert("删除失败");
    }
  }
  async function onInquiryTool(e) {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const act = btn.getAttribute("data-act");
    if (act === "refresh") loadInquiries();
    else if (act === "export") {
      try {
        const r = await fetch("/api/inquiries/export", { headers: { "Authorization": "Bearer " + token } });
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "inquiries.csv"; a.click();
        URL.revokeObjectURL(url);
      } catch (err) { alert("导出失败"); }
    }
  }

  // ---------- 初始化 ----------
  function init() {
    $("loginBtn").addEventListener("click", doLogin);
    $("pwd").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
    $("saveBtn").addEventListener("click", save);
    $("logoutBtn").addEventListener("click", logout);
    $("translateBtn").addEventListener("click", translateAll);
    $("srcLang").addEventListener("change", updateSrcHint);
    updateSrcHint();
    $("cfgSaveBtn").addEventListener("click", saveConfig);
    $("viewTabs").addEventListener("click", e => {
      const b = e.target.closest("[data-view]");
      if (!b) return;
      view = b.getAttribute("data-view");
      document.querySelectorAll("#viewTabs button").forEach(x => x.classList.toggle("active", x === b));
      if (view === "inquiries") loadInquiries();
      else render();
    });
    $("langTabs").addEventListener("click", e => {
      const b = e.target.closest("[data-lang]");
      if (b) { lang = b.getAttribute("data-lang"); renderLangTabs(); if (view === "inquiries") loadInquiries(); else render(); }
    });

    if (token) {
      // 验证 token 是否仍然有效
      fetch("/api/content", { headers: { "Authorization": "Bearer " + token } })
        .then(() => enterApp())
        .catch(() => { /* 仍尝试进入（content 公开） */ enterApp(); });
    }
  }

  init();
})();
