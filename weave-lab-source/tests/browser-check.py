"""No-network Chromium UI smoke. Serves bytes from ./site through Playwright routes."""
from pathlib import Path
import mimetypes
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]/'site'
import base64
CACHE={}
def module_uri(name):
 if name in CACHE:return CACHE[name]
 src=(ROOT/name).read_text()
 for dependency in ('data.mjs','engine.mjs','simulation.mjs','report-inspector.mjs'):
  if "'./"+dependency+"'" in src:src=src.replace("'./"+dependency+"'", "'"+module_uri(dependency)+"'")
 uri='data:text/javascript;base64,'+base64.b64encode(src.encode()).decode()
 CACHE[name]=uri
 return uri

def app_source():
 source=(ROOT/'app.mjs').read_text()
 for dependency in ('data.mjs','engine.mjs','simulation.mjs','report-inspector.mjs'):
  if "'./"+dependency+"'" in source:source=source.replace("'./"+dependency+"'", "'"+module_uri(dependency)+"'")
 return source

def run():
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
  for mode,viewport in [('mobile',{'width':390,'height':844}),('desktop',{'width':1440,'height':900})]:
   ctx=browser.new_context(viewport=viewport,accept_downloads=True)
   page=ctx.new_page()
   errors=[]
   page.on('pageerror',lambda ex:errors.append(str(ex)))
   css=(ROOT/'styles.css').read_text()
   page.set_content(f'<html><head><style>{css}</style></head><body><div id="app"></div></body></html>',wait_until='domcontentloaded')
   page.add_script_tag(type='module',content=app_source())
   page.locator('h1').first.wait_for(timeout=8000)
   page.screenshot(path=str(ROOT.parent/f'overview-{mode}.png'),full_page=(mode=='desktop'))
   nav=lambda name:page.locator(('button.bottom-nav[data-page=\"'+name+'\"]') if False else ('.bottom-nav button[data-page=\"'+name+'\"]' if mode=='mobile' else '.nav button[data-page=\"'+name+'\"]'))
   assert 'Balance, before guesswork.' in page.locator('h1').first.inner_text(),page.locator('body').inner_text()[:200]
   nav('archive').click()
   assert 'Roster intelligence' in page.locator('h1').first.inner_text()
   page.locator('button[data-form="maledith"]').first.click()
   assert 'Maledith' in page.locator('main').inner_text()
   page.locator('button[data-action="use-archive-art"]').first.click()
   assert 'Combat analysis' in page.locator('h1').first.inner_text()
   page.locator('select[data-field="target"]').select_option('cragkyl')
   page.locator('input[data-field="shield"]').fill('60')
   page.locator('input[data-field="shield"]').press('Tab')
   assert 'Calculation trace' in page.locator('main').inner_text()
   nav('loom').click()
   assert page.locator('.strand').count()==49
   page.screenshot(path=str(ROOT.parent/f'loom-{mode}.png'),full_page=False)
   page.locator('.strand[data-cell="0"]').click()
   page.locator('.strand[data-cell="1"]').click()
   assert 'Moves tested' in page.locator('main').inner_text()
   assert 'Move 1' in page.locator('main').inner_text()
   nav('draft').click()
   page.locator('button[data-action="auto-draft"]').click()
   assert 'Complete' in page.locator('main').inner_text()
   nav('experiments').click()
   page.locator('input[data-field="samples"]').fill('2')
   page.locator('input[data-field="samples"]').press('Tab')
   page.locator('input[data-field="experimentMoves"]').fill('4')
   page.locator('input[data-field="experimentMoves"]').press('Tab')
   page.locator('button[data-action="run-compare"]').click()
   page.get_by_text('Loom economy results').first.wait_for(timeout=20000)
   assert 'Strands/Move' in page.locator('main').inner_text()
   page.locator('input[data-field="proxySamples"]').fill('2')
   page.locator('input[data-field="proxySamples"]').press('Tab')
   page.locator('button[data-action="run-proxy"]').click()
   page.get_by_text('3v3 damage/resource proxy').last.wait_for(timeout=20000)
   nav('qa').click()
   assert page.get_by_text('Risk & coverage matrix').count()==1
   fake={"schemaVersion":1,"weaveVersion":"0.1.2","engineRevision":"weave-engine-v0.1.2-immunity.1","rulesetFingerprint":"deadbeef","seed":1,"rosters":[["fjordfin","status","craglet"],["moveeco","support","resource"]],"actions":[{"kind":"timeout"}],"events":[{"kind":"bonusMove","side":0,"turn":1,"actionIndex":0}],"turnCount":2,"result":0,"state":{"winner":0,"threads":[1,1],"teams":[[{"name":"Fjordfin","hp":120},{"name":"Craglet","hp":130},{"name":"Status","hp":110}],[{"name":"Support","hp":0},{"name":"Resource","hp":0},{"name":"MoveEco","hp":0}]]}}
   import json
   page.locator('#battle-report-file').set_input_files({"name":"report.json","mimeType":"application/json","buffer":json.dumps(fake).encode()})
   page.get_by_text('Files imported').first.wait_for(timeout=10000)
   assert 'deadbeef' in page.locator('main').inner_text()
   with page.expect_download(timeout=10000) as info:
    page.locator('button[data-action="export-scenario"]').click()
   assert info.value.suggested_filename.endswith('.json')
   if errors:raise AssertionError(f'{mode} JavaScript page errors: '+str(errors))
   output=ROOT.parent/f'preview-{mode}.png'
   page.screenshot(path=str(output),full_page=True)
   print(f'{mode}: interactions PASS · screenshot {output.name} · scrollWidth={page.evaluate("document.documentElement.scrollWidth")} viewport={viewport["width"]}')
   if page.evaluate('document.documentElement.scrollWidth')>viewport['width']+2:
    raise AssertionError(f'{mode} horizontal overflow')
   ctx.close()
  browser.close()
if __name__=='__main__':run()
