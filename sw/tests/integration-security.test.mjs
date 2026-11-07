import {readFileSync} from 'node:fs';
import {test,before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {initializeTestEnvironment,assertFails} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,updateDoc,Timestamp} from 'firebase/firestore';
import {StudentStore} from '../src/cloud.js';
import {newIds,exercises,structured} from '../src/registry.js';
import {encode} from '../src/store.js';
import {activityIds} from '../src/registry.js';
let env;
const auth=uid=>env.authenticatedContext(uid,{email:uid+'@muhak-g-h.gne.go.kr',email_verified:true,firebase:{sign_in_provider:'google.com'}}).firestore();
const profile=status=>({email:'alice@muhak-g-h.gne.go.kr',displayName:'emulator',classId:'class-2-1',status,createdAt:Timestamp.now(),updatedAt:Timestamp.now()});
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-englishmath-python',firestore:{host:'127.0.0.1',port:8080,rules:readFileSync('sw/security/integration-proposed.rules','utf8')}});});
beforeEach(async()=>{await env.clearFirestore();await env.withSecurityRulesDisabled(async c=>{
 const db=c.firestore();await Promise.all([setDoc(doc(db,'config/access'),{allowedDomains:['muhak-g-h.gne.go.kr'],allowedEmails:[]}),setDoc(doc(db,'users/alice'),profile('approved')),setDoc(doc(db,'users/bob'),profile('approved')),setDoc(doc(db,'users/pending'),profile('pending')),setDoc(doc(db,'staff/teacher'),{classIds:['class-2-1']}),setDoc(doc(db,'cohorts/2026/grade1_users/alice'),{...profile('approved'),classId:'class-1-1'}),setDoc(doc(db,'public_users/alice'),{email:'alice@muhak-g-h.gne.go.kr',displayName:'emulator',status:'approved',userType:'personal',createdAt:Timestamp.now(),updatedAt:Timestamp.now()})]);
});});
after(async()=>env?.cleanup());
const data=id=>({title:'SW emulator '+id,code:structured(id)?encode(id,{}):'print("SW")',runState:'idle',completed:false,classId:'class-2-1'});
const age=()=>env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'users/alice/limits/state'),{updatedAt:Timestamp.fromMillis(Date.now()-20000)}));
test('all 64 new finite IDs save and restore without opening MK or personal paths',async()=>{
 const a=new StudentStore(auth('alice'));
 for(const [i,id] of newIds.entries()){
  if(i)await age();assert.equal(await a.mutate('alice',id,'save',data(id),0),1);
  assert.equal((await a.load('alice',id)).code,data(id).code);
  await assertFails(new StudentStore(auth('bob')).load('alice',id));
  await assertFails(getDoc(doc(auth('teacher'),'users/alice/workspaces',id)));
 }
 assert.equal(newIds.length,64);
});
test('pending cannot save new activities; teachers see only explicit submissions',async()=>{
 const id='sw2-report',a=new StudentStore(auth('alice'));await assertFails(new StudentStore(auth('pending')).mutate('pending',id,'save',data(id),0));
 await a.mutate('alice',id,'save',data(id),0);await assertFails(getDoc(doc(auth('teacher'),'users/alice/workspaces',id)));
 await age();await a.mutate('alice',id,'submit',data(id),1);assert.equal((await getDoc(doc(auth('teacher'),'users/alice/submissions',id))).data().code,data(id).code);
 await assert.rejects(a.mutate('alice',id,'submit',data(id),0),{code:'conflict'});
});
test('new IDs do not widen MK allowlists, preserve grade/year and deny arbitrary IDs',async()=>{
 const id='sw2-report';const db=auth('alice');
 for(const prefix of ['cohorts/2026/grade1_users/alice','cohorts/2027/grade1_users/alice','cohorts/2027/grade2_users/alice','public_users/alice']){
  await assertFails(setDoc(doc(db,prefix,'workspaces',id),{workspaceId:id,lessonId:id,...data(id),version:1,savedAt:Timestamp.now()}));
 }
 await assert.rejects(new StudentStore(db).mutate('alice','sw2-unbounded-any-id','save',data(id),0));
});

test('29 concurrent simulated student initial reads and saves remain separated',async()=>{
 const users=Array.from({length:29},(_,i)=>'sim-'+String(i+1).padStart(2,'0'));
 await env.withSecurityRulesDisabled(async c=>Promise.all(users.map(uid=>setDoc(doc(c.firestore(),'users',uid),{...profile('approved'),email:uid+'@muhak-g-h.gne.go.kr',displayName:uid}))));
 const start=Date.now();
 await Promise.all(users.map(async(uid,i)=>{
  const db=auth(uid),s=new StudentStore(db),id='sw2-report';
  assert.equal((await getDoc(doc(db,'users',uid))).data().status,'approved');
  assert.equal(await s.load(uid,id),null);
  const input={...data(id),code:encode(id,{question:uid+' fictional'})};
  await s.mutate(uid,id,'save',input,0);assert.equal((await s.load(uid,id)).code,input.code);
  await assertFails(s.load(users[(i+1)%users.length],id));assert.equal((await s.list(uid)).length,1);
 }));
 console.log(JSON.stringify({environment:'29 emulator identities, no real PCs or browser/CDN load',students:29,durationMs:Date.now()-start,status:'PASS'}));
});

test('new exercise records are owned; class, site and year boundaries stay closed',async()=>{
 const a=new StudentStore(auth('alice'));
 for(const [i,e] of [exercises[0],exercises[50],exercises.at(-1)].entries()){
  const id=e.id;if(i)await age();
  const record={...data(id),code:encode(id,{code:'X=7',stdin:'4',teacherCodeVersion:e.teacherCodeVersion,persistenceVersion:1})};
  await a.mutate('alice',id,'save',record,0);
  assert.equal((await a.load('alice',id)).code,record.code);
  await assertFails(new StudentStore(auth('bob')).load('alice',id));
  await assertFails(getDoc(doc(auth('teacher'),'users/alice/workspaces',id)));
  for(const prefix of ['cohorts/2026/grade1_users/alice','cohorts/2027/grade2_users/alice','public_users/alice'])
   await assertFails(setDoc(doc(auth('alice'),prefix,'workspaces',id),{workspaceId:id,lessonId:id,...record,version:1,savedAt:Timestamp.now()}));
 }
});

test('library paginates more than 150 authorized exercise records without cross-user reads',async()=>{
 const ids=activityIds.slice(0,160);assert.equal(ids.length,160);
 await env.withSecurityRulesDisabled(async c=>{const db=c.firestore();await Promise.all(ids.map(id=>setDoc(doc(db,'users/alice/workspaces',id),{workspaceId:id,lessonId:id,...data(id),version:1,savedAt:Timestamp.now()})));});
 const rows=await new StudentStore(auth('alice')).list('alice');assert.equal(rows.length,160);assert.equal(new Set(rows.map(r=>r.workspaceId)).size,160);
 await assertFails(new StudentStore(auth('bob')).list('alice'));
});
