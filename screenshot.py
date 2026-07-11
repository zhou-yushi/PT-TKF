from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    msgs = []
    pg.on("console", lambda m: msgs.append(m.type + ": " + m.text[:200]))
    pg.on("requestfailed", lambda r: msgs.append("REQFAIL: " + r.url + " " + str(r.failure)))
    try:
        pg.goto("https://pt-tkf.pages.dev/", wait_until="networkidle", timeout=60000)
    except Exception as e:
        print("GOTO ERR", e)
    pg.wait_for_timeout(2500)
    pg.evaluate("document.getElementById('brochureGrid') && document.getElementById('brochureGrid').scrollIntoView()")
    pg.wait_for_timeout(2500)
    info = pg.evaluate("""[...document.querySelectorAll('#brochureGrid img')].map(i=>({src:i.currentSrc, nw:i.naturalWidth, nh:i.naturalHeight, op:getComputedStyle(i).opacity, comp:i.complete}))""")
    print("IMGS:", info)
    card = pg.evaluate("""(()=>{const c=document.querySelector('.brochure-card'); if(!c) return 'no card'; const cs=getComputedStyle(c); return {op:cs.opacity, vis:cs.visibility, h:c.getBoundingClientRect().height};})()""")
    print("CARD:", card)
    print("CONSOLE:", msgs[:40])
    pg.screenshot(path="shot_full.png", full_page=True)
    b.close()
