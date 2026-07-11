// ===== PT-TKF 种子/兜底内容 =====
// 当 D1 的 kv 表尚无 "content" 时使用，保证后台首次打开即有数据可编辑。
// 在前台也可用（assets/js/i18n.js 仍有内置兜底），二者独立。
export const DEFAULT_CONTENT = {
  "i18n": {
    "zh": {
      "dir": "ltr",
      "langName": "中文",
      "nav": { "home": "首页", "about": "关于我们", "equipment": "设备实力", "brochures": "产品手册", "services": "业务范围", "projects": "工程案例", "contact": "联系我们" },
      "hero": { "badge": "印度尼西亚基础施工专家", "title": "PT-TKF", "subtitle": "专业基础，基坑支护施工", "desc": "我们是一家扎根于印度尼西亚的基础施工企业，拥有多台现代旋转钻机，为各类建筑、桥梁和基础设施项目提供高效优质的基础工程解决方案。", "cta1": "了解我们的设备", "cta2": "联系我们" },
      "about": {
        "title": "关于 PT-TKF", "subtitle": "凭借专业的设备和丰富的经验，夯实每一寸地基",
        "p1": "PT-TKF 是一家专注于基础建设的印度尼西亚本土企业。我们在钻孔灌注桩（Bored Pile）领域拥有深厚的专业知识，并拥有一支技能娴熟、经验丰富的基础建设团队。",
        "p2": "该公司配备了多台高性能旋转钻机及配套设备，能够应对各种地质条件、不同孔径和孔深的桩基项目，并广泛服务于住宅建筑、商业楼宇、工业厂房、桥梁及城市基础设施等项目。",
        "stats": [ { "num": "10+", "label": "旋转钻机设备" }, { "num": "500+", "label": "完成桩基工程" }, { "num": "15+", "label": "行业经验年数" }, { "num": "100%", "label": "安全施工标准" } ]
      },
      "equipment": {
        "title": "设备实力", "subtitle": "现代旋转施工设备，确保项目高效推进",
        "items": [
          { "name": "旋转钻机", "en": "Rotary Drilling Rig", "desc": "该公司拥有多台高扭矩旋转钻机，能够适应粘土、砂层、砾石和风化岩等各种地质条件，并提供高效的钻孔效率和良好的垂直度。" },
          { "name": "全回转全套管钻机", "en": "Casing Rotator", "desc": "用于复杂地层和城区敏感环境下的套管护壁施工，有效防止塌孔，保障周边建筑安全。" },
          { "name": "长螺旋钻孔机 (CFA)", "en": "CFA Drilling Rig", "desc": "连续螺旋钻孔法，适用于中等承载力的桩基，施工速度快，无泥浆污染。" },
          { "name": "配套起重与运输设备", "en": "Support Equipment", "desc": "配备履带吊、汽车吊及运输车辆，保障钻具和钢筋笼的吊装以及现场周转顺畅。" }
        ]
      },
      "brochures": {
        "title": "产品图册", "subtitle": "四款旋喷桩机型号，点击图片查看大图", "download": "下载宣传册", "zoom": "点击放大",
        "descs": {
          "KR110D-A": "小型旋喷桩机，结构紧凑，适用于狭窄场地与轻型地基加固。",
          "KR125A": "中型旋喷桩机，兼顾施工效率与运行稳定，适配多种地质条件。",
          "KR300E": "大型旋喷桩机，大扭矩深桩施工，适用于重点基建工程。",
          "KR360A": "重型旋喷桩机，超深超大口径，满足复杂工况需求。"
        }
      },
      "services": {
        "title": "业务范围", "subtitle": "提供从勘察到成桩的一站式基础工程服务",
        "items": [
          { "name": "旋挖钻孔灌注桩", "desc": "大直径、深桩基础施工，适用于高层建筑与桥梁承台。" },
          { "name": "基坑支护与止水", "desc": "提供桩锚、地下连续墙等基坑支护整体方案。" },
          { "name": "设备租赁与分包", "desc": "提供旋挖钻机及配套设备的租赁与专业施工分包服务。" },
          { "name": "地质勘察配合", "desc": "配合勘察与设计单位，优化桩基方案与施工参数。" }
        ]
      },
      "advantages": {
        "title": "为什么选择我们",
        "items": [
          { "name": "设备充足", "desc": "多台旋挖钻机可同时开工，保障工期。" },
          { "name": "技术专业", "desc": "经验丰富的机手与工程师团队。" },
          { "name": "质量可靠", "desc": "严格的质量管控与第三方检测。" },
          { "name": "安全合规", "desc": "全程安全标准化作业管理。" }
        ]
      },
      "projects": {
        "title": "工程案例", "subtitle": "我们参与建设的印度尼西亚重点项目",
        "items": [
          { "name": "雅加达高层住宅桩基", "desc": "为市中心超高层住宅提供大直径旋挖灌注桩。" },
          { "name": "泗水工业园区基础", "desc": "完成大面积厂房桩基与地基处理。" },
          { "name": "跨河桥梁桩基", "desc": "复杂水文条件下完成桥梁深桩施工。" },
          { "name": "高速公路互通基础", "desc": "参与国家级公路互通立交桩基工程。" }
        ]
      },
      "contact": {
        "title": "联系我们", "subtitle": "期待与您合作，共筑坚实基础", "company": "PT-TKF",
        "addressLabel": "公司地址",
        "address": "KOMPLEKS GALERI NIAGA MEDITERANIA 1 JL. PANTAI INDAH UTARA II BLOK X3 NO. G8A-8B, PANTAI INDAH KAPUK RT. 000 RW. 000, KAPUK MUARA, PENJARINGAN, KOTA ADM. JAKARTA UTARA, DKI JAKARTA",
        "phoneLabel": "联系电话", "phone": "+62 21 0000 0000", "emailLabel": "电子邮箱", "email": "info@pt-tkf.com",
        "whatsappLabel": "WhatsApp", "whatsapp": "+62 800 0000 0000",
        "formName": "您的姓名", "formPhone": "联系电话 / WhatsApp", "formMsg": "项目需求描述", "formSubmit": "发送咨询",
        "formNote": "提交后将跳转至您的邮件客户端，或直接通过 WhatsApp 联系我们。"
      },
      "footer": { "desc": "PT-TKF — 印度尼西亚专业基础施工公司。", "quickLinks": "快速导航", "contactUs": "联系我们", "rights": "版权所有", "built": "基础施工 · 旋挖钻孔灌注桩" }
    },
    "id": {
      "dir": "ltr",
      "langName": "Indonesia",
      "nav": { "home": "Halaman Utama", "about": "Tentang Kami", "equipment": "Kekuatan Peralatan", "brochures": "Buku Panduan Produk", "services": "Lingkup Bisnis", "projects": "Kasus Teknik", "contact": "Hubungi Kami" },
      "hero": { "badge": "Ahli Konstruksi Dasar Indonesia", "title": "PT-TKF", "subtitle": "Dasar profesional, konstruksi penyangga galian", "desc": "Kami adalah perusahaan konstruksi fondasi yang berakar di Indonesia, memiliki beberapa mesin bor putar modern, dan menyediakan solusi rekayasa fondasi yang efisien dan berkualitas tinggi untuk berbagai proyek bangunan, jembatan, dan infrastruktur.", "cta1": "Mengenal peralatan kami", "cta2": "Hubungi Kami" },
      "about": {
        "title": "Tentang PT-TKF", "subtitle": "Dengan peralatan profesional dan pengalaman yang kaya, memperkuat setiap inci fondasi",
        "p1": "PT-TKF adalah perusahaan lokal Indonesia yang berfokus pada infrastruktur. Kami memiliki keahlian mendalam di bidang tiang pancang bor (Bored Pile) dan didukung oleh tim infrastruktur yang terampil dan berpengalaman.",
        "p2": "Perusahaan ini dilengkapi dengan beberapa mesin bor putar berkinerja tinggi serta peralatan pendukung, yang mampu menangani berbagai kondisi geologi, diameter lubang, dan kedalaman lubang dalam proyek pondasi tiang, serta melayani secara luas proyek-proyek seperti bangunan residensial, gedung komersial, pabrik industri, jembatan, dan infrastruktur perkotaan.",
        "stats": [ { "num": "10+", "label": "Peralatan mesin bor putar" }, { "num": "500+", "label": "Selesaikan pekerjaan pondasi tiang" }, { "num": "15+", "label": "Tahun Pengalaman Industri" }, { "num": "100%", "label": "Standar Keselamatan Konstruksi" } ]
      },
      "equipment": {
        "title": "Kekuatan Peralatan", "subtitle": "Peralatan konstruksi rotasi modern, memastikan proyek berjalan efisien",
        "items": [
          { "name": "Bor putar", "en": "Rotary Drilling Rig", "desc": "Perusahaan ini memiliki beberapa mesin bor putar torsi tinggi yang mampu beradaptasi dengan berbagai kondisi geologi seperti tanah liat, lapisan pasir, kerikil, dan batuan lapuk, serta menyediakan efisiensi pengeboran yang efisien dan vertikalitas yang baik." },
          { "name": "Mesin Bor Full Rotation dengan Selongsong Lengkap", "en": "Casing Rotator", "desc": "Digunakan untuk konstruksi pelindung selongsong pada formasi geologi kompleks dan lingkungan sensitif di wilayah perkotaan, secara efektif mencegah runtuhnya lubang bor, dan menjamin keamanan bangunan di sekitarnya." },
          { "name": "Mesin Bor Spiran Panjang (CFA)", "en": "CFA Drilling Rig", "desc": "Metode pengeboran spiran berkelanjutan, cocok untuk tiang pancang dengan kapasitas beban menengah, kecepatan konstruksi tinggi, dan tanpa pencemaran lumpur." },
          { "name": "Peralatan Angkat dan Transportasi Pendukung", "en": "Support Equipment", "desc": "Dilengkapi dengan crane crawler, crane truk, dan kendaraan transportasi untuk menjamin pengangkatan alat bor dan sangkar besi serta kelancaran perputaran di lokasi." }
        ]
      },
      "brochures": {
        "title": "Buku Panduan Produk", "subtitle": "Empat model mesin jet grouting, klik untuk mengunduh brosur teknis yang sesuai", "download": "Unduh Brosur", "zoom": "Klik untuk memperbesar",
        "descs": {
          "KR110D-A": "Mesin jet grouting kecil, struktur ringkas, cocok untuk area sempit dan penguatan fondasi ringan.",
          "KR125A": "Mesin jet grouting menengah, menyeimbangkan efisiensi konstruksi dan stabilitas operasional, cocok untuk berbagai kondisi geologi.",
          "KR300E": "Mesin jet grouting besar, konstruksi tiang dalam dengan torsi tinggi, cocok untuk proyek infrastruktur utama.",
          "KR360A": "Mesin jet grouting berat, kedalaman dan diameter sangat besar, memenuhi kebutuhan kondisi kerja yang kompleks."
        }
      },
      "services": {
        "title": "Lingkup Bisnis", "subtitle": "Menyediakan layanan rekayasa fondasi satu atap dari survei hingga pengecoran tiang",
        "items": [
          { "name": "Tiang Pancang Bor Putar (Bored Pile)", "desc": "Konstruksi fondasi tiang berdiameter besar dan dalam, cocok untuk bangunan bertingkat tinggi dan tumpuan jembatan." },
          { "name": "Penyangga Galian dan Penghentian Air", "desc": "Menyediakan solusi menyeluruh penyangga galian seperti penambat tiang dan dinding diafragma." },
          { "name": "Penyewaan dan Subkontrak Peralatan", "desc": "Menyediakan layanan sewa mesin bor putar beserta peralatan pendukung serta subkontrak konstruksi profesional." },
          { "name": "Dukungan Survei Geologi", "desc": "Bekerja sama dengan unit survei dan desain untuk mengoptimalkan skema tiang pancang dan parameter konstruksi." }
        ]
      },
      "advantages": {
        "title": "Mengapa Memilih Kami",
        "items": [
          { "name": "Peralatan Memadai", "desc": "Beberapa mesin bor putar dapat beroperasi bersamaan, menjamin jadwal proyek." },
          { "name": "Teknologi Profesional", "desc": "Tim operator dan insinyur yang berpengalaman." },
          { "name": "Kualitas Terpercaya", "desc": "Pengendalian kualitas ketat dan pengujian pihak ketiga." },
          { "name": "Aman dan Patuh Aturan", "desc": "Manajemen operasi standar keselamatan sepanjang proses." }
        ]
      },
      "projects": {
        "title": "Kasus Teknik", "subtitle": "Proyek-proyek utama di Indonesia yang kami ikut bangun",
        "items": [
          { "name": "Tiang Pancang Hunian Tinggi Jakarta", "desc": "Menyediakan tiang bor putar berdiameter besar untuk hunian sangat tinggi di pusat kota." },
          { "name": "Fondasi Kawasan Industri Surabaya", "desc": "Menyelesaikan tiang pancang pabrik berskala besar dan penanganan fondasi." },
          { "name": "Tiang Pancang Jembatan Lintas Sungai", "desc": "Menyelesaikan tiang dalam jembatan di bawah kondisi hidrologi yang kompleks." },
          { "name": "Fondasi Simpang Susun Jalan Tol", "desc": "Ikut serta dalam proyek tiang pancang simpang susun jalan tol nasional." }
        ]
      },
      "contact": {
        "title": "Hubungi Kami", "subtitle": "Berharap dapat bekerja sama dengan Anda untuk membangun fondasi yang kokoh", "company": "PT-TKF",
        "addressLabel": "Alamat Perusahaan",
        "address": "KOMPLEKS GALERI NIAGA MEDITERANIA 1 JL. PANTAI INDAH UTARA II BLOK X3 NO. G8A-8B, PANTAI INDAH KAPUK RT. 000 RW. 000, KAPUK MUARA, PENJARINGAN, KOTA ADM. JAKARTA UTARA, DKI JAKARTA",
        "phoneLabel": "Nomor Telepon", "phone": "+62 21 0000 0000", "emailLabel": "Email", "email": "info@pt-tkf.com",
        "whatsappLabel": "WhatsApp", "whatsapp": "+62 800 0000 0000",
        "formName": "Nama Anda", "formPhone": "Nomor Telepon / WhatsApp", "formMsg": "Deskripsi Kebutuhan Proyek", "formSubmit": "Kirim Pertanyaan",
        "formNote": "Setelah dikirim, Anda akan diarahkan ke klien email Anda, atau hubungi kami langsung melalui WhatsApp."
      },
      "footer": { "desc": "PT-TKF — Perusahaan konstruksi fondasi profesional Indonesia.", "quickLinks": "Tautan Cepat", "contactUs": "Hubungi Kami", "rights": "Hak Cipta", "built": "Konstruksi Fondasi · Tiang Pancang Bor Putar" }
    },
    "en": {
      "dir": "ltr",
      "langName": "English",
      "nav": { "home": "Home Page", "about": "About Us", "equipment": "Device Capabilities", "brochures": "Product Manual", "services": "Business Scope", "projects": "Engineering Case Studies", "contact": "Contact Us" },
      "hero": { "badge": "Indonesian Foundation Construction Expert", "title": "PT-TKF", "subtitle": "Professional Foundation, Excavation Support Construction", "desc": "We are a foundation construction company based in Indonesia, equipped with multiple modern rotary drilling rigs, providing efficient and high-quality foundation engineering solutions for various building, bridge, and infrastructure projects.", "cta1": "Learn About Our Devices", "cta2": "Contact Us" },
      "about": {
        "title": "About PT-TKF", "subtitle": "With professional equipment and extensive experience, we lay a solid foundation for every inch of ground.",
        "p1": "PT-TKF is an Indonesian local company specializing in infrastructure. We have extensive expertise in bored pile construction and possess a skilled and experienced infrastructure team.",
        "p2": "The company is equipped with multiple high-performance rotary drilling rigs and supporting equipment, capable of handling pile foundation projects under various geological conditions, different hole diameters, and depths, and widely serving residential buildings, commercial structures, industrial plants, bridges, and urban infrastructure projects.",
        "stats": [ { "num": "10+", "label": "Rotary drilling rig equipment" }, { "num": "500+", "label": "Complete pile foundation engineering" }, { "num": "15+", "label": "Years of Industry Experience" }, { "num": "100%", "label": "Safety Construction Standards" } ]
      },
      "equipment": {
        "title": "Device Capabilities", "subtitle": "Modern rotary construction equipment, ensuring efficient project advancement.",
        "items": [
          { "name": "Rotary drilling rig", "en": "Rotary Drilling Rig", "desc": "The company owns multiple high-torque rotary drilling rigs capable of adapting to various geological conditions such as clay, sand layers, gravel, and weathered rock, while providing efficient drilling performance and good verticality." },
          { "name": "Full-rotation casing drilling rig", "en": "Casing Rotator", "desc": "Used for casing wall construction in complex strata and sensitive urban environments, effectively preventing borehole collapse and ensuring safety of surrounding buildings." },
          { "name": "Continuous Flight Auger (CFA) Drilling Rig", "en": "CFA Drilling Rig", "desc": "Continuous flight auger method, suitable for piles with medium bearing capacity, fast construction, and no slurry pollution." },
          { "name": "Supporting Lifting and Transport Equipment", "en": "Support Equipment", "desc": "Equipped with crawler cranes, truck cranes, and transport vehicles to ensure lifting of drilling tools and reinforcement cages and smooth on-site logistics." }
        ]
      },
      "brochures": {
        "title": "Product Manual", "subtitle": "Four models of jet grouting rigs, click to download the corresponding technical manual.", "download": "Download Brochure", "zoom": "Click to enlarge",
        "descs": {
          "KR110D-A": "Small jet grouting rig, compact structure, suitable for narrow sites and light foundation reinforcement.",
          "KR125A": "Medium jet grouting rig, balancing construction efficiency and operational stability, adaptable to various geological conditions.",
          "KR300E": "Large jet grouting rig, high-torque deep pile construction, suitable for key infrastructure projects.",
          "KR360A": "Heavy jet grouting rig, ultra-deep and extra-large diameter, meeting complex working conditions."
        }
      },
      "services": {
        "title": "Business Scope", "subtitle": "Providing one-stop foundation engineering services from investigation to pile completion",
        "items": [
          { "name": "Rotary Bored Pile", "desc": "Large-diameter, deep pile foundation construction, suitable for high-rise buildings and bridge caps." },
          { "name": "Foundation Pit Support and Waterproofing", "desc": "Providing integrated foundation pit support solutions such as pile anchors and diaphragm walls." },
          { "name": "Equipment Rental and Subcontracting", "desc": "Providing rental of rotary drilling rigs and supporting equipment as well as professional construction subcontracting services." },
          { "name": "Geological Survey Coordination", "desc": "Coordinating with survey and design units to optimize pile foundation schemes and construction parameters." }
        ]
      },
      "advantages": {
        "title": "Why Choose Us",
        "items": [
          { "name": "Ample Equipment", "desc": "Multiple rotary drilling rigs can operate simultaneously, ensuring the project schedule." },
          { "name": "Professional Technology", "desc": "Experienced operators and engineering team." },
          { "name": "Reliable Quality", "desc": "Strict quality control and third-party testing." },
          { "name": "Safe and Compliant", "desc": "Standardized safety management throughout the process." }
        ]
      },
      "projects": {
        "title": "Engineering Case Studies", "subtitle": "Key projects in Indonesia that we have participated in building",
        "items": [
          { "name": "Jakarta High-rise Residential Piles", "desc": "Providing large-diameter rotary bored piles for super high-rise residences in the city center." },
          { "name": "Surabaya Industrial Park Foundation", "desc": "Completed large-area factory pile foundations and ground treatment." },
          { "name": "River-crossing Bridge Piles", "desc": "Completed deep bridge piles under complex hydrological conditions." },
          { "name": "Expressway Interchange Foundation", "desc": "Participated in pile foundation works for national expressway interchange." }
        ]
      },
      "contact": {
        "title": "Contact Us", "subtitle": "Looking forward to cooperating with you to build a solid foundation", "company": "PT-TKF",
        "addressLabel": "Company Address",
        "address": "KOMPLEKS GALERI NIAGA MEDITERANIA 1 JL. PANTAI INDAH UTARA II BLOK X3 NO. G8A-8B, PANTAI INDAH KAPUK RT. 000 RW. 000, KAPUK MUARA, PENJARINGAN, KOTA ADM. JAKARTA UTARA, DKI JAKARTA",
        "phoneLabel": "Phone", "phone": "+62 21 0000 0000", "emailLabel": "Email", "email": "info@pt-tkf.com",
        "whatsappLabel": "WhatsApp", "whatsapp": "+62 800 0000 0000",
        "formName": "Your Name", "formPhone": "Phone / WhatsApp", "formMsg": "Project Requirements", "formSubmit": "Send Inquiry",
        "formNote": "After submission, you will be redirected to your email client, or contact us directly via WhatsApp."
      },
      "footer": { "desc": "PT-TKF — Professional foundation construction company in Indonesia.", "quickLinks": "Quick Links", "contactUs": "Contact Us", "rights": "All Rights Reserved", "built": "Foundation Construction · Rotary Bored Pile" }
    }
  },
  "brochures": [
    { "model": "KR110D-A", "en": "Jet Grouting Rig", "img": "assets/img/110.jpg", "pdf": "" },
    { "model": "KR125A", "en": "Jet Grouting Rig", "img": "assets/img/125.jpg", "pdf": "" },
    { "model": "KR300E", "en": "Jet Grouting Rig", "img": "assets/img/300.jpg", "pdf": "" },
    { "model": "KR360A", "en": "Jet Grouting Rig", "img": "assets/img/360.jpg", "pdf": "" }
  ]
};

