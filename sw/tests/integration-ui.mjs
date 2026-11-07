import {chromium,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const dist=resolve('dist'),out='sw/evidence/integration-20261107';await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm','.py':'text/plain','.csv':'text/csv'};
const server=createServer(async(req,res)=>{try{let name=decodeURIComponent(new URL(req.url,'http://local').pathname);if(name.endsWith('/'))name+='index.html';const file=resolve(dist,'.'+name);assert(file.startsWith(dist+sep));res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch();const context=await browser.newContext({locale:'ko-KR',viewport:{width:1440,height:1000}}),page=await context.newPage();
const results=[],errors=[];page.on('pageerror',e=>errors.push({url:page.url(),error:e.message}));
const scenario=async(name,fn)=>{try{await fn();results.push({name,status:'PASS'});console.log('PASS',name);}catch(e){results.push({name,status:'FAIL',message:e.message});console.log('FAIL',name,e.message);await page.screenshot({path:out+'/failure-'+results.length+'.png'});}};
const frame=()=>page.frameLocator('#sw-classroom-frame');
async function go(path){await page.goto(origin+path);await expect(page.locator('#sw-save-state')).not.toHaveText('로그인 상태 확인 중',{timeout:30000});}
async function edit(scope,code){const e=scope.locator('.cm-content').first();await e.click();await e.press('ControlOrMeta+a');await e.fill(code);}
async function done(scope){await expect(scope.locator('[role=status]').first()).toContainText(/정상 완료|실행 완료|오류/, {timeout:150000});}
try{
 await scenario('first pandas page, no early stdout, real table at last step and rewind',async()=>{
  await go('/?page=data-lab&unit=SW01');const code=await page.locator('.cm-content').innerText();assert.equal((code.match(/^import /gm)||[]).length,1);assert(code.includes('import pandas as pd'));
  await page.getByRole('button',{name:'한 줄씩 보기',exact:true}).click();await expect(page.getByTestId('data-status')).toContainText('실행 완료',{timeout:150000});
  await expect(page.getByTestId('trace-stdout')).toHaveText('(출력 없음)');assert.equal(await page.locator('.sw-object').count(),0);
  await page.getByRole('button',{name:'마지막',exact:true}).click();await expect(page.getByTestId('trace-stdout')).toContainText('(3, 2)');await expect(page.locator('.sw-object table').first()).toBeVisible();
  await page.screenshot({path:out+'/desktop-pandas-trace.png'});
  await page.getByRole('button',{name:'처음',exact:true}).click();await expect(page.getByTestId('trace-stdout')).toHaveText('(출력 없음)');assert.equal(await page.locator('.sw-object').count(),0);
 });
 await scenario('regular lesson uses common editor, true run, and original progress',async()=>{
  await go('/?page=lesson&lesson=1');const f=frame();await expect(f.locator('.sw-legacy-practice .cm-content')).toBeVisible({timeout:30000});
  assert((await f.locator('.cm-content').innerText()).includes('import pandas as pd'));const box=f.locator('.sw-practice');
  await box.getByRole('button',{name:'전체 실행',exact:true}).click();await done(box);await expect(box.getByTestId('trace-stdout')).toHaveText('(출력 없음)');
  await expect(f.locator('#next')).toBeEnabled();await f.locator('#next').click();await expect(f.locator('#stepNumber')).toContainText('2단계');await expect(f.locator('.sw-practice')).toHaveCount(1);
  await page.screenshot({path:out+'/desktop-lesson-common.png'});
 });
 await scenario('Turtle moves, rotates without drawing, replays exactly and invalidates edited code',async()=>{
  await go('/?page=practice');const box=page.locator('.sw-practice');await expect(box).toBeVisible();
  await edit(box,'import turtle\nt = turtle.Turtle()\nt.forward(100)\nt.left(90)\nt.forward(50)\n');await box.getByRole('button',{name:'한 줄씩 보기',exact:true}).click();await done(box);
  await expect(box.locator('.sw-turtle')).toHaveCount(0);await box.getByRole('button',{name:'마지막',exact:true}).click();await expect(box.locator('figcaption')).toContainText('(100.00, 50.00)');
  await expect(box.locator('svg line')).toHaveCount(2);await page.screenshot({path:out+'/desktop-turtle-trace.png'});
  for(let i=0;i<2;i++)await box.getByRole('button',{name:'이전',exact:true}).click();await expect(box.locator('svg line')).toHaveCount(1);await expect(box.locator('figcaption')).toContainText('90.0°');
  await box.getByRole('button',{name:'처음',exact:true}).click();await expect(box.locator('svg')).toHaveCount(0);
  await edit(box,'X=7\nprint(X)');await expect(box.getByTestId('trace-stdout')).toHaveCount(0);await box.getByRole('button',{name:'전체 실행',exact:true}).click();await done(box);await expect(box.getByTestId('trace-stdout')).toHaveText('7\n');
  await box.locator('.cm-content').press('ControlOrMeta+Enter');await done(box);await expect(box.getByTestId('trace-stdout')).toHaveText('(출력 없음)');await box.getByRole('button',{name:'마지막',exact:true}).click();await expect(box.getByTestId('trace-stdout')).toHaveText('7\n');
 });
 await scenario('step controls and code usable at 390px',async()=>{
  await page.setViewportSize({width:390,height:844});await go('/?page=practice');await expect(page.locator('.cm-content')).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert(overflow<=2,'horizontal overflow '+overflow);
  await page.screenshot({path:out+'/mobile-practice.png'});
  await go('/?page=lesson&lesson=1');await expect(frame().locator('.cm-content')).toBeVisible({timeout:30000});
  const inner=page.frames().find(f=>f.parentFrame());assert(await inner.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=2);await page.screenshot({path:out+'/mobile-lesson.png'});
 });
 await scenario('all 18 mastery editors and 10 archived editors mount',async()=>{
  await page.setViewportSize({width:1440,height:1000});
  for(const route of ['mastery','final-course']){
   const count=route==='mastery'?18:10;await go('/?page='+route);const f=frame();
   for(let i=0;i<count;i++){
    if(i){if(route==='mastery')await f.locator('#next').click();else await f.locator('#final-next').click();}
    await expect(f.locator('.sw-legacy-practice .cm-content')).toBeVisible({timeout:30000});
    const text=await f.locator('.sw-legacy-practice .cm-content').innerText();assert(text.includes('import pandas'));
    assert.equal(await f.locator('.sw-legacy-practice').count(),1);
   }
  }
 });
 await scenario('CP949 CSV import, file download, reset undo and invalidation',async()=>{
  await go('/?page=practice');const box=page.locator('.sw-practice');await edit(box,'import pandas as pd\ndf=pd.read_csv("data.csv")\nprint(df.iloc[0,0])\ndf.to_csv("result.csv",index=False)');
  await box.getByText(/CSV·자료 파일/).click();await box.getByLabel('자료 인코딩').selectOption('euc-kr');
  await box.getByLabel('자료 업로드').setInputFiles({name:'data.csv',mimeType:'text/csv',buffer:Buffer.from([0xbb,0xf3,0xc7,0xb0,10,0xbb,0xa7,10])});
  await box.getByRole('button',{name:'전체 실행',exact:true}).click();await done(box);await expect(box.getByRole('link',{name:'result.csv 내려받기'})).toBeVisible();
  const file=await box.getByRole('link',{name:'result.csv 내려받기'}).getAttribute('href');assert(file.startsWith('data:application/octet-stream;base64,'));
  await box.getByRole('button',{name:'선생님 코드로 되돌리기',exact:true}).click();await expect(box.getByTestId('trace-stdout')).toHaveCount(0);await box.getByRole('button',{name:'되돌리기 취소',exact:true}).click();assert((await box.locator('.cm-content').innerText()).includes('result.csv'));
 });
 await scenario('artwork replay, pause, seek, speed and route disposal',async()=>{
  await go('/?page=exercise&exercise=sw3-2026-g2-swx0125');const box=page.locator('.sw-practice');await expect(box.locator('.cm-content')).toBeVisible();
  // Editing before automatic visibility run also proves user code is executed.
  const code=JSON.parse(await readFile('sw/exercises.json','utf8')).find(e=>e.sourceId==='SWX0125').teacherCode;await edit(box,code+'\n# 사용자 실행\n');
  await box.getByRole('button',{name:'전체 실행',exact:true}).click();await done(box);await expect(box.locator('canvas')).toBeVisible();
  await box.getByRole('button',{name:'기록 재생',exact:true}).click();await expect(box.getByRole('button',{name:'일시정지',exact:true})).toBeVisible();await box.getByRole('button',{name:'일시정지',exact:true}).click();
  await box.getByLabel('재생 간격').selectOption('30');await box.getByRole('button',{name:'마지막 프레임',exact:true}).click();await expect(box.getByLabel('작품 프레임')).toHaveValue('89');
  await box.getByRole('button',{name:'처음',exact:true}).click();await expect(box.getByLabel('작품 프레임')).toHaveValue('0');await page.screenshot({path:out+'/desktop-artwork.png'});
  await go('/?page=home');assert.equal(await page.locator('canvas').count(),0);
 });
}finally{await writeFile(out+'/ui-results.json',JSON.stringify({results,errors},null,2));await browser.close();server.close();}
if(results.some(r=>r.status==='FAIL')||errors.length)process.exitCode=1;
