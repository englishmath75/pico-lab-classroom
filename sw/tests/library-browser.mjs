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
const dist=resolve('dist'),evidence=resolve('sw/evidence/library-resume-20261109'),contexts=[],errors=[],cache=new Map();
for(const key of ['FIRESTORE_EMULATOR_HOST','FIREBASE_AUTH_EMULATOR_HOST'])if(process.env[key]&&!/^(127\.0\.0\.1|localhost):\d+$/.test(process.env[key]))throw Error('Local emulators only');
await mkdir(evidence,{recursive:true});
const catalog=JSON.parse(await readFile('sw/security/enrollment-catalog.proposed.json','utf8'));
const env=await initializeTestEnvironment({projectId,firestore:{host:'127.0.0.1',port:8080,rules:await readFile('sw/security/membership-proposed.rules','utf8')}});
const people={student:{uid:'enrollment-student',email:'enrollment-student@muhak-g-h.gne.go.kr',name:'가상학생'},teacher:{uid:'enrollment-teacher',email:'enrollment-teacher@muhak-g-h.gne.go.kr',name:'검증교사'},legacy:{uid:'enrollment-legacy',email:'enrollment-legacy@muhak-g-h.gne.go.kr',name:'이전테스트'}};
let browser,server,origin,page;
const admin=fn=>env.withSecurityRulesDisabled(c=>fn(c.firestore()));
async function device(path='/?page=home'){
 const context=await browser.newContext({locale:'ko-KR',viewport:{width:1440,height:1000}});contexts.push(context);
 await context.route('**/student-config.json',r=>r.fulfill({json:{enabled:true,emulator:true,firebase:{apiKey:'fake-api-key',authDomain:projectId+'.firebaseapp.com',projectId,appId:'sw-enrollment-emulator'}}}));
 await context.route('https://**/*',async r=>{const u=new URL(r.request().url());if(!['apis.google.com','www.gstatic.com'].includes(u.hostname))return r.abort();if(!cache.has(u.href))cache.set(u.href,exec('curl',['--fail','--silent','--show-error','--location','--retry','1','--max-time','30','--url',u.href],{encoding:'buffer',maxBuffer:64000000}).then(x=>x.stdout));await r.fulfill({body:await cache.get(u.href),contentType:'text/javascript'});});
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin+path);await expect(p.locator('#sw-save-state')).not.toHaveText('로그인 상태 확인 중');return p;
}
async function login(p,person){const wait=p.waitForEvent('popup');await p.locator('#sw-login').click();const popup=await wait;await popup.waitForLoadState();await popup.getByText(person.email,{exact:true}).click();await expect(p.locator('#sw-user')).toContainText(person.email);}
async function shot(p,name){await p.screenshot({path:resolve(evidence,name+'.png'),fullPage:false});}
const results=[];
async function code(p,text){const e=p.locator('.cm-content').first();await e.click();await e.press('ControlOrMeta+a');await e.fill(text);}
async function nav(p,path){await p.locator('a[data-route="'+path+'"]').first().click();await expect(p).toHaveURL(new RegExp('[?&]page='+path));}
async function saved(id){let record;await admin(async db=>{record=(await getDocFromServer(doc(db,'users',people.student.uid,'workspaces',id))).data();});return record;}
try{
 await env.clearFirestore();await admin(db=>Promise.all([
 setDoc(doc(db,'config/swEnrollment'),catalog),setDoc(doc(db,'config/access'),{allowedDomains:['muhak-g-h.gne.go.kr'],allowedEmails:[]}),setDoc(doc(db,'classes/class-2-1'),{title:'SW 승인 수업',active:true}),
 setDoc(doc(db,'users',people.student.uid),{email:people.student.email,displayName:people.student.name,classId:'class-2-1',enrollment:{schoolId:'muhak-g-h',schoolName:'가상학교',academicYear:2026,grade:2,classNumber:1},status:'approved',createdAt:Timestamp.now(),updatedAt:Timestamp.now()}),
 ...['lesson-00','lesson-01','lesson-02','scratch-02'].map((id,i)=>setDoc(doc(db,'users',people.student.uid,'workspaces',id),{workspaceId:id,lessonId:id,title:'이어쓰기 검사 '+id,code:'print("SAVED_'+id+'")',runState:'idle',completed:false,version:1,savedAt:Timestamp.now()}))
 ]));
 await fetch('http://127.0.0.1:9099/emulator/v1/projects/'+projectId+'/accounts',{method:'DELETE'});
 const imported=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/'+projectId+'/accounts:batchCreate',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({users:Object.values(people).map(p=>({localId:p.uid,email:p.email,emailVerified:true,displayName:p.name,providerUserInfo:[{providerId:'google.com',rawId:p.email,email:p.email,displayName:p.name}]}))})});assert(imported.ok);
 const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm','.py':'text/plain','.csv':'text/csv'};
 server=createServer(async(req,res)=>{try{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(p.endsWith('/'))p+='index.html';const file=resolve(dist,'.'+p);if(!file.startsWith(dist+sep))throw Error('path');res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch();
 page=await device('/?page=library');await login(page,people.student);
 const resume=async(p,id)=>{
  if(!new URL(p.url()).searchParams.get('page')?.includes('library'))await nav(p,'library');
  const row=p.locator('.sw-record').filter({has:p.getByRole('heading',{name:'이어쓰기 검사 '+id,exact:true})});
  await expect(row).toBeVisible();await row.getByRole('button',{name:'이어서 작성',exact:true}).click();
  await expect(p).toHaveURL(new RegExp('page=practice&workspace='+id));
  await expect(p.locator('#sw-code-title')).toHaveValue('이어쓰기 검사 '+id);
  await expect(p.locator('.cm-content')).toHaveText('print("SAVED_'+id+'")');
 };
 for(const id of ['lesson-00','lesson-01','lesson-02','scratch-02']){
  await resume(page,id);assert.equal((await saved(id)).version,1);results.push('desktop resume exact title/code: '+id);
 }
 // A code opened from the library remains editable and saves to the same key.
 await resume(page,'lesson-02');await code(page,'print("RESUMED_AND_EDITED")');
 await page.locator('.sw-practice textarea').first().fill('42');
 await page.locator('.sw-practice').getByRole('button',{name:'계정에 저장',exact:true}).click();
 await expect(page.locator('#sw-save-state')).toContainText('클라우드 저장 완료',{timeout:50000});
 assert.equal((await saved('lesson-02')).code,'print("RESUMED_AND_EDITED")');
 assert.equal((await saved('lesson-02')).title,'이어쓰기 검사 lesson-02');
 for(const id of ['lesson-00','lesson-01','scratch-02']){assert.equal((await saved(id)).code,'print("SAVED_'+id+'")');assert.equal((await saved(id)).version,1);}
 results.push('edit/save updates only selected record; input retained');await shot(page,'resumed-code-desktop');
 const second=await device('/?page=library');await login(second,people.student);
 await second.locator('.sw-record').filter({has:second.getByRole('heading',{name:'이어쓰기 검사 lesson-02',exact:true})}).getByRole('button',{name:'이어서 작성',exact:true}).click();
 await expect(second.locator('.cm-content')).toHaveText('print("RESUMED_AND_EDITED")');await expect(second.locator('.sw-practice textarea').first()).toHaveValue('42');
 results.push('separate browser restores latest edit and input');
 await second.setViewportSize({width:390,height:844});await second.locator('#sw-view a[data-route="library"]').click();
 const mobileRow=second.locator('.sw-record').filter({has:second.getByRole('heading',{name:'이어쓰기 검사 lesson-01',exact:true})});
 await mobileRow.getByRole('button',{name:'이어서 작성',exact:true}).click();
 await expect(second.locator('.cm-content')).toHaveText('print("SAVED_lesson-01")');
 assert(await second.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(second,'resumed-code-mobile');
 results.push('390px mobile resume and no horizontal overflow');
 assert.deepEqual(errors,[]);
 await writeFile(evidence+'/browser-result.json',JSON.stringify({status:'PASS',environment:'Chromium + local Firebase Auth/Firestore emulators',checks:results,productionStudentData:'NOT_ACCESSED'},null,2));
}catch(e){await writeFile(evidence+'/failure.txt',e.stack);if(page)await page.screenshot({path:evidence+'/failure.png'});throw e;}finally{await Promise.all(contexts.map(c=>c.close()));await browser?.close();await new Promise(r=>server?server.close(r):r());await env.cleanup();}
