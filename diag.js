const https = require("https");
const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=t&q=" + encodeURIComponent("专业旋挖钻孔灌注桩基础施工");
https.get(url, (res) => {
  console.log("status:", res.statusCode, "encoding:", res.headers["content-encoding"]);
  let chunks = [];
  res.on("data", (c) => chunks.push(c));
  res.on("end", () => {
    const buf = Buffer.concat(chunks);
    console.log("raw length:", buf.length);
    // 尝试按 utf8 解析
    const s = buf.toString("utf8");
    console.log("utf8 sample:", s.slice(0, 200));
    try {
      const arr = JSON.parse(s);
      console.log("parsed:", JSON.stringify(arr[0] ? arr[0][0] : arr).slice(0, 200));
    } catch (e) { console.log("parse err:", e.message); }
  });
}).on("error", (e) => console.log("err:", e.message));
