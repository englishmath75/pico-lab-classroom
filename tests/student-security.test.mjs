import { readFileSync } from 'node:fs';
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, Timestamp, serverTimestamp, collection, query, where, limit, getDocs, writeBatch } from 'firebase/firestore';
import { StudentStore } from '../public/pandas-data-lab/student-cloud.js';
import { StudentSession } from '../public/pandas-data-lab/student-session.js';
let env;
const projectId='demo-englishmath-python';
const auth=(uid,extra={})=>env.authenticatedContext(uid,{email:uid+'@muhak-g-h.gne.go.kr',email_verified:true,firebase:{sign_in_provider:'google.com'},...extra}).firestore();
const input=(code='print(42)')=>({code,title:'실습',runState:'success',completed:false,classId:'class-2-1'});
const profile=(uid,classId='class-2-1',status='approved')=>({email:uid+'@muhak-g-h.gne.go.kr',displayName:uid,classId,status,createdAt:Timestamp.now(),updatedAt:Timestamp.now()});
async function seed(extra=[]) {
  await env.withSecurityRulesDisabled(async ctx=>{
    const db=ctx.firestore();
    await Promise.all([
      setDoc(doc(db,'config/access'),{allowedDomains:['muhak-g-h.gne.go.kr'],allowedEmails:[]}),
      setDoc(doc(db,'classes/class-2-1'),{title:'2학년 1반',active:true}),
      setDoc(doc(db,'classes/class-2-2'),{title:'2학년 2반',active:true}),
      setDoc(doc(db,'staff/teacher'),{classIds:['class-2-1']}),
      ...['alice','bob'].map(u=>setDoc(doc(db,'users',u),profile(u))),
      setDoc(doc(db,'users/pending'),profile('pending','class-2-1','pending')),
      ...extra.map(([path,data])=>setDoc(doc(db,path),data))
    ]);
  });
}
before(async()=>{env=await initializeTestEnvironment({projectId,firestore:{host:'127.0.0.1',port:8080,rules:readFileSync('firestore.rules','utf8')}});});
beforeEach(async()=>{await env.clearFirestore();await seed();});
after(async()=>env?.cleanup());
test('학생 A 저장 후 다른 기기에서 다시 읽기, 학생 B 접근 차단',async()=>{
  const alice=new StudentStore(auth('alice'));assert.equal(await alice.mutate('alice','lesson-01','save',input(),0),1);
  const otherDevice=new StudentStore(auth('alice'));assert.equal((await otherDevice.load('alice','lesson-01')).code,'print(42)');
  const bob=new StudentStore(auth('bob'));await assertFails(bob.load('alice','lesson-01'));
  await assertFails(bob.mutate('alice','lesson-01','save',input('evil'),1));
  await assertFails(getDoc(doc(auth('bob'),'users/alice/revisions/lesson-01__1')));
});
test('승인 대기·익명·인증 안 된 이메일·다른 로그인 제공업체 접근 차단',async()=>{
  await assertFails(new StudentStore(auth('pending')).mutate('pending','lesson-01','save',input(),0));
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'users/alice')));
  await assertFails(getDoc(doc(auth('alice',{email_verified:false}),'users/alice')));
  await assertFails(getDoc(doc(auth('alice',{firebase:{sign_in_provider:'password'}}),'users/alice')));
});
test('허용된 학교 계정은 pending만 생성, 타 도메인은 등록 불가',async()=>{
  const student=auth('new-student');
  await assertSucceeds(setDoc(doc(student,'users/new-student'),{...profile('new-student','class-2-1','pending'),createdAt:serverTimestamp(),updatedAt:serverTimestamp()}));
  await assertFails(setDoc(doc(auth('intruder',{email:'intruder@gmail.com'}),'users/intruder'),{...profile('intruder'),email:'intruder@gmail.com',status:'pending',createdAt:serverTimestamp(),updatedAt:serverTimestamp()}));
});
test('학생 관리자 권한·학급·승인 상태 위조 불가',async()=>{
  const db=auth('alice');await assertFails(setDoc(doc(db,'staff/alice'),{classIds:['class-2-1']}));
  await assertFails(updateDoc(doc(db,'users/alice'),{status:'approved',role:'admin',updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(doc(db,'users/alice'),{classId:'class-2-2',updatedAt:serverTimestamp()}));
  await assertFails(setDoc(doc(db,'classes/evil'),{title:'악성',active:true}));
});
test('교사는 담당 학급 학생만 승인하고 진행·제출만 읽음',async()=>{
  const alice=new StudentStore(auth('alice'));await alice.mutate('alice','lesson-01','save',input(),0);
  const teacher=auth('teacher');
  await assertSucceeds(updateDoc(doc(teacher,'users/pending'),{status:'approved',updatedAt:serverTimestamp()}));
  await assertSucceeds(getDoc(doc(teacher,'users/alice/progress/lesson-01')));
  await assertFails(getDoc(doc(teacher,'users/alice/workspaces/lesson-01')));
  await assertFails(getDoc(doc(teacher,'users/alice/revisions/lesson-01__1')));
  await env.withSecurityRulesDisabled(c=>setDoc(doc(c.firestore(),'users/other'),profile('other','class-2-2')));
  await assertFails(getDoc(doc(teacher,'users/other')));
  await assertFails(updateDoc(doc(teacher,'users/other'),{status:'approved',updatedAt:serverTimestamp()}));
  await assertSucceeds(getDocs(query(collection(teacher,'users'),where('classId','==','class-2-1'),limit(100))));
});
test('학생 제출본만 교사 열람 허용, 타 학급 교사 차단',async()=>{
  await new StudentStore(auth('alice')).mutate('alice','lesson-01','submit',input('print("제출")'),0);
  assert.equal((await getDoc(doc(auth('teacher'),'users/alice/submissions/lesson-01'))).data().code,'print("제출")');
  await seed([['staff/other-teacher',{classIds:['class-2-2']}]]);
  await assertFails(getDoc(doc(auth('other-teacher'),'users/alice/submissions/lesson-01')));
});
test('코드 20,000자·문서 필드·고정 작업실·수정 이력 슬롯 제한',async()=>{
  const store=new StudentStore(auth('alice'));await assert.rejects(store.mutate('alice','lesson-01','save',input('x'.repeat(20001)),0));
  await assert.rejects(store.mutate('alice','arbitrary-999999','save',input(),0));
  const db=auth('alice');await assertFails(setDoc(doc(db,'users/alice/workspaces/lesson-01'),{...input(),admin:true}));
  await assertFails(setDoc(doc(db,'users/alice/revisions/evil'),{...input(),slot:999}));
});
test('저장 간격·일일 횟수는 SDK 우회 직접 요청에도 적용',async()=>{
  const db=auth('alice'),store=new StudentStore(db);await store.mutate('alice','lesson-01','save',input(),0);
  await assert.rejects(store.mutate('alice','lesson-02','save',input(),0),{code:'cooldown'});
  const batch=writeBatch(db);const now=Timestamp.now();
  batch.set(doc(db,'users/alice/limits/state'),{day:Timestamp.fromMillis(Math.floor(now.toMillis()/86400000)*86400000),count:2,workspaceId:'lesson-02',kind:'save',updatedAt:serverTimestamp()});
  batch.set(doc(db,'users/alice/workspaces/lesson-02'),{workspaceId:'lesson-02',lessonId:'lesson-02',title:'직접',code:'print(1)',runState:'idle',completed:false,version:1,savedAt:serverTimestamp()});
  await assertFails(batch.commit());
  await env.withSecurityRulesDisabled(c=>setDoc(doc(c.firestore(),'users/alice/limits/state'),{day:Timestamp.fromMillis(Math.floor(Date.now()/86400000)*86400000),count:150,workspaceId:'lesson-01',kind:'save',updatedAt:Timestamp.fromMillis(Date.now()-20000)}));
  await assert.rejects(store.mutate('alice','lesson-02','save',input(),0),{code:'daily-limit'});
});
test('동시 편집 충돌이 다른 기기 코드를 덮어쓰지 않음',async()=>{
  const db=auth('alice'),store=new StudentStore(db);await store.mutate('alice','lesson-01','save',input('first'),0);
  await assert.rejects(store.mutate('alice','lesson-01','save',input('stale'),0),{code:'conflict'});
  assert.equal((await store.load('alice','lesson-01')).code,'first');
});
test('저장 이력 복원용 코드와 현재본이 함께 기록됨',async()=>{
  const store=new StudentStore(auth('alice'));await store.mutate('alice','lesson-01','save',input('old'),0);
  const revisions=await store.revisions('alice','lesson-01');assert.equal(revisions[0].code,'old');
  await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'users/alice/limits/state'),{updatedAt:Timestamp.fromMillis(Date.now()-20000)}));
  await store.mutate('alice','lesson-01','save',input('new'),1);
  assert.deepEqual((await store.revisions('alice','lesson-01')).map(r=>r.code),['new','old']);
});
test('수정 이력을 최근 10개로 제한해 저장 공간 증가를 막음',async()=>{
  const store=new StudentStore(auth('alice'));
  for(let version=0;version<12;version++) {
    if(version) await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'users/alice/limits/state'),{updatedAt:Timestamp.fromMillis(Date.now()-20000)}));
    await store.mutate('alice','lesson-01','save',input('version '+(version+1)),version);
  }
  const revisions=await store.revisions('alice','lesson-01');assert.equal(revisions.length,10);assert.equal(revisions[0].version,12);assert.equal(revisions.at(-1).version,3);
});
test('29명 동시 저장·불러오기·교차 UID 차단',async()=>{
  const uids=Array.from({length:29},(_,i)=>'student-'+String(i+1).padStart(2,'0'));
  await env.withSecurityRulesDisabled(c=>Promise.all(uids.map(uid=>setDoc(doc(c.firestore(),'users',uid),profile(uid)))));
  const start=Date.now();
  await Promise.all(uids.map(async(uid,i)=>{
    const store=new StudentStore(auth(uid));await store.mutate(uid,'lesson-01','save',input('print('+i+')'),0);
    assert.equal((await store.load(uid,'lesson-01')).code,'print('+i+')');
    await assertFails(store.load(uids[(i+1)%29],'lesson-01'));
  }));
  console.log(JSON.stringify({test:'29 concurrent students',saved:29,read:29,crossUidDenied:29,milliseconds:Date.now()-start,environment:'Firestore emulator'}));
});
test('로그아웃·계정 교체 후 늦게 도착한 결과와 학생 코드 제거',()=>{
  const s=new StudentSession();s.change('alice');s.set('private alice');const old=s.checkpoint();
  s.change('bob');assert.equal(s.code,'');assert.equal(s.dirty,false);assert.equal(s.saved(old,1),false);assert.equal(s.code,'');
  s.set('bob new');const pending=s.checkpoint();s.set('bob newer');assert.equal(s.saved(pending,1),true);assert.equal(s.dirty,true);
  s.change(null);assert.equal(s.uid,null);assert.equal(s.code,'');assert.equal(s.version,0);
});
