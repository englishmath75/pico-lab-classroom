import assert from 'node:assert/strict';
import {chromium,expect as pwExpect} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,extname,sep} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {initializeTestEnvironment} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDocFromServer,Timestamp} from 'firebase/firestore';
const expect=pwExpect.configure({timeout:20000}),exec=promisify(execFile),projectId='demo-englishmath-python';
const dist=resolve('dist'),evidence=resolve('sw/evidence/enrollment-20261109'),contexts=[],errors=[],cache=new Map();
await mkdir(evidence,{recursive:true});
const catalog=JSON.parse(await readFile('sw/security/enrollment-catalog.proposed.json','utf8'));
const env=await initializeTestEnvironment({projectId,firestore:{host:'127.0.0.1',port:8080,rules:await readFile('sw/security/enrollment-proposed.rules','utf8')}});
const people={student:{uid:'enrollment-student',email:'enrollment-student@muhak-g-h.gne.go.kr',name:'가상학생'},teacher:{uid:'enrollment-teacher',email:'enrollment-teacher@muhak-g-h.gne.go.kr',name:'검증교사'},legacy:{uid:'enrollment-legacy',email:'enrollment-legacy@muhak-g-h.gne.go.kr',name:'이전테스트'}};
let browser,server,origin,page;
const admin=fn=>env.withSecurityRulesDisabled(c=>fn(c.firestore()));
async function profile(uid){let value;await admin(async db=>{value=(await getDocFromServer(doc(db,'users',uid))).data();});return value;}
async function device(path='/?page=home'){
 const context=await browser.newContext({locale:'ko-KR',viewport:{width:1440,height:1000}});contexts.push(context);
 await context.route('**/student-config.json',r=>r.fulfill({json:{enabled:true,emulator:true,firebase:{apiKey:'fake-api-key',authDomain:projectId+'.firebaseapp.com',projectId,appId:'sw-enrollment-emulator'}}}));
 await context.route('https://**/*',async r=>{const u=new URL(r.request().url());if(!['apis.google.com','www.gstatic.com'].includes(u.hostname))return r.abort();if(!cache.has(u.href))cache.set(u.href,exec('curl',['--fail','--silent','--show-error','--location','--retry','1','--max-time','30','--url',u.href],{encoding:'buffer',maxBuffer:64000000}).then(x=>x.stdout));await r.fulfill({body:await cache.get(u.href),contentType:'text/javascript'});});
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin+path);await expect(p.locator('#sw-save-state')).not.toHaveText('로그인 상태 확인 중');return p;
}
async function login(p,person){const wait=p.waitForEvent('popup');await p.locator('#sw-login').click();const popup=await wait;await popup.waitForLoadState();await popup.getByText(person.email,{exact:true}).click();await expect(p.locator('#sw-user')).toContainText(person.email);}
async function shot(p,name){await p.screenshot({path:resolve(evidence,name+'.png')});console.log('SW_ENROLLMENT_PREVIEW '+name+' '+(await p.screenshot({type:'jpeg',quality:65})).toString('base64'));}
try{
 await env.clearFirestore();await admin(db=>Promise.all([
  setDoc(doc(db,'config/swEnrollment'),catalog),setDoc(doc(db,'config/access'),{allowedDomains:['muhak-g-h.gne.go.kr'],allowedEmails:[]}),
  setDoc(doc(db,'classes/class-2-1'),{title:'SW 수업 승인',active:true}),setDoc(doc(db,'staff',people.teacher.uid),{classIds:['class-2-1']}),
  setDoc(doc(db,'users',people.legacy.uid),{email:people.legacy.email,displayName:people.legacy.name,classId:'class-2-1',status:'approved',createdAt:Timestamp.now(),updatedAt:Timestamp.now()})
 ]));
 await fetch('http://127.0.0.1:9099/emulator/v1/projects/'+projectId+'/accounts',{method:'DELETE'});
 const imported=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/'+projectId+'/accounts:batchCreate',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({users:Object.values(people).map(p=>({localId:p.uid,email:p.email,emailVerified:true,displayName:p.name,providerUserInfo:[{providerId:'google.com',rawId:p.email,email:p.email,displayName:p.name}]}))})});assert(imported.ok);
 const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm','.py':'text/plain','.csv':'text/csv'};
 server=createServer(async(req,res)=>{try{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(p.endsWith('/'))p+='index.html';const file=resolve(dist,'.'+p);if(!file.startsWith(dist+sep))throw Error('path');res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch();
 page=await device();await login(page,people.student);await expect(page.locator('#sw-registration-form')).toBeVisible();
 for(const id of ['school','grade','class','name'])await expect(page.locator('#sw-register-'+id)).toHaveValue('');
 await page.locator('#sw-register').click();assert.equal(await profile(people.student.uid),undefined);
 await page.locator('#sw-register-school').selectOption('muhak-g-h');await page.locator('#sw-register-grade').selectOption('1');await page.locator('#sw-register-class').selectOption('1');await page.locator('#sw-register-name').fill('검증학생');
 await shot(page,'registration-desktop');await page.setViewportSize({width:390,height:844});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(page,'registration-mobile');
 await page.locator('#sw-register-confirm').check();await page.locator('#sw-register').click();await expect(page.locator('#sw-registration-note')).toContainText('승인 요청이 접수되었습니다');
 assert.equal((await profile(people.student.uid)).enrollment.grade,1);assert.equal((await profile(people.student.uid)).status,'pending');
 await page.locator('#sw-edit-enrollment').click();await page.locator('#sw-register-class').selectOption('2');await page.locator('#sw-register-confirm').check();await page.locator('#sw-register').click();await expect(page.locator('#sw-pending-affiliation')).toContainText('1학년 2반');
 const teacher=await device('/?page=teacher');await login(teacher,people.teacher);const card=teacher.locator('.sw-record').filter({hasText:'검증학생'});await expect(card).toContainText('마산무학여자고등학교 · 2026학년도 1학년 2반');await shot(teacher,'teacher-approval');
 await card.getByRole('button',{name:'학생 승인',exact:true}).click();await teacher.locator('#sw-dialog-actions').getByRole('button',{name:'학생 승인',exact:true}).click();
 await expect(page.locator('#sw-registration')).toBeHidden();await expect(page.locator('#sw-space')).toContainText('1학년 2반');assert.equal((await profile(people.student.uid)).status,'approved');
 const otherDevice=await device();await login(otherDevice,people.student);await expect(otherDevice.locator('#sw-space')).toContainText('1학년 2반');await expect(otherDevice.locator('#sw-registration')).toBeHidden();
 await page.locator('#sw-end').click();await expect(page.locator('#sw-user')).toHaveText('로그인 전');await login(page,people.legacy);await expect(page.locator('#sw-registration-form')).toBeVisible();await expect(page.locator('#sw-register-name')).toHaveValue('');await expect(page.locator('#sw-save-state')).toContainText('학생 등록 필요');
 assert.deepEqual(errors,[]);await writeFile(evidence+'/browser-result.json',JSON.stringify({status:'PASS',environment:'Chromium + Firebase auth/firestore emulators',checks:['required explicit selections','actual grade 1 registration','pending correction','teacher reads affiliation and approves','live student approval','independent browser context restores affiliation','old test approval requires registration','account switch clears entered name','desktop/mobile layout'],productionLogin:'BLOCKED: school administrator authentication not completed'},null,2));
}catch(e){await writeFile(evidence+'/browser-error.txt',e.stack);if(page)await page.screenshot({path:evidence+'/failure.png'});throw e;}
finally{await Promise.all(contexts.map(c=>c.close()));await browser?.close();await new Promise(r=>server?server.close(r):r());await env.cleanup();}
