// ===== PT-TKF 主逻辑 / Main logic =====
(function () {
  "use strict";

  const STORAGE_KEY = "pt-tkf-lang";
  const SUPPORTED = ["zh", "id", "en"];
  let currentLang = localStorage.getItem(STORAGE_KEY) || "zh";

  // 将相对路径转为基于站点根的绝对路径，确保任何子路径下图片都能正确加载
  function absUrl(u) {
    if (!u) return "";
    if (/^(https?:)?\/\//i.test(u) || /^data:/i.test(u) || u.startsWith("/")) return u;
    return "/" + u;
  }

  // 内容来源：优先从后台 /api/content 拉取；失败则使用内置兜底（assets/js/i18n.js）
  let I18N = (window.DEFAULT_CONTENT && window.DEFAULT_CONTENT.i18n) ? window.DEFAULT_CONTENT.i18n : {};
  let BROCHURES = (window.DEFAULT_CONTENT && window.DEFAULT_CONTENT.brochures) ? window.DEFAULT_CONTENT.brochures : [];

  // ---- 渲染动态内容 (grids / stats / contact) ----
  function renderDynamic(lang) {
    const t = I18N[lang];

    // About stats
    const statsEl = document.getElementById("aboutStats");
    if (statsEl) {
      statsEl.innerHTML = t.about.stats.map(s =>
        `<div class="stat-card reveal"><div class="num">${s.num}</div><div class="label">${s.label}</div></div>`
      ).join("");
    }

    // Equipment cards
    const eqEl = document.getElementById("equipmentGrid");
    if (eqEl) {
      eqEl.innerHTML = t.equipment.items.map((it, i) =>
        `<div class="card reveal"><div class="icon">${iconFor(i)}</div><h3>${it.name}</h3><span class="en">${it.en}</span><p>${it.desc}</p></div>`
      ).join("");
    }

    // Services cards
    const svEl = document.getElementById("servicesGrid");
    if (svEl) {
      svEl.innerHTML = t.services.items.map((it, i) =>
        `<div class="card reveal"><div class="icon">${iconFor(i + 10)}</div><h3>${it.name}</h3><p>${it.desc}</p></div>`
      ).join("");
    }

    // Advantages
    const adEl = document.getElementById("advantagesGrid");
    if (adEl) {
      adEl.innerHTML = t.advantages.items.map((it, i) =>
        `<div class="adv-item reveal"><div class="adv-icon">${advIconFor(i)}</div><h4>${it.name}</h4><p>${it.desc}</p></div>`
      ).join("");
    }

    // Projects
    const prEl = document.getElementById("projectsGrid");
    if (prEl) {
      prEl.innerHTML = t.projects.items.map((it, i) =>
        `<div class="card reveal"><div class="icon">${iconFor(i + 20)}</div><h3>${it.name}</h3><p>${it.desc}</p></div>`
      ).join("");
    }

    // Brochures
    renderBrochures(lang);

    // Contact info
    setText("cAddress", t.contact.address);
    setText("fAddress", t.contact.address);
    const phoneEl = document.getElementById("cPhone");
    if (phoneEl) { phoneEl.textContent = t.contact.phone; phoneEl.href = "tel:" + t.contact.phone.replace(/\s/g, ""); }
    setText("fPhone2", t.contact.phone);
    const emailEl = document.getElementById("cEmail");
    if (emailEl) { emailEl.textContent = t.contact.email; emailEl.href = "mailto:" + t.contact.email; }
    setText("fEmail2", t.contact.email);
    const waEl = document.getElementById("cWhatsapp");
    if (waEl) { waEl.textContent = t.contact.whatsapp; waEl.href = "https://wa.me/" + t.contact.whatsapp.replace(/\D/g, ""); }

    observeReveals();
  }

  // ---- 渲染宣传册 ----
  function renderBrochures(lang) {
    const t = I18N[lang];
    const grid = document.getElementById("brochureGrid");
    if (!grid) return;
    grid.innerHTML = BROCHURES.map((b, i) => `
      <div class="brochure-card reveal">
        <button class="brochure-img" data-zoom="${i}" aria-label="放大查看 ${b.model}">
          <img src="${absUrl(b.img)}" alt="${b.model}" loading="lazy" />
          <span class="zoom-hint">${t.brochures.zoom}</span>
        </button>
        <div class="brochure-body">
          <h3>${b.model}</h3>
          <span class="en">${b.en}</span>
          <p>${t.brochures.descs[b.model] || ""}</p>
          <a class="btn btn-primary brochure-btn" href="${b.pdf}" download>${t.brochures.download}</a>
        </div>
      </div>`).join("");
  }

  // ---- 应用语言到带 data-i18n 的元素 ----
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    if (I18N[lang].dir) document.documentElement.dir = I18N[lang].dir;

    // 文本节点
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = getByPath(I18N[lang], key);
      if (val !== undefined) el.textContent = val;
    });
    // 占位符
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      const key = el.getAttribute("data-i18n-ph");
      const val = getByPath(I18N[lang], key);
      if (val !== undefined) el.placeholder = val;
    });

    // 语言按钮高亮
    document.querySelectorAll(".lang-btn").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });

    renderDynamic(lang);
    document.title = "PT-TKF | " + I18N[lang].hero.subtitle;
  }

  // ---- 工具函数 ----
  function getByPath(obj, path) {
    return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  function iconFor(i) {
    const icons = ["🛠️", "⚙️", "🏗️", "🚚", "🔩", "📐", "🚧", "🌉", "🏢", "🏭", "🔧", "📋", "🤝", "📞"];
    return icons[i % icons.length];
  }
  function advIconFor(i) {
    const icons = ["🚜", "👷", "✅", "🛡️"];
    return icons[i % icons.length];
  }

  // ---- 滚动揭示动画 ----
  let observer;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(el => el.classList.add("show"));
      return;
    }
    if (observer) observer.disconnect();
    observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("show"); observer.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal:not(.show)").forEach(el => observer.observe(el));
  }

  // ---- 导航栏滚动阴影 + 移动菜单 ----
  function initNav() {
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 20);
    });
    const toggle = document.getElementById("menuToggle");
    const links = document.getElementById("navLinks");
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
  }

  // ---- 语言切换事件 ----
  function initLangSwitch() {
    document.querySelectorAll(".lang-btn").forEach(btn => {
      btn.addEventListener("click", () => applyLanguage(btn.getAttribute("data-lang")));
    });
  }

  // ---- 图片放大灯箱 (Lightbox) ----
  let lightboxIndex = 0;
  function initLightbox() {
    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightboxImg");
    const lbCap = document.getElementById("lightboxCaption");
    if (!lb) return;

    function show(i) {
      lightboxIndex = (i + BROCHURES.length) % BROCHURES.length;
      const b = BROCHURES[lightboxIndex];
      lbImg.src = absUrl(b.img);
      lbImg.alt = b.model;
      lbCap.textContent = b.model + " · " + b.en;
    }
    function open(i) { show(i); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
    function close() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }

    // 代理点击：任意宣传册图片均可打开
    document.getElementById("brochureGrid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-zoom]");
      if (btn) open(parseInt(btn.getAttribute("data-zoom"), 10));
    });
    document.getElementById("lightboxClose").addEventListener("click", close);
    document.getElementById("lightboxPrev").addEventListener("click", () => show(lightboxIndex - 1));
    document.getElementById("lightboxNext").addEventListener("click", () => show(lightboxIndex + 1));
    // 点击背景关闭
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    // ESC 关闭
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && lb.classList.contains("open")) close(); });
  }

  // ---- 联系表单（优先提交到后台，失败则 mailto 兜底） ----
  function initForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const statusEl = document.getElementById("formStatus");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("fName").value.trim();
      const phone = document.getElementById("fPhone").value.trim();
      const msg = document.getElementById("fMsg").value.trim();
      if (!name || !msg) { form.reportValidity(); return; }

      // 方式一：提交到后台留言系统（推荐，可在后台管理查看）
      try {
        const r = await fetch("/api/inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, message: msg, lang: currentLang })
        });
        if (r.ok) {
          form.reset();
          if (statusEl) { statusEl.textContent = "✓ 您的咨询已发送，我们会尽快与您联系！"; statusEl.className = "form-status ok"; }
          return;
        }
      } catch (err) { /* 网络异常，走邮件兜底 */ }

      // 方式二：兜底——唤起访客邮件客户端
      const email = I18N[currentLang].contact.email;
      const subject = encodeURIComponent("PT-TKF Inquiry from " + name);
      const body = encodeURIComponent(`Name: ${name}\nPhone/WhatsApp: ${phone}\n\n${msg}`);
      if (statusEl) { statusEl.textContent = "正在打开邮件客户端…"; statusEl.className = "form-status"; }
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    });
  }

  // ---- 从后台拉取最新内容（无缝降级到内置兜底） ----
  async function loadContent() {
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.i18n) I18N = data.i18n;
        if (data && Array.isArray(data.brochures)) BROCHURES = data.brochures;
      }
    } catch (e) { /* 使用内置兜底内容 */ }
  }

  // ---- 初始化 ----
  document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    initNav();
    initLangSwitch();
    initLightbox();
    initForm();
    await loadContent();
    applyLanguage(currentLang);
    observeReveals();
  });
})();
