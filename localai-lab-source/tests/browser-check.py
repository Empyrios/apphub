from playwright.sync_api import sync_playwright
from pathlib import Path
import base64
ROOT=Path('/mnt/data/localai-lab')
html=(ROOT/'site/index.html').read_text().replace('<link rel="stylesheet" href="./styles.css">','').replace('<script type="module" src="./app.mjs"></script>','').replace('<link rel="manifest" href="./manifest.webmanifest">','')
css=(ROOT/'site/styles.css').read_text()
def data_url(s):return 'data:text/javascript;base64,'+base64.b64encode(s.encode()).decode()
catalog=data_url((ROOT/'site/catalog.mjs').read_text())
engine=data_url((ROOT/'site/engine.mjs').read_text().replace("from './catalog.mjs'",f"from '{catalog}'"))
app=(ROOT/'site/app.mjs').read_text().replace("from './catalog.mjs'",f"from '{catalog}'").replace("from './engine.mjs'",f"from '{engine}'")
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport in [('mobile',{'width':390,'height':844}),('desktop',{'width':1440,'height':900})]:
  context=browser.new_context(viewport=viewport,device_scale_factor=1,service_workers='block')
  page=context.new_page();errors=[]
  page.on('pageerror',lambda e: errors.append(str(e)))
  page.goto('about:blank')
  page.evaluate('''() => {let mem={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:(k)=>mem[k]??null,setItem:(k,v)=>mem[k]=String(v),removeItem:(k)=>delete mem[k],clear:()=>mem={}}});}''')
  page.set_content(html,wait_until='load');page.add_style_tag(content=css)
  page.add_script_tag(type='module',content=app)
  page.locator('.model-card').first.wait_for(timeout=12000)
  assert page.locator('.model-card').count()==13,(label,'model cards',page.locator('.model-card').count())
  assert page.locator('text=Your RTX 3070 PC').count() >=1
  assert page.locator('text=GPU fit').count() >=1
  page.screenshot(path=str(ROOT/f'preview-{label}.png'),full_page=True)
  page.locator('#model-search').fill('Gemma')
  assert page.locator('.model-card').count()==4,(label,'search count',page.locator('.model-card').count())
  page.locator('#model-search').fill('')
  assert page.locator('.model-card').count()==13
  page.locator('[data-detail="qwen3-8"]').click()
  assert page.locator('#detail-dialog').evaluate('(x)=>x.open')
  assert page.locator('#detail-dialog').locator('text=ollama run qwen3:8b').count()==1
  page.locator('#detail-dialog [data-close]').click()
  page.locator('[data-compare="qwen3-8"]').first.click()
  page.locator('[data-compare="gemma3-4"]').first.click()
  page.locator(('#bottom-nav ' if label=='mobile' else '#sidebar-nav ')+'[data-nav="compare"]').click()
  assert page.locator('.compare-card').count()==2
  page.locator(('#bottom-nav ' if label=='mobile' else '#sidebar-nav ')+'[data-nav="hardware"]').click()
  page.locator('[data-preset="high"]').click()
  assert page.locator('[name="vramGB"]').input_value()=='24'
  page.locator('[name="name"]').fill('My upgraded PC')
  page.locator('[name="ramGB"]').fill('48')
  page.locator('[name="context"]').select_option('8192')
  page.locator('#hardware-form button[type=submit]').click()
  assert page.locator('[name="name"]').input_value()=='My upgraded PC'
  assert page.locator('[name="ramGB"]').input_value()=='48'
  stored=page.evaluate("JSON.parse(localStorage.getItem('empyrios-localai-lab-v1'))")
  assert stored['profile']['ramGB']==48
  assert stored['context']==8192
  page.locator(('#bottom-nav ' if label=='mobile' else '#sidebar-nav ')+'[data-nav="guide"]').click()
  assert page.locator('text=Install Ollama on your computer').count()==1
  page.once('dialog',lambda dlg:dlg.accept())
  page.locator('[data-reset="settings"]').click()
  page.locator(('#bottom-nav ' if label=='mobile' else '#sidebar-nav ')+'[data-nav="hardware"]').click()
  assert page.locator('[name="vramGB"]').input_value()=='8'
  assert not errors,(label,errors)
  over=page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
  assert not over,(label,'horizontal overflow',page.evaluate('document.documentElement.scrollWidth'))
  print(label,'PASS: search, details, compare, presets, hardware, persistence, guide, reset; no JS errors')
  context.close()
 browser.close()
