import {verifyListAndAnswers} from './mk-list-answer-browser.mjs';
import {chromium,expect as playwrightExpect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const expect=playwrightExpect.configure({timeout:25000}),exec=promisify(execFile),cache=new Map(),evidence=[];
await mkdir('.artifacts/mk-v3',{recursive:true});
const types={js:'text/javascript',css:'text/css',json:'application/json',html:'text/html',py:'text/plain',png:'image/png'};
const server=createServer(async(req,res)=>{try{let name=new URL(req.url,'http://localhost').pathname;if(name==='/')name='/index.html';if(name.includes('..'))throw Error('path');const body=await readFile('mk-dist'+name);res.writeHead(200,{'Content-Type':types[name.split('.').pop()]||'text/plain'});res.end(body);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(4169,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let context;
async function create(width=1366){
 context=await browser.newContext({viewport:{width,height:950},locale:'ko-KR'});
 await context.route('**/student-config.json',route=>route.fulfill({json:{enabled:false}}));
 // A protected preview cannot give cookies to an opaque frame. Parent fetches
 // must work even when direct iframe navigation to these shells is blocked.
 await context.route(/\/(student-runner|gallery)\.html$/,route=>route.request().isNavigationRequest()?route.abort():route.continue());
 await context.route('https://**/*',async route=>{const url=new URL(route.request().url());if(url.hostname!=='cdn.jsdelivr.net')return route.abort();let body=cache.get(url.href);if(!body){body=exec('curl',['--fail','--silent','--show-error','--location','--retry','1','--max-time','90','--url',url.href],{encoding:'buffer',maxBuffer:128000000}).then(r=>r.stdout);cache.set(url.href,body);}try{const mime=url.pathname.endsWith('.js')?'text/javascript':url.pathname.endsWith('.wasm')?'application/wasm':url.pathname.endsWith('.json')?'application/json':'application/octet-stream';await route.fulfill({body:await body,contentType:mime,headers:{'Access-Control-Allow-Origin':'*'}});}catch(e){console.error('Vendor fetch failed',url.pathname,e.message);await route.abort();}});
 const page=await context.newPage();page.on('pageerror',e=>{console.error('Page error',e.message);evidence.push({pageError:e.message});});page.on('dialog',dialog=>dialog.accept());return page;
}
async function open(page,path){await page.goto('http://127.0.0.1:4169'+path);await expect(page.locator('#page-content h1')).toBeVisible();}
async function run(page,code,input){const began=Date.now();if(code!==undefined)await page.locator('#editor').fill(code);if(input!==undefined)await page.locator('#stdin').fill(input);await page.locator('#run').click();await expect(page.locator('#run-state')).toHaveText('실행 성공',{timeout:150000});evidence.push({runtimeMs:Date.now()-began,activity:await page.locator('#workspace').inputValue()});return page.locator('#output').textContent();}
async function shot(page,name){await page.screenshot({path:'.artifacts/mk-v3/'+name+'.png',fullPage:false});}
async function verifyPngDownload(page){const pending=page.waitForEvent('download');await page.locator('#plot-download').click();const download=await pending;const png=await readFile(await download.path());if(download.suggestedFilename()!=='python-result.png'||png.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||png.length<1000)throw Error('invalid PNG export');evidence.push({download:'PNG',bytes:png.length,activity:await page.locator('#workspace').inputValue()});}
try{
 const page=await create();
 await open(page,'/');await expect(page.locator('.sidebar nav>a')).toHaveCount(6);await expect(page.locator('.hero h2')).toContainText('코드를 읽고');
 // Each page has one document heading; the home hero is a section heading.
 await expect(page.locator('.sidebar nav>a[aria-current]')).toContainText('수업 안내');
 await shot(page,'01-home');
 // Index explorer: every button must highlight precisely the changed, deleted, moved, or sliced values.
 await open(page,'/?page=review&section=basics');
 const cases=[
  {label:'처음',values:['10','20','30','40','50'],added:0,removed:0,moved:0,selected:0},
  {label:'a[3]="테스트"',values:['10','20','30','테스트','50'],added:1,removed:1,moved:0,selected:0},
  {label:'append(60)',values:['10','20','30','40','50','60'],added:1,removed:0,moved:0,selected:0},
  {label:'insert(1,15)',values:['10','15','20','30','40','50'],added:1,removed:0,moved:4,selected:0},
  {label:'remove(20)',values:['10','30','40','50'],added:0,removed:1,moved:3,selected:0},
  {label:'del a[0]',values:['20','30','40','50'],added:0,removed:1,moved:4,selected:0},
  {label:'a[1:3]',values:['20','30'],added:0,removed:0,moved:0,selected:2},
  {label:'a[:3]',values:['10','20','30'],added:0,removed:0,moved:0,selected:3},
  {label:'a[2:]',values:['30','40','50'],added:0,removed:0,moved:0,selected:3},
  {label:'a[::2]',values:['10','30','50'],added:0,removed:0,moved:0,selected:3},
  {label:'a[::-1]',values:['50','40','30','20','10'],added:0,removed:0,moved:0,selected:5}
 ];
 await expect(page.locator('[data-list-op]')).toHaveCount(cases.length);
 for(const [index,entry] of cases.entries()){
   await page.locator('[data-list-op]').first().click();
   await page.locator('[data-list-op]').nth(index).click();
   const values=await page.locator('#list-after .list-cell strong').allTextContents();
   if(JSON.stringify(values)!==JSON.stringify(entry.values))throw Error('Index operation output mismatch: '+entry.label);
   await expect(page.locator('#list-before .list-cell--removed')).toHaveCount(entry.removed);
   await expect(page.locator('#list-after .list-cell--added')).toHaveCount(entry.added);
   await expect(page.locator('#list-after .list-cell--moved')).toHaveCount(entry.moved);
   await expect(page.locator('#list-before .list-cell--selected')).toHaveCount(entry.selected);
   await expect(page.locator('#list-after .list-cell--selected')).toHaveCount(entry.selected);
   await expect(page.locator('[data-list-op][aria-pressed="true"]')).toHaveCount(1);
   if(entry.added){
     const colors=await page.evaluate(()=>[getComputedStyle(document.querySelector('#list-after .list-cell--added')).backgroundColor,getComputedStyle(document.querySelector('#list-before .list-cell:not([class*="--"])')).backgroundColor]);
     if(colors[0]===colors[1])throw Error('Index highlight has no visible color: '+entry.label);
   }
 }
 await shot(page,'00-index-color-diff');
 evidence.push({indexExplorer:'11/11 commands correct with added/removed/moved/selected visual differences'});
 await verifyListAndAnswers(page,{open,shot});
 await page.setViewportSize({width:1366,height:950});
 evidence.push({listAndAnswer:'6 routes, cumulative edits, mobile and 40 answer checks'});

 for(const [name,path] of [['00-review','/python-review.html#basics'],['02-list','/?page=activity&id=mk3-list-edit'],['03-fstring','/?page=activity&id=mk3-fstring'],['04-gugudan','/?page=activity&id=mk3-gugudan-horizontal-fstring'],['05-codeup','/?page=codeup&id=1173'],['06-inquiry-a','/list-tuple-dictionary.html'],['07-report','/?page=report']]){await open(page,path);await shot(page,name);}
 await open(page,'/?page=questions');await expect(page.locator('[data-question]')).toHaveCount(40);await page.getByLabel('q01 답',{exact:true}).fill('30');await page.locator('[data-check=q01]').click();await expect(page.locator('[data-question=q01] .feedback')).toContainText('다시');await page.locator('#wrong-only').check();await expect(page.locator('[data-question]')).toHaveCount(1);await page.locator('#retry-questions').click();await expect(page.locator('[data-question]')).toHaveCount(40);await page.getByLabel('q19 답',{exact:true}).fill('28');await page.locator('[data-check=q19]').click();await expect(page.locator('[data-question=q19] .feedback')).toContainText('다시');await page.getByLabel('q19 답',{exact:true}).fill('2 8');await page.locator('[data-check=q19]').click();await expect(page.locator('[data-question=q19] .feedback')).toContainText('맞았습니다');
 await open(page,'/?page=activity&id=mk3-gugudan-horizontal-fstring');const result=await run(page,undefined,'2\n4\n');if(result.trimEnd().split('\n').length!==9)throw Error('horizontal rows');await expect(page.locator('#trace-body tr')).not.toHaveCount(0);await shot(page,'08-gugudan-result');
 await open(page,'/?page=activity&id=mk3-turtle-circles');await run(page);await expect(page.locator('#turtle-result')).toBeVisible();const painted=await page.locator('#turtle-canvas').evaluate(c=>{const p=c.getContext('2d').getImageData(0,0,600,440).data;let changed=0;for(let i=0;i<p.length;i+=4)if(p[i]>80&&p[i+1]>50)changed++;return changed;});if(painted<200)throw Error('no real turtle geometry');await shot(page,'09-turtle-result');await verifyPngDownload(page);
 await open(page,'/?page=activity&id=mk3-plot-bar');await run(page);await expect(page.locator('#plot')).toBeVisible();const plot=await page.locator('#plot').getAttribute('src');if(plot.length<5000)throw Error('matplotlib result too small');await shot(page,'10-matplotlib-result');await verifyPngDownload(page);
 // Per-run state cannot survive. The iframe has no same-origin privilege.
 await open(page,'/?page=practice');await run(page,'saved_global = 42\nprint("first")\n','');await page.locator('#space-view').click();const isolated=await run(page,'print("saved_global" in globals())\n','');if(isolated.trim()!=='False')throw Error('Python globals survived');await expect(page.locator('#space-view')).toHaveText('공백·줄바꿈 보기');await page.locator('#space-view').click();await expect(page.locator('#output')).toContainText('False');await expect(page.locator('#output')).not.toContainText('first');
 await page.locator('#editor').fill('while True:\n    pass');await page.locator('#run').click();await expect(page.locator('iframe[sandbox="allow-scripts"]')).toHaveCount(1);await page.locator('#stop').click();await expect(page.locator('#run-state')).toHaveText('실행 오류');await expect(page.locator('iframe[sandbox="allow-scripts"]')).toHaveCount(0);
 for(const width of [390,768,1366,1920]){
  await page.setViewportSize({width,height:950});await open(page,'/');const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(overflow)throw Error('Home overflow '+width);await shot(page,'home-'+width);
  await open(page,'/?page=activity&id=mk3-list-edit');const extra=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(extra)throw Error('Editor overflow '+width);await shot(page,'list-'+width);
 }
 await page.setViewportSize({width:1366,height:950});await open(page,'/');await page.evaluate(()=>document.documentElement.style.zoom='2');if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('200 percent overflow');await shot(page,'zoom-200');await page.evaluate(()=>document.documentElement.style.zoom='1');
 await open(page,'/?page=review&section=gallery');
 for(const mode of ['particles','aurora','warp','chaos','alpha','waves']){
  await page.locator('#gallery-mode').selectOption(mode);const frame=page.frameLocator('#gallery-frame');await expect(frame.locator('body')).toHaveAttribute('data-mode',mode);
  await frame.getByRole('button',{name:'움직임 시작',exact:true}).click();await expect(frame.getByRole('button',{name:'움직임 중지',exact:true})).toBeVisible();await frame.getByRole('button',{name:'움직임 중지',exact:true}).click();await frame.getByRole('button',{name:'초기화',exact:true}).click();
 }
 await shot(page,'gallery');
 await page.keyboard.press('Tab');const focused=await page.evaluate(()=>document.activeElement?.tagName);if(!focused||focused==='BODY')throw Error('keyboard focus absent');
 // 06 / list reversal: compare two techniques visually, including mutation and None.
 await page.setViewportSize({width:1366,height:950});
 await open(page,'/?page=lesson&unit=06');
 await expect(page.getByRole('link',{name:'비교 실험실 열기 →'})).toBeVisible();
 await open(page,'/?page=activity&id=mk3-list-sort');
 await expect(page.locator('#reverse-compare')).toBeVisible();
 await expect(page.locator('[data-reverse-list="slice-original"] .reverse-chip')).toHaveCount(5);
 await expect(page.locator('[data-reverse-summary]')).toBeHidden();
 await page.locator('[data-reverse-control="next"]').click();
 await expect(page.locator('[data-reverse-list="slice-result"] .reverse-chip--new')).toHaveCount(5);
 await expect(page.locator('[data-reverse-list="method-original"] .reverse-chip--mutated')).toHaveCount(5);
 await expect(page.locator('[data-reverse-list="method-result"] .reverse-none')).toHaveText('None');
 await expect(page.locator('[data-reverse-list="slice-original"] .reverse-chip').first()).toHaveText('10');
 await expect(page.locator('[data-reverse-list="method-original"] .reverse-chip').first()).toHaveText('50');
 await page.locator('[data-reverse-control="next"]').click();
 await expect(page.locator('[data-reverse-output="slice"]')).toContainText('[10, 20, 30, 40, 50]');
 await expect(page.locator('[data-reverse-output="method"]')).toContainText('None');
 await page.locator('[data-reverse-control="next"]').click();
 await expect(page.locator('[data-reverse-summary]')).toBeVisible();
 await expect(page.locator('[data-reverse-control="next"]')).toBeDisabled();
 await page.locator('[data-reverse-control="reset"]').click();
 await expect(page.locator('[data-reverse-control="previous"]')).toBeDisabled();
 await page.locator('[data-reverse-control="auto"]').click();
 await expect(page.locator('[data-reverse-summary]')).toBeVisible({timeout:8000});
 await expect(page.locator('#editor')).toHaveValue(/a\.reverse\(\)/);
 await page.locator('[data-reverse-apply="slice"]').click();
 await expect(page.locator('#editor')).toHaveValue(/result = a\[::-1\]/);
 await expect(page.locator('[data-reverse-live-status]')).toContainText('아래 Python 편집기에');
 await page.locator('#run').click();
 await expect(page.locator('#run-state')).toHaveText('실행 성공',{timeout:150000});
 await expect(page.locator('#output')).toContainText('[50, 40, 30, 20, 10]');
 await expect(page.locator('#output')).toContainText('[10, 20, 30, 40, 50]');
 await shot(page,'reverse-comparison-desktop');
 await page.setViewportSize({width:390,height:844});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Reverse comparison mobile overflow');
 await shot(page,'reverse-comparison-mobile');
 evidence.push({reverseComparison:'PASS: two methods, result None, state snapshots, 4 steps, autoplay, load real Python code, 390px responsive'});
 const sandboxOutput=await run(page,'import js\nprint(hasattr(js, "document"))\nprint(hasattr(js, "parent"))\nprint(js.location.origin)');
 if(sandboxOutput.trim()!=='False\nFalse\nnull')throw Error('Python sandbox exposed a non-opaque parent context: '+sandboxOutput);
 evidence.push({pythonIsolation:'no document, no parent, opaque null origin'});
 evidence.push({status:'pass',checks:['6 menus','legacy aliases','40 questions and wrong-only','stdin and horizontal output','real Turtle commands','real matplotlib with Korean font','Turtle and matplotlib PNG exports','per-run isolation and stop','390/768/1366/1920','200% zoom','keyboard focus']});
 console.log('PASS MK V3 content, runtime, responsive and keyboard browser checks');
}catch(error){if(context){const pages=context.pages();if(pages.length)await shot(pages.at(-1),'failure').catch(()=>{});}throw error;}
finally{await writeFile('.artifacts/mk-v3/results.json',JSON.stringify(evidence,null,2));await browser.close();await new Promise(r=>server.close(r));}
