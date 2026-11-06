// Targeted Chromium checks. Fake video is NOT evidence of real face recognition.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.AVATAR_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('public/pandas-data-lab'),base=process.env.AVATAR_LIVE_URL||'https://sw.englishmath.kr/';
(async()=>{
 const browser=await chromium.launch({headless:true});const context=await browser.newContext();const page=await context.newPage();page.setDefaultTimeout(20000);
 const requests=[],errors=[];page.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()}));page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')console.log('Browser:',m.text());});page.on('requestfailed',r=>console.log('Request failure:',r.url(),r.failure()?.errorText));
 if(!process.env.AVATAR_LIVE_URL)await context.route('https://sw.englishmath.kr/**',async r=>{const u=new URL(r.request().url());let file=path.join(root,decodeURIComponent(u.pathname));if(u.pathname==='/')file=path.join(root,'index.html');if(!file.startsWith(root)||!fs.existsSync(file))return r.fulfill({status:404,body:'Missing test asset'});const ext=path.extname(file);const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.wasm':'application/wasm','.css':'text/css','.json':'application/json','.png':'image/png','.zip':'application/zip'}[ext]||'application/octet-stream';await r.fulfill({status:200,headers:{'access-control-allow-origin':'*'},contentType:mime,body:fs.readFileSync(file)});});
 const response=await page.goto(base+'ai-avatar.html');assert.equal(response.status(),200);
 await page.locator('.animal-option').last().waitFor();assert.equal(await page.locator('.animal-option').count(),8);
 fs.mkdirSync('avatar-evidence',{recursive:true});
 for(const width of [1366,390]){await page.setViewportSize({width,height:width===390?844:768});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`avatar-evidence/${width}.png`,fullPage:true});}
 for(let i=0;i<8;i++){await page.locator('.animal-option').nth(i).click();assert.equal(await page.locator('.animal-option').nth(i).getAttribute('aria-pressed'),'true');}
 await page.locator('#smile').fill('.82');await page.waitForFunction(()=>document.querySelector('#mission-smile').classList.contains('done'));
 await page.locator('#blink').fill('1');await page.waitForTimeout(100);await page.locator('#blink').fill('0');assert.ok(await page.locator('#mission-blink').evaluate(e=>e.classList.contains('done')));
 await page.locator('#tilt').fill('-20');await page.locator('#tilt').fill('20');assert.ok(await page.locator('#mission-tilt').evaluate(e=>e.classList.contains('done')));
 await page.locator('#snapshot').click();assert.ok((await page.locator('#code').inputValue()).startsWith('smile_score = 0.820'));
 await page.locator('#run-python').click();await page.waitForFunction(()=>document.querySelector('#python-status').textContent.includes('실제 Python 실행 완료'),{},{timeout:90000});assert.match(await page.locator('#output').innerText(),/HAPPY/);
 await page.locator('#code').fill('import sys\nprint(sys.implementation.name)\nprint(3 * 7)\n');await page.locator('#run-python').click();await page.waitForFunction(()=>document.querySelector('#python-status').textContent.includes('실제 Python 실행 완료'),{},{timeout:90000});assert.match(await page.locator('#output').innerText(),/cpython\n21/);
 await page.locator('#code').fill('if True print("broken")');await page.locator('#run-python').click();await page.waitForFunction(()=>document.querySelector('#output').textContent.includes('SyntaxError'),{},{timeout:90000});
 await page.locator('#code').fill('while True:\n    pass');await page.locator('#run-python').click();await page.locator('#stop-python').click();await page.waitForFunction(()=>document.querySelectorAll('iframe').length===0);
 // Denied/no camera preserve complete virtual learning; no permission bypass.
 for(const name of ['NotAllowedError','NotFoundError']){await page.evaluate(name=>{navigator.mediaDevices.getUserMedia=()=>Promise.reject(new DOMException('test',name));},name);await page.locator('#start-camera').click();await page.waitForFunction(()=>document.querySelector('#camera-status').textContent.includes('같은 수업'));assert.equal(await page.locator('#mode').innerText(),'가상 실험값 · 실제 얼굴 인식 아님');}
 // Actual model initialization and inference on synthetic BLACK video: no real face.
 await page.evaluate(()=>{window.testStream=null;navigator.mediaDevices.getUserMedia=async()=>{const c=document.createElement('canvas');c.width=640;c.height=480;c.getContext('2d').fillRect(0,0,640,480);window.testStream=c.captureStream(10);return window.testStream;};});
 await page.locator('#start-camera').click();await page.waitForFunction(()=>document.querySelector('#camera-status').textContent.includes('얼굴을 찾지 못했습니다'),{},{timeout:90000});
 await page.locator('#stop-camera').click();assert.ok(await page.evaluate(()=>window.testStream.getTracks().every(t=>t.readyState==='ended')));assert.equal(await page.locator('#camera').evaluate(v=>v.srcObject),null);
 // Model download failure stops every track and leaves virtual mode usable.
 await context.route('**/avatar-vendor/face_landmarker.task',r=>r.abort());await page.locator('#start-camera').click();await page.waitForFunction(()=>document.querySelector('#camera-status').textContent.includes('같은 수업'),{},{timeout:90000});assert.ok(await page.evaluate(()=>window.testStream.getTracks().every(t=>t.readyState==='ended')));
 await page.locator('#end').click();assert.equal(await page.locator('#smile').inputValue(),'0');
 assert.equal(requests.filter(r=>r.method!=='GET'||r.body).length,0);assert.equal(requests.filter(r=>!r.url.startsWith(base)&&!r.url.startsWith('blob:')&&!r.url.startsWith('data:')).length,0);
 assert.equal(errors.length,0,errors.join('\n'));
 fs.writeFileSync('avatar-evidence/results.json',JSON.stringify({passed:true,viewports:[1366,390],animals:8,python:'CPython + 21 + HAPPY + SyntaxError + stop',camera:'denied, missing, synthetic black input model initialization/inference, stop, model failure',realWebcam:false,edge:false,uploads:0,requests:requests.length},null,2));
 console.log('PASS: viewports, 8 avatars, missions, actual CPython, permission handling, real model/black synthetic video, stop, model failure; upload requests 0. Real webcam/Edge NOT tested.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
