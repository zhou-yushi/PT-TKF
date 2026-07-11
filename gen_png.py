import os
from PIL import Image

# 从现有 webp 生成 PNG 兜底（同尺寸、优化压缩），用于不支持 webp 的客户端 / 旧缓存回退
d = "assets/img"
for f in os.listdir(d):
    if f.lower().endswith(".webp"):
        im = Image.open(os.path.join(d, f)).convert("RGB")
        out = os.path.join(d, f[:-5] + ".png")
        im.save(out, "PNG", optimize=True)
        print(out, round(os.path.getsize(out) / 1024, 1), "KB")
