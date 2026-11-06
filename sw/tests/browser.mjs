import assert from 'node:assert/strict';
import {chromium,expect as pwExpect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {initializeTestEnvironment} from '@firebase/rules-unit-testing';
import {doc,collection,getDocFromServer,getDocs,setDoc,Timestamp} from 'firebase/firestore';
const expect=pwExpect.configure({timeout:25000}),exec=promisify(execFile),projectId='demo-englishmath-python',artifacts=resolve('sw/evidence');
for(const k of ['FIRESTORE_EMULATOR_HOST','FIREBASE_AUTH_EMULATOR_HOST'])if(process.env[k]&&!/^(127\.0\.0\.1|localhost):\d+$/.test(process.env[k]))throw Error('Local emulator only');
await mkdir(artifacts,{recursive:true});
const env=await initializeTestEnvironment({projectId,firestore:{host:'127.0.0.1',port:8080,rules:await readFile('sw/security/proposed.rules','utf8')}});
const people=Object.fromEntries(['student','other','avatar','idle'].map(k=>[k,{uid:'sw-v2-'+k,email:'sw-v2-'+k+'@muhak-g-h.gne.go.kr',name:'SW 검증 '+k}]));
const results=[],errors=[],devices=[],vendorCache=new Map(),dist=resolve('dist');
let browser,server,origin,lastPage;
const frame=p=>p.frameLocator('#sw-classroom-frame');
const fixture='SW_V2_EMULATOR_20261107';
async function admin(fn){let value;await env.withSecurityRulesDisabled(async c=>{value=await fn(c.firestore());});return value;}
async function record(uid,id){return admin(async db=>{const s=await getDocFromServer(doc(db,'users',uid,'workspaces',id));return s.exists()?s.data():null;});}
async function scope(uid){return admin(async db=>{const out={};for(const g of ['workspaces','progress','revisions','submissions','limits'])out[g]=(await getDocs(collection(db,'users',uid,g))).docs.map(d=>[d.id,d.data()]).sort();return JSON.stringify(out);});}
const value=async(uid,id)=>{const r=await record(uid,id);return r?JSON.parse(r.code).value:null;};
async function seed(){
 await env.clearFirestore();await admin(async db=>{
  await Promise.all([setDoc(doc(db,'config/access'),{allowedDomains:['muhak-g-h.gne.go.kr'],allowedEmails:[]}),setDoc(doc(db,'classes/class-2-1'),{title:'2026학년도 2학년 1반',active:true}),
   ...Object.values(people).map(p=>setDoc(doc(db,'users',p.uid),{email:p.email,displayName:p.name,classId:'class-2-1',status:'approved',createdAt:Timestamp.now(),updatedAt:Timestamp.now()}))]);
 });
 const cleared=await fetch('http://127.0.0.1:9099/emulator/v1/projects/'+projectId+'/accounts',{method:'DELETE'});assert(cleared.ok);
 const imported=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/'+projectId+'/accounts:batchCreate',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({users:Object.values(people).map(p=>({localId:p.uid,email:p.email,emailVerified:true,displayName:p.name,providerUserInfo:[{providerId:'google.com',rawId:p.email,email:p.email,displayName:p.name}]}))})});assert(imported.ok);
}
async function device(path='/?page=home',{clock=false,camera=false}={}){
 const context=await browser.newContext({locale:'ko-KR',viewport:{width:1440,height:1000},permissions:camera?['camera']:[]});
 await context.route('**/student-config.json',r=>r.fulfill({json:{enabled:true,emulator:true,firebase:{apiKey:'fake-api-key',authDomain:projectId+'.firebaseapp.com',projectId,appId:'sw-emulator-test'}}}));
 await context.route('https://**/*',async r=>{
  const url=new URL(r.request().url());if(!['apis.google.com','www.gstatic.com'].includes(url.hostname))return r.abort();
  if(!vendorCache.has(url.href))vendorCache.set(url.href,exec('curl',['--fail','--silent','--show-error','--location','--retry','1','--max-time','30','--url',url.href],{encoding:'buffer',maxBuffer:64000000}).then(x=>x.stdout));
  await r.fulfill({body:await vendorCache.get(url.href),contentType:'text/javascript'});
 });
 const p=await context.newPage();lastPage=p;if(clock)await p.clock.install();
 p.on('pageerror',e=>errors.push({url:p.url(),message:e.message}));
 await p.addInitScript(()=>{try{if(navigator.mediaDevices){const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=async c=>{const stream=await original(c);top.__mockTracks??=[];top.__mockTracks.push(...stream.getTracks());return stream;};}}catch{}});
 const writes=[];p.on('request',r=>{if(/\/documents:commit$|Firestore\/Commit|Firestore\/Write\/channel/.test(r.url())&&/writes|commit/i.test(r.postData()||''))writes.push(r.url());});
 devices.push({context,page:p,writes});await p.goto(origin+path);await expect(p.locator('#sw-save-state')).not.toHaveText('로그인 상태 확인 중');return {context,page:p,writes};
}
async function login(p,person){
 const popup=p.waitForEvent('popup');await p.locator('#sw-login').click();const q=await popup;await q.waitForLoadState();await q.getByText(person.email,{exact:true}).click();
 await expect(p.locator('#sw-user')).toContainText(person.name);await expect(p.locator('#sw-space')).toHaveText('2026학년도 2학년 1반');
 await expect(p.locator('#sw-message')).not.toContainText('승인 정보를 읽지 못했습니다');
 await expect(p.locator('#sw-message')).not.toContainText('학습을 마쳤습니다');
 await expect(p.locator('#sw-message')).not.toContainText('15분 동안');
}
async function nav(p,id){await p.locator('a[data-route="'+id+'"]').click();await expect(p).toHaveURL(new RegExp('[?&]page='+id+'(?:&|$)'));if(id!=='data-lab'&&id!=='practice'&&id!=='library')await expect(p.locator('#sw-classroom-frame')).toBeVisible();}
async function scenario(name,fn){
 const started=Date.now();try{await fn();results.push({name,status:'PASS',durationMs:Date.now()-started,environment:'Chromium + Firebase emulators'});console.log('PASS',name);}catch(e){results.push({name,status:'FAIL',error:e.message,durationMs:Date.now()-started});throw e;}
}
async function shot(p,name){await p.screenshot({path:resolve(artifacts,name+'.png'),fullPage:false});if(['datalab-python-table','lesson-account-restored','avatar-common-menu','layout-390','home-390','home-1440'].includes(name)){const b=await p.screenshot({type:'jpeg',quality:55,fullPage:false});console.log('SW_PREVIEW '+name+' '+b.toString('base64'));}}
try{
 await seed();const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm','.py':'text/plain','.csv':'text/csv'};
 server=createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname.endsWith('/'))pathname+='index.html';const file=resolve(dist,'.'+pathname);if(!file.startsWith(dist+sep))throw Error('path');res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
 await scenario('native data lab: pandas-only first program, actual Python table and unit navigation',async()=>{
  const {page:p}=await device('/?page=data-lab&unit=SW01');
  await expect(p.locator('.visual-editor .cm-content')).toBeVisible();const code=await p.locator('.cm-content').innerText();
  assert.equal((code.match(/^import /gm)||[]).length,1);assert(code.includes('import pandas as pd'));assert(!code.includes('StringIO'));
  await p.getByRole('button',{name:'▶ 실제 Python 실행',exact:true}).click();
  await expect(p.getByTestId('data-status')).toContainText('실행 완료',{timeout:150000});await expect(p.getByTestId('data-stdout')).toContainText('(3, 2)');
  await expect(p.locator('table').first()).toBeVisible();await shot(p,'datalab-python-table');
  for(const [unit,example,expected] of [['SW03',null,'(2, 2)'],['SW03','iloc · 위치 0:1','(1, 2)'],['SW04',null,'(2, 2)'],['SW04','판매량 내림차순','[20, 30, 10]']]){
   if(!example)await p.locator('nav[aria-label="데이터 차시"] button').filter({hasText:unit==='SW03'?'loc와 iloc':'남기고'}).click();
   else{p.once('dialog',d=>d.accept());await p.getByRole('button',{name:example,exact:true}).click();}
   await p.getByRole('button',{name:'▶ 실제 Python 실행',exact:true}).click();await expect(p.getByTestId('data-status')).toContainText('실행 완료',{timeout:150000});await expect(p.getByTestId('data-stdout')).toContainText(expected);await expect(p.locator('table').first()).toBeVisible();
   await p.getByRole('button',{name:'이전 단계',exact:true}).click();await expect(p.getByRole('button',{name:'다음 단계',exact:true})).toBeEnabled();await p.getByRole('button',{name:'최종 결과',exact:true}).click();
  }
  await nav(p,'home');await expect(p.locator('iframe[sandbox]')).toHaveCount(0);
  await p.locator('.sw-external a').evaluate(a=>({href:a.href,target:a.target})).then(a=>{assert.equal(a.href,'https://englishmath-python.vercel.app/data-lab');assert.equal(a.target,'_blank');});
  await expect(p.locator('.sw-external')).toContainText('새 파이썬 교실 체험 ↗');await expect(p.locator('#sw-save')).toBeHidden();
  await expect(frame(p).locator('.sw-home-route a')).toHaveCount(4);
  await expect(frame(p).locator('.sw-home-inquiries a')).toHaveCount(4);
  await expect(frame(p).locator('#home > .classroom-hero')).toBeVisible();
  await expect(frame(p).locator('.sw-home-extras .avatar-launch')).toBeVisible();
  for(const width of [390,1440]){await p.setViewportSize({width,height:1000});await expect.poll(()=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);await expect.poll(()=>frame(p).locator('body').evaluate(e=>e.scrollWidth<=e.ownerDocument.documentElement.clientWidth+2)).toBe(true);await shot(p,'home-'+width);}

  await p.context().close();
 });
 await scenario('isolated Python: input, Korean matplotlib, PNG download, loop stop and denied network',async()=>{
  const {page:p}=await device('/?page=practice&workspace=scratch-01');await expect(p.locator('#sw-code')).toBeVisible();
  await p.locator('#sw-code').fill('name=input()\nprint("안녕",name)');await p.locator('#sw-stdin').fill('파이썬');await p.locator('#sw-run').click();await expect(p.locator('#sw-output')).toContainText('안녕 파이썬',{timeout:150000});
  await p.locator('#sw-code').fill('import matplotlib.pyplot as plt\nplt.plot([1,2,3],[2,4,3])\nplt.title("가상 자료 분석")\nplt.show()');await p.locator('#sw-run').click();await expect(p.locator('#sw-plot img')).toBeVisible({timeout:150000});
  await expect(p.locator('#sw-output')).not.toContainText('Glyph');const d=p.waitForEvent('download');await p.getByRole('link',{name:'그래프 PNG 내려받기'}).click();assert((await d).suggestedFilename().endsWith('.png'));await shot(p,'python-korean-plot');
  await p.locator('#sw-code').fill('from js import fetch\nfetch("https://example.invalid/private")\nprint("request attempted")');await p.locator('#sw-run').click();await expect(p.locator('#sw-run')).toBeEnabled({timeout:150000});
  await p.locator('#sw-code').fill('while True:\n    pass');await p.locator('#sw-run').click();await expect(p.locator('#sw-run-state')).toContainText('실행',{timeout:150000});await p.locator('#sw-stop').click();await expect(p.locator('#sw-run')).toBeEnabled();await expect(p.locator('iframe[sandbox]')).toHaveCount(0);
  await p.context().close();
 });
 let school,home;
 await scenario('one login survives menu movement; 60-second automatic code save',async()=>{
  school=await device('/?page=lesson&lesson=1');const p=school.page;await login(p,people.student);const t=await p.evaluate(()=>performance.timeOrigin);
  await expect(frame(p).locator('#editor')).toBeVisible();await frame(p).locator('#editor').fill('print("'+fixture+'")');
  await expect.poll(async()=> (await record(people.student.uid,'lesson-01'))?.code,{timeout:100000}).toBe('print("'+fixture+'")');
  await expect(p.locator('#sw-save-state')).toContainText('클라우드 저장 완료');
  for(const id of ['home','data','exam','report','python-review','data-lab','library','lesson']){await nav(p,id);await expect(p.locator('#sw-user')).toContainText(people.student.name);assert.equal(await p.evaluate(()=>performance.timeOrigin),t);}
  await expect(frame(p).locator('#editor')).toHaveValue('print("'+fixture+'")');
  await frame(p).locator('#lessonPicker summary').click();await frame(p).locator('.lesson-nav[data-lesson="1"]').click();await expect(p).toHaveURL(/page=lesson&lesson=2/);await expect(frame(p).locator('#heroTitle')).toContainText('2차시');
  await frame(p).locator('#lessonPicker summary').click();await frame(p).locator('.lesson-nav[data-lesson="0"]').click();await expect(frame(p).locator('#editor')).toHaveValue('print("'+fixture+'")');await shot(p,'lesson-account-restored');
 });
 await scenario('step predictions/input, ungraded review, seven report fields and data lab stay dirty across screens',async()=>{
  const p=school.page;await frame(p).locator('#predictInput').fill('예측 '+fixture);await frame(p).locator('#reflection').fill('해석 '+fixture);await frame(p).locator('#stdin').fill('7\n8');await frame(p).locator('#lessonQuiz input[type=radio]').first().check();
  await frame(p).locator('#addExample').click();await frame(p).locator('#run').click();await expect(frame(p).locator('#next')).toBeEnabled({timeout:150000});await frame(p).locator('#next').click();await expect(frame(p).locator('#stepNumber')).toContainText('2단계');await frame(p).locator('#predictInput').fill('예측 '+fixture);await frame(p).locator('#gradeQuiz').click();
  await nav(p,'exam');await frame(p).locator('input[name=eq0][value="1"]').check();await frame(p).locator('input[name=eq1][value="2"]').check();
  await frame(p).locator('#gradeExam').click();await expect(frame(p).locator('#examResult')).toContainText('/ 20점');await frame(p).locator('#sw-exam-filter').selectOption('wrong');await expect(frame(p).locator('#examQuiz .quiz-item:visible').first()).toBeVisible();
  await frame(p).locator('#sw-exam-filter').selectOption('all');await frame(p).locator('#retryExam').click();await expect(frame(p).locator('input[type=radio]:checked')).toHaveCount(0);
  await frame(p).locator('input[name=eq0][value="1"]').check();await frame(p).locator('input[name=eq1][value="2"]').check();await frame(p).locator('#sw-exam-filter').selectOption('wrong');
  await nav(p,'report');const fields=frame(p).locator('[data-report]');await expect(fields).toHaveCount(7);for(let i=0;i<7;i++)await fields.nth(i).fill(fixture+' 보고서 '+i);
  await nav(p,'data-lab');await p.locator('.cm-content').fill('import pandas as pd\ndf = pd.DataFrame({"값":[1,2]})\nbefore = df.copy()\nresult = df.copy()\nprint(result.shape)');
  await p.getByLabel('예측한 답').first().fill('(2, 1)');await p.getByLabel('분석·해석').fill('두 행 한 열 '+fixture);
  await nav(p,'report');await expect(frame(p).locator('[data-report=question]')).toHaveValue(fixture+' 보고서 0');
  await p.locator('#sw-end').click();await p.getByRole('button',{name:'모두 저장 후 종료',exact:true}).click();await expect(p.locator('#sw-user')).toHaveText('로그인 전',{timeout:160000});
  assert.equal((await value(people.student.uid,'sw2-review')).graded,false);assert.equal((await value(people.student.uid,'sw2-review')).answers[0],1);assert.equal((await value(people.student.uid,'sw2-report')).next,fixture+' 보고서 6');assert.equal((await value(people.student.uid,'sw2-lesson-01-state')).stdin,'7\n8');
  await expect(p.locator('iframe[sandbox]')).toHaveCount(0);await shot(p,'finish-cleared');
 });
 await scenario('separate browser context restores server records; next shared-PC account cannot see prior answers',async()=>{
  home=await device('/?page=report');const p=home.page;assert.notEqual(home.context,school.context);await login(p,people.student);
  await expect(frame(p).locator('[data-report=question]')).toHaveValue(fixture+' 보고서 0');await nav(p,'exam');await expect(frame(p).locator('input[name=eq0][value="1"]')).toBeChecked();await expect(frame(p).locator('#sw-exam-filter')).toHaveValue('wrong');await expect(frame(p).locator('#examResult')).toHaveText('');
  await nav(p,'lesson');await expect(frame(p).locator('#predictInput')).toHaveValue('예측 '+fixture);await expect(frame(p).locator('#reflection')).toHaveValue('해석 '+fixture);await expect(frame(p).locator('#stdin')).toHaveValue('7\n8');await expect(frame(p).locator('#stepNumber')).toContainText('2단계');await expect(frame(p).locator('#completeLabel')).toContainText('1 / 5');await expect(frame(p).locator('#quizScore')).toContainText('/ 2 정답');
  await nav(p,'data-lab');await expect(p.getByLabel('분석·해석')).toHaveValue('두 행 한 열 '+fixture);await expect(p.getByLabel('예측한 답').first()).toHaveValue('(2, 1)');
  await nav(p,'library');await expect(p.locator('.sw-record')).toHaveCount(6);
  await p.locator('#sw-end').click();await expect(p.locator('#sw-user')).toHaveText('로그인 전');await login(p,people.other);await nav(p,'report');await expect(frame(p).locator('[data-report=question]')).toHaveValue('');await nav(p,'lesson');await expect(frame(p).locator('#editor')).toHaveValue('');
  await p.context().close();await school.context.close();
 });
 await scenario('owned file preview, conflict choice, duplicate import, offline export and history restoration',async()=>{
  const {page:p,context}=await device('/?page=practice&workspace=scratch-01');
  await p.evaluate(()=>localStorage.setItem('pandas-data-detective-v1',JSON.stringify({code:'UNKNOWN_PREVIOUS_OWNER',report:{question:'not mine'},answers:{}})));
  await login(p,people.other);await expect(p.locator('#sw-code')).toHaveValue('');assert.equal(await record(people.other.uid,'scratch-01'),null);
  await p.locator('#sw-code').fill('print("owned first")');await context.setOffline(true);await p.locator('#sw-save').click();await expect(p.locator('#sw-save-state')).toContainText('저장 실패');await expect(p.locator('#sw-code')).toHaveValue('print("owned first")');
  const dl=p.waitForEvent('download');await p.locator('#sw-export').click();const download=await dl;await download.saveAs(resolve(artifacts,'offline-fictional-backup.json'));assert((await readFile(resolve(artifacts,'offline-fictional-backup.json'),'utf8')).includes('owned first'));assert.equal(await record(people.other.uid,'scratch-01'),null);
  await context.setOffline(false);await p.locator('#sw-save').click();await expect(p.locator('#sw-save-state')).toContainText('클라우드 저장 완료',{timeout:50000});
  const file={name:'my_sw_backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({application:'englishmath-sw',schemaVersion:1,records:[{id:'scratch-01',value:'print("owned imported")'}]}))};
  await p.locator('#sw-import').setInputFiles(file);await p.getByRole('button',{name:'본인 자료 가져오기',exact:true}).click();await expect(p.locator('#sw-dialog-title')).toHaveText('기존 기록과 충돌');await p.getByRole('button',{name:'취소',exact:true}).click();await expect(p.locator('#sw-code')).toHaveValue('print("owned first")');
  await p.locator('#sw-import').setInputFiles(file);await p.getByRole('button',{name:'본인 자료 가져오기',exact:true}).click();await p.getByRole('button',{name:'백업 내용으로 변경',exact:true}).click();await expect(p.locator('#sw-code')).toHaveValue('print("owned imported")');
  await p.locator('#sw-import').setInputFiles(file);await p.getByRole('button',{name:'본인 자료 가져오기',exact:true}).click();await expect(p.locator('#sw-message')).toContainText('중복 저장하지');
  await p.locator('#sw-save').click();await expect(p.locator('#sw-save-state')).toContainText('클라우드 저장 완료',{timeout:50000});assert.equal((await record(people.other.uid,'scratch-01')).version,2);
  await nav(p,'library');await p.locator('.sw-record').filter({hasText:'자유 실습 01'}).getByRole('button',{name:'최근 이력',exact:true}).click();await p.getByRole('button',{name:'자유 실습 01 · 이전 버전 1 복원',exact:true}).click();await p.getByRole('button',{name:'새 버전으로 복원',exact:true}).click();await expect(p.locator('#sw-code')).toHaveValue('print("owned first")',{timeout:50000});assert.equal((await record(people.other.uid,'scratch-01')).version,3);
  await p.locator('#sw-end').click();await expect(p.locator('#sw-user')).toHaveText('로그인 전');await context.close();
 });
 await scenario('avatar: zero writes, no automatic camera, MOCK_MEDIA start/stop/dispose and memory cleared',async()=>{
  const {page:p,writes}=await device('/ai-avatar.html',{camera:true});await login(p,people.avatar);
  await expect(frame(p).locator('#animals button')).toHaveCount(8);await expect(p.locator('#sw-save')).toBeHidden();assert.equal(await frame(p).locator('#camera').evaluate(v=>v.srcObject),null);
  const initial=await scope(people.avatar.uid),n=writes.length;
  await frame(p).locator('#code').fill('print("avatar-only private transient")');
  await frame(p).locator('#start-camera').click();await expect.poll(()=>p.evaluate(()=>top.__mockTracks?.filter(t=>t.readyState==='live').length||0),{timeout:150000}).toBeGreaterThan(0);
  await frame(p).locator('#stop-camera').click();await expect.poll(()=>p.evaluate(()=>top.__mockTracks.every(t=>t.readyState==='ended'))).toBe(true);
  await frame(p).locator('#start-camera').click();await expect.poll(()=>p.evaluate(()=>top.__mockTracks.filter(t=>t.readyState==='live').length),{timeout:150000}).toBeGreaterThan(0);
  await nav(p,'home');await expect.poll(()=>p.evaluate(()=>top.__mockTracks.every(t=>t.readyState==='ended'))).toBe(true);
  await nav(p,'avatar');await expect(frame(p).locator('#code')).not.toHaveValue('print("avatar-only private transient")');assert.equal(await scope(people.avatar.uid),initial);assert.equal(writes.length,n);await shot(p,'avatar-common-menu');
  await p.locator('#sw-end').click();await expect(p.locator('#sw-user')).toHaveText('로그인 전');await p.context().close();
 });
 await scenario('MOCK_MEDIA permission denial falls back to camera-free avatar without persistence',async()=>{
  const {page:p,context}=await device('/ai-avatar.html');const f=frame(p);
  await f.locator('#start-camera').evaluate(()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('mock denial','NotAllowedError');};});
  await f.locator('#start-camera').click();await expect(f.locator('#camera-status')).toContainText('권한이 거절');
  await f.locator('#virtual').click();await expect(f.locator('#camera-status')).toContainText('가상 모드');await f.locator('#smile').focus();await f.locator('#smile').press('End');await expect(f.locator('#smile-value')).toHaveText('1.00');
  await nav(p,'home');await nav(p,'avatar');await expect(f.locator('#smile')).toHaveValue('0');assert.equal(await f.locator('#camera').evaluate(v=>v.srcObject),null);await context.close();
 });
 await scenario('idle warning and 15-minute clearing use fake clock, never a real school-PC claim',async()=>{
  const {page:p}=await device('/?page=practice',{clock:true});await login(p,people.idle);await expect(p.locator('#sw-code')).toBeVisible();await p.clock.fastForward(14*60000+1000);await expect(p.locator('#sw-idle')).toBeVisible();await p.clock.fastForward(60000);await expect(p.locator('#sw-user')).toHaveText('로그인 전');await p.context().close();
 });
 await scenario('inquiry D retains code, explanation, self-check and graded knowledge answers across internal navigation',async()=>{
  const {page:p,context}=await device('/four-turtles.html');const f=frame(p);
  await f.locator('#studentCode').fill('print("four turtles fixture")');await f.locator('#studentReason').fill('각 객체의 위치와 상태');await f.locator('[data-points]').first().check();await f.getByText('객체 개념 4문항으로 스스로 확인하기',{exact:true}).click();await f.locator('input[name=knowledge0][value="0"]').check();await f.locator('#knowledgeForm button[type=submit]').click();
  await p.locator('.brand').click();await expect(p).toHaveURL(/page=home/);await p.goBack();await expect(p).toHaveURL(/page=four-turtles/);
  await expect(f.locator('#studentCode')).toHaveValue('print("four turtles fixture")');await expect(f.locator('#studentReason')).toHaveValue('각 객체의 위치와 상태');await expect(f.locator('[data-points]').first()).toBeChecked();await expect(f.locator('input[name=knowledge0][value="0"]')).toBeChecked();await expect(f.locator('#knowledgeScore')).toContainText('1문항 정답');await expect(f.locator('#selfScore')).toContainText('1/4개');await context.close();
 });
 await scenario('legacy links, responsive 390/1440/1920, keyboard and 200 percent text scaling',async()=>{
  const {page:p}=await device('/step-by-step.html?lesson=7');await expect(p).toHaveURL(/page=lesson&lesson=7/);await expect(frame(p).locator('#heroTitle')).toContainText('7차시');
  const menu=p.locator('nav[aria-label="수업 메뉴"]');
  assert.deepEqual(await menu.locator('.sw-menu-group h2').allTextContents(),['수업 순서','추가 실습·탐구','내 학습','교사용']);
  assert.deepEqual(await menu.locator('[aria-labelledby="sw-course-heading"] a').evaluateAll(as=>as.map(a=>a.dataset.route)),['python-review','home','lesson','data','exam','report']);
  assert.deepEqual(await menu.locator('[aria-labelledby="sw-practice-heading"] a').evaluateAll(as=>as.map(a=>a.dataset.route)),['data-lab','practice','first-analysis']);
  assert.equal(await menu.locator('a[data-route]').count(),12);
  await expect(p.locator('#sw-teacher-menu')).toBeHidden();
  await expect(menu.locator('a.avatar-nav')).toBeVisible();
  for(const width of [390,1440,1920]){await p.setViewportSize({width,height:1000});await expect.poll(()=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);await shot(p,'layout-'+width);}
  await p.addStyleTag({content:'html{font-size:200%}'});await p.locator('#sw-login').focus();await p.keyboard.press('Tab');assert(await p.evaluate(()=>document.activeElement.id==='sw-end'));await shot(p,'text-scale-200');
  await p.reload();await expect(p).toHaveURL(/page=lesson&lesson=7/);await expect(p.locator('#sw-user')).toHaveText('로그인 전');
  await nav(p,'home');await p.goBack();await expect(p).toHaveURL(/page=lesson&lesson=7/);await p.context().close();
 });
 assert.equal(errors.length,0,'Unexpected page errors: '+JSON.stringify(errors));
} catch(error){
 console.error(error);console.log('SW_RECORD_DEBUG '+await scope(people.student.uid));console.log('SW_BROWSER_ERRORS '+JSON.stringify(errors));if(lastPage&&!lastPage.isClosed()){console.log('SW_OVERFLOW '+JSON.stringify(await lastPage.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,nodes:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,id:e.id,cls:e.className,x:e.getBoundingClientRect().x,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right})).filter(e=>e.right>innerWidth+2).slice(0,12)}))));const preview=await lastPage.screenshot({type:'jpeg',quality:55});console.log('SW_PREVIEW failure '+preview.toString('base64'));}if(lastPage&&!lastPage.isClosed()){console.log('SW_EDITOR_DEBUG '+JSON.stringify(await lastPage.locator('#sw-classroom-frame').evaluate(el=>({src:el.src,editor:el.contentDocument?.querySelector('#editor')?.value,lesson:el.contentDocument?.querySelector('#heroTitle')?.textContent})).catch(()=>null)));console.log('SW_FAILURE_DOM '+(await lastPage.locator('body').innerText().catch(()=>'' )).slice(0,6000));await lastPage.screenshot({path:resolve(artifacts,'failure.png')}).catch(()=>{});await writeFile(resolve(artifacts,'failure.html'),await lastPage.content().catch(()=>''));}
 process.exitCode=1;
} finally {
 await writeFile(resolve(artifacts,'browser-results.json'),JSON.stringify({sourceSha:process.env.GITHUB_SHA,environment:'GitHub Actions Chromium; Firebase Auth and Firestore emulators; MOCK_MEDIA; independent contexts are not real Google independent-browser evidence',results,errors,notRun:['real Google login','independent real browser restoration','physical school PCs','physical camera','29 physical PCs']},null,2));
 for(const d of devices)await d.context.close().catch(()=>{});await browser?.close();await env.cleanup();await new Promise(r=>server?server.close(r):r());
}
