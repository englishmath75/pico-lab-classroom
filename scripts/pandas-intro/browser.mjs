import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist'),evidence=resolve('sw/evidence/pandas-intro');await mkdir(evidence,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png'};
const server=createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=resolve(root,'.'+(name.endsWith('/')?name+'index.html':name));if(!file.startsWith(root+sep))throw Error('path');const bytes=await readFile(file);res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404);res.end('Not found');}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000},locale:'ko-KR'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
const origin='http://127.0.0.1:'+server.address().port;
try{
 await page.goto(origin+'/?page=lesson&lesson=1');
 const frame=page.frameLocator('#sw-classroom-frame');
 await frame.locator('h1').waitFor({timeout:60000});
 assert.equal(await page.locator('a[data-route="pandas-intro"]').count(),0);assert.equal(await page.locator('a[data-route="lesson"]').getAttribute('aria-current'),'page');
 assert.equal(await frame.locator('.chapter').count(),14);assert.equal(await frame.locator('.example').count(),32);
 await page.screenshot({path:evidence+'/desktop.png'});
 // Run real Python through the integrated parent engine, with fresh independent examples.
 const samples=JSON.parse(await readFile('public/pandas-data-lab/pandas-intro-examples.json','utf8'));
 for(const n of [3,4,5,6,10,14,16,19,22,25,26,27,28,29,30,31,32]){
  await frame.locator('[data-run="'+n+'"]').click();
  await frame.locator('[data-run="'+n+'"]').waitFor({state:'visible'});
  await page.waitForFunction(n=>{const d=document.querySelector('iframe').contentDocument;return !d.querySelector('[data-run="'+n+'"]').disabled;},n,{timeout:150000});
  const text=await frame.locator('#output-'+n).innerText();
  const norm=s=>s.replace(/\s+/g,' ').trim().replaceAll("dtype='str'","dtype='object'").replaceAll('dtype: str','dtype: object');
  assert.equal(norm(text),norm(samples[n-1].output),'real browser Python example '+n);
 }
 await frame.locator('#code-3').fill('print("수정한 코드 실행 확인")');await frame.locator('[data-run="3"]').click();await page.waitForFunction(()=>document.querySelector('iframe').contentDocument.querySelector('#output-3').textContent.includes('수정한 코드 실행 확인'),null,{timeout:30000});
 await frame.locator('#slice-select').selectOption('loc');assert.equal(await frame.locator('#slice-cells .selected').count(),3);
 await frame.locator('#slice-select').selectOption('iloc');assert.equal(await frame.locator('#slice-cells .selected').count(),2);
 await frame.locator('input[name="intro-q-0"][value="0"]').check();await frame.locator('#grade').click();assert.match(await frame.locator('#score').innerText(),/1 \/ 12/);
 const download=page.waitForEvent('download');await frame.locator('[data-download="3"]').click();const file=await download;assert.equal(file.suggestedFilename(),'pandas-intro-03.py');
 for(const width of [390,768]){await page.setViewportSize({width,height:844});await page.evaluate(()=>scrollTo(0,0));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'outer overflow '+width);assert(await frame.locator('body').evaluate(el=>el.scrollWidth<=el.ownerDocument.documentElement.clientWidth+1),'frame overflow '+width);await page.screenshot({path:evidence+'/mobile-'+width+'.png'});}
 await page.setViewportSize({width:1440,height:1000});await page.goto(origin+'/?page=home');await page.frameLocator('#sw-classroom-frame').getByText('판다스 첫 수업 시작 →').click();await page.waitForURL('**/?page=lesson&lesson=1');
 await frame.getByRole('link',{name:/2차시 ·/}).click();await page.waitForURL('**/?page=lesson&lesson=2');await frame.locator('#heroTitle').waitFor();assert.match(await frame.locator('#heroTitle').innerText(),/2차시/);await frame.locator('#lessonPicker').evaluate(el=>el.open=true);await frame.locator('[data-lesson="0"]').click();await page.waitForURL('**/?page=lesson&lesson=1');await frame.locator('#code-1').waitFor();assert.equal(await frame.locator('#editor').count(),0);
 await page.goto(origin+'/?page=pandas-intro');await page.waitForURL('**/?page=lesson&lesson=1');await frame.locator('#code-1').waitFor();
 assert.deepEqual(errors,[]);
 await writeFile(evidence+'/result.json',JSON.stringify({status:'PASS',examples:32,browserExecutions:17,checks:['desktop and mobile','actual Python output','editable code','slice visualization','quiz grading','download','home navigation'],errors},null,2));
 console.log('PASS: Series introduction browser checks');
}catch(e){await page.screenshot({path:evidence+'/failure.png'});await writeFile(evidence+'/failure.txt',e.stack);throw e;}finally{await browser.close();await new Promise(r=>server.close(r));}
