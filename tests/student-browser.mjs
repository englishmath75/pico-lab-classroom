import { chromium, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';

const projectId='demo-englishmath-python';
const env=await initializeTestEnvironment({projectId,firestore:{host:'127.0.0.1',port:8080,rules:await readFile('firestore.rules','utf8')}});
await env.clearFirestore();
const students=[{uid:'alice',name:'가상 학생 A',email:'alice@muhak-g-h.gne.go.kr'},{uid:'bob',name:'가상 학생 B',email:'bob@muhak-g-h.gne.go.kr'},{uid:'teacher',name:'가상 담당 교사',email:'teacher@muhak-g-h.gne.go.kr'}];
await env.withSecurityRulesDisabled(async c=>{
  const db=c.firestore();await Promise.all([
    setDoc(doc(db,'config/access'),{allowedDomains:['muhak-g-h.gne.go.kr'],allowedEmails:[]}),
    setDoc(doc(db,'classes/class-2-1'),{title:'2학년 1반',active:true}),
    setDoc(doc(db,'staff/teacher'),{classIds:['class-2-1']}),
    ...students.map(s=>setDoc(doc(db,'users',s.uid),{email:s.email,displayName:s.name,status:s.uid==='alice'?'approved':'pending',classId:'class-2-1',createdAt:Timestamp.now(),updatedAt:Timestamp.now()}))
  ]);
});
await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${projectId}/accounts`,{method:'DELETE'});
const imported=await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:batchCreate`,{
  method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({users:students.map(s=>({localId:s.uid,email:s.email,emailVerified:true,displayName:s.name,providerUserInfo:[{providerId:'google.com',rawId:s.email,email:s.email,displayName:s.name}]}))})});
if(!imported.ok)throw Error('Auth emulator fixture import failed: '+await imported.text());
const types={'.js':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.csv':'text/csv','.png':'image/png'};
const server=createServer(async(req,res)=>{
  try {
    let path=new URL(req.url,'http://localhost').pathname;if(path.endsWith('/'))path+='index.html';
    if(path.includes('..'))throw Error('path');
    const data=await readFile('public'+path),ext=path.slice(path.lastIndexOf('.'));
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(4167,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}),args:['--no-sandbox']});
const execFileAsync=promisify(execFile),vendorCache=new Map();
const reports=[];let page;
const config={enabled:true,emulator:true,firebase:{apiKey:'fake-api-key',authDomain:`${projectId}.firebaseapp.com`,projectId,appId:'test-app'}};
async function createDevice(viewport={width:1440,height:1100}) {
  const context=await browser.newContext({viewport,locale:'ko-KR',timezoneId:'Asia/Seoul'});await context.route('**/student-config.json',r=>r.fulfill({json:config}));
  if(process.env.STUDENT_TEST_FONT) await context.route('**/_test-font.otf',async r=>r.fulfill({body:await readFile(process.env.STUDENT_TEST_FONT),contentType:'font/otf'}));
  // Fetch public vendor SDK/runtime assets through the executor's configured
  // TLS-verifying proxy. Local emulator and app requests remain on loopback.
  await context.route('https://**/*',async route=>{
    const url=new URL(route.request().url());
    if(!['apis.google.com','www.gstatic.com','cdn.jsdelivr.net'].includes(url.hostname))return route.abort();
    try {
      let cached=vendorCache.get(url.href);
      if(!cached){cached=execFileAsync('curl',['--fail','--silent','--show-error','--location','--retry','1','--max-time','30','--url',url.href],{encoding:'buffer',maxBuffer:64000000}).then(r=>r.stdout);vendorCache.set(url.href,cached);}
      const body=await cached;
      const contentType=url.pathname.endsWith('.wasm')?'application/wasm':url.pathname.endsWith('.json')?'application/json':/\.(whl|zip|data)$/.test(url.pathname)?'application/octet-stream':'text/javascript';
      await route.fulfill({body,headers:{'Content-Type':contentType,'Access-Control-Allow-Origin':'*'}});
    }catch(error){console.error('vendor asset unavailable:',url.hostname,url.pathname);await route.abort();}
  });
  const page=await context.newPage();await page.clock.install();page.on('pageerror',e=>console.error('page error:',e.message));
  page.on('requestfailed',r=>console.error('request failed:',r.url().split('?')[0],r.failure()?.errorText));
  page.on('console',m=>{if(m.type()==='error')console.error('browser console:',m.text());});
  await page.goto('http://127.0.0.1:4167/pandas-data-lab/student-room.html');
  if(process.env.STUDENT_TEST_FONT) {await page.addStyleTag({content:'@font-face{font-family:TestKorean;src:url(/_test-font.otf)}body{font-family:TestKorean,system-ui,sans-serif}'});await page.evaluate(()=>document.fonts.ready);}
  return {context,page};
}
async function login(page,student,teacher=false) {
  await expect(page.locator('#login')).toBeVisible();await expect(page.locator('#notice')).not.toContainText('확인하고 있습니다');
  const popupPromise=page.waitForEvent('popup');await page.locator('#login').click();const popup=await popupPromise;
  await popup.waitForLoadState();
  await popup.getByText(student.email,{exact:true}).click();
  if(teacher){await expect(page.locator('#teacher-area')).toBeVisible({timeout:20000});return;}
  await expect(page.locator('#student-area')).toBeVisible({timeout:20000});await expect(page.locator('#save-state')).toContainText(/새 실습|불러옴/);
}
try {
  const school=await createDevice();page=school.page;await login(page,students[0]);
  await page.locator('#editor').fill('print("학교에서 작성한 코드")');await page.locator('#save').click();await expect(page.locator('#save-state')).toContainText('클라우드 저장 완료');
  const home=await createDevice();await login(home.page,students[0]);await expect(home.page.locator('#editor')).toHaveValue('print("학교에서 작성한 코드")');reports.push('다른 독립 브라우저 문맥에서 클라우드 코드 불러오기 PASS');
  const teacher=await createDevice();await login(teacher.page,students[2],true);await expect(teacher.page.locator('#student-list tr')).toHaveCount(2);
  await expect(teacher.page.locator('#enrollment')).toBeHidden();
  await expect(teacher.page.locator('#student-list')).not.toContainText(students[2].email);
  await teacher.page.locator('#student-list tr').filter({hasText:students[0].email}).getByRole('button',{name:'학습·제출 확인'}).click();
  await expect(teacher.page.locator('#student-details')).toContainText('마지막 저장');await expect(teacher.page.locator('#student-details')).not.toContainText('학교에서 작성한 코드');
  await teacher.page.locator('#student-list tr').filter({hasText:students[1].email}).getByRole('button',{name:'학습·제출 확인'}).click();
  await expect(teacher.page.locator('#student-details')).toContainText('제출된 코드가 없습니다.');
  await expect(teacher.page.locator('#notice')).not.toContainText('권한이 없습니다');
  reports.push('교사 pending 프로필의 학생 등록 화면 숨김·본인 학생 목록 제외·승인 대기 학생 빈 제출 조회 PASS');
  await teacher.page.locator('#student-list tr').filter({hasText:students[1].email}).getByRole('button',{name:'승인',exact:true}).click();await teacher.page.locator('#dialog-yes').click();
  await expect(teacher.page.locator('#student-list tr').filter({hasText:students[1].email})).toContainText('승인됨');reports.push('교사 관리실 학생 승인·학습 현황·비공개 초안 비노출 PASS');
  await page.locator('#logout').click();await expect(page.locator('#editor')).toHaveValue('');await expect(page.locator('#student-area')).toBeHidden();
  // Logging out also clears other open tabs/windows on this device context.
  await login(page,students[1]);await expect(page.locator('#editor')).toHaveValue('');reports.push('같은 공용 PC 학생 A 로그아웃 → 학생 B 로그인, 이전 코드 제거 PASS');
  await page.locator('#editor').fill('print(1 + 2)');await page.locator('#run').click();await expect(page.locator('#run-state')).toHaveText('실행 성공',{timeout:130000});await expect(page.locator('#output')).toHaveText('3');reports.push('격리된 새 Worker에서 실제 Pyodide print(1 + 2) == 3 PASS');
  await page.locator('#save').click();await expect(page.locator('#save-state')).toContainText('클라우드 저장 완료');
  await school.context.setOffline(true);await page.locator('#editor').fill('print("offline draft")');await page.locator('#save').click();await expect(page.locator('#notice')).toContainText('인터넷');await expect(page.locator('#editor')).toHaveValue('print("offline draft")');reports.push('오프라인 저장 실패 경고와 메모리 초안 유지 PASS');
  await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'users/bob/limits/state'),{updatedAt:Timestamp.fromMillis(Date.now()-20000)}));
  await school.context.setOffline(false);await expect(page.locator('#save-state')).toContainText('클라우드 저장 완료');
  await page.locator('#history').click();await expect(page.locator('#history-list .entry')).toHaveCount(2);await page.locator('#history-list .entry').last().getByRole('button',{name:'이 코드로 복원'}).click();await page.locator('#dialog-yes').click();await expect(page.locator('#editor')).toHaveValue('print(1 + 2)');reports.push('수정 이력 2개 표시와 이전 코드 복원 PASS');
  await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'users/bob/limits/state'),{updatedAt:Timestamp.fromMillis(Date.now()-20000)}));
  await page.clock.fastForward(61000);await expect(page.locator('#save-state')).toContainText('클라우드 저장 완료');reports.push('1분 자동 저장 타이머로 복원 코드 저장 PASS');
  await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'users/bob/limits/state'),{updatedAt:Timestamp.fromMillis(Date.now()-20000)}));
  await page.locator('#submit').click();await page.locator('#dialog-yes').click();await expect(page.locator('#notice')).toContainText('선생님께 제출');
  await teacher.page.locator('#student-list tr').filter({hasText:students[1].email}).getByRole('button',{name:'학습·제출 확인'}).click();await expect(teacher.page.locator('#student-details pre')).toHaveText('print(1 + 2)');reports.push('학생 명시적 제출본만 교사 코드 열람 PASS');
  await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/student-room-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await expect(page.locator('#editor')).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);expect(overflow).toBe(false);await page.screenshot({path:'test-results/student-room-mobile.png',fullPage:true});reports.push('390px 모바일 가로 넘침 없음 PASS');
  const legacy=await school.context.newPage();await legacy.goto('http://127.0.0.1:4167/pandas-data-lab/?page=lab');
  await legacy.evaluate(()=>localStorage.setItem('pandas-data-detective-v1',JSON.stringify({code:'PREVIOUS_STUDENT_PRIVATE_CODE'})));
  await legacy.reload();await expect(legacy.locator('#pythonCode')).not.toHaveValue('PREVIOUS_STUDENT_PRIVATE_CODE');
  await legacy.locator('#pythonCode').fill('TEMPORARY_LEGACY_DRAFT');
  let automaticDownloads=0;page.on('download',()=>automaticDownloads++);
  await page.locator('#editor').click();await page.locator('#editor').fill('OFFLINE_PRIVATE_DRAFT');await school.context.setOffline(true);
  await page.clock.fastForward(14*60000+10000);await expect(page.locator('#notice')).toContainText('자동 로그아웃 전 저장에 실패');
  await page.clock.fastForward(61000);await expect(page.locator('#login')).toBeVisible();await expect(page.locator('#editor')).toHaveValue('');expect(automaticDownloads).toBe(0);reports.push('저장 실패 사전 경고·15분 자동 로그아웃·공용 PC 자동 다운로드 없음 PASS');
  await school.context.setOffline(false);
  await legacy.reload();
  await expect(legacy.locator('#pythonCode')).not.toHaveValue('TEMPORARY_LEGACY_DRAFT');reports.push('기존 수업의 식별되지 않은 로컬 코드 비노출·다른 탭 임시 코드 제거 PASS');
  await page.reload();await expect(page.locator('#login')).toBeVisible();await expect(page.locator('#student-area')).toBeHidden();reports.push('새로고침 후 Firebase 메모리 로그인 해제 PASS');
  console.log(JSON.stringify({environment:'Auth + Firestore emulator, virtual Google identities, Chromium',results:reports},null,2));
}catch(error){if(page)console.error('VISIBLE UI:',await page.locator('body').innerText());throw error;}
finally {await browser.close();server.close();await env.cleanup();}
