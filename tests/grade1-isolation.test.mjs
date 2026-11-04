import { readFileSync } from 'node:fs';
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, limit, getDocs, Timestamp, serverTimestamp } from 'firebase/firestore';
import { StudentStore as Grade2Store } from '../public/pandas-data-lab/student-cloud.js';
import { StudentStore as Grade1Store, createCloud } from '../mk/grade1-cloud.js';

const projectId='demo-englishmath-python';
let env;
const auth=(uid,email=uid+'@muhak-g-h.gne.go.kr')=>env.authenticatedContext(uid,{email,email_verified:true,firebase:{sign_in_provider:'google.com'}}).firestore();
const profile=(uid,cls)=>({email:uid+'@muhak-g-h.gne.go.kr',displayName:uid,classId:cls,status:'approved',createdAt:Timestamp.now(),updatedAt:Timestamp.now()});
const code=(value,cls)=>({code:value,title:'실습',runState:'success',completed:false,classId:cls});
before(async()=>{env=await initializeTestEnvironment({projectId,firestore:{host:'127.0.0.1',port:8080,rules:readFileSync('firestore.rules','utf8')}})});
beforeEach(async()=>{await env.clearFirestore();await env.withSecurityRulesDisabled(async c=>{
  const db=c.firestore();await Promise.all([
    setDoc(doc(db,'config/access'),{allowedDomains:['muhak-g-h.gne.go.kr'],allowedEmails:[]}),
    setDoc(doc(db,'classes/class-2-1'),{title:'2학년 1반',active:true}),
    setDoc(doc(db,'staff/teacher'),{classIds:['class-2-1']}),
    setDoc(doc(db,'users/alice'),profile('alice','class-2-1')),
    setDoc(doc(db,'grade1_users/alice'),profile('alice','class-1-1')),
    setDoc(doc(db,'grade1_users/bob'),profile('bob','class-1-2')),
  ]);
})});
after(async()=>env?.cleanup());

test('same UID, same workspace key: Grade 1 and Grade 2 code, progress and revisions remain independent',async()=>{
  const db=auth('alice'),older=new Grade2Store(db),first=new Grade1Store(db);
  await older.mutate('alice','scratch-01','save',code('print("Grade 2")','class-2-1'),0);
  await first.mutate('alice','scratch-01','save',code('print("Grade 1")','class-1-1'),0);
  assert.equal((await older.load('alice','scratch-01')).code,'print("Grade 2")');
  assert.equal((await first.load('alice','scratch-01')).code,'print("Grade 1")');
  assert.equal((await older.revisions('alice','scratch-01'))[0].code,'print("Grade 2")');
  assert.equal((await first.revisions('alice','scratch-01'))[0].code,'print("Grade 1")');
  assert.equal((await getDoc(doc(db,'users/alice/progress/scratch-01'))).data().workspaceId,'scratch-01');
  assert.equal((await getDoc(doc(db,'grade1_users/alice/progress/scratch-01'))).data().workspaceId,'scratch-01');
});

test('Grade 1 and Grade 2 separate per-UID quota counters and submissions',async()=>{
  const db=auth('alice');
  await new Grade2Store(db).mutate('alice','lesson-01','submit',code('print(2)','class-2-1'),0);
  await new Grade1Store(db).mutate('alice','lesson-01','submit',code('print(1)','class-1-1'),0);
  assert.equal((await getDoc(doc(db,'users/alice/submissions/lesson-01'))).data().code,'print(2)');
  assert.equal((await getDoc(doc(db,'grade1_users/alice/submissions/lesson-01'))).data().code,'print(1)');
  assert.equal((await getDoc(doc(db,'users/alice/limits/state'))).data().count,1);
  assert.equal((await getDoc(doc(db,'grade1_users/alice/limits/state'))).data().count,1);
});

test('Grade 1 identity and code are invisible to other students',async()=>{
  await new Grade1Store(auth('alice')).mutate('alice','lesson-01','save',code('secret','class-1-1'),0);
  await assertFails(new Grade1Store(auth('bob')).load('alice','lesson-01'));
  await assertFails(getDoc(doc(auth('bob'),'grade1_users/alice')));
  await assertFails(getDoc(doc(auth('bob'),'grade1_users/alice/revisions/lesson-01__1')));
});

test('Grade 1 class registration permits pending only, and rejects Grade 2 IDs',async()=>{
  const db=auth('new');
  const fresh=(classId,status)=>({email:'new@muhak-g-h.gne.go.kr',displayName:'new',classId,status,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  await assertFails(setDoc(doc(db,'grade1_users/new'),fresh('class-2-1','pending')));
  await assertFails(setDoc(doc(db,'grade1_users/new'),fresh('class-1-1','approved')));
  await assertSucceeds(setDoc(doc(db,'grade1_users/new'),fresh('class-1-2','pending')));
  await assertFails(updateDoc(doc(db,'grade1_users/new'),{classId:'class-1-1',updatedAt:serverTimestamp()}));
});

test('Only school teacher with existing staff authorization may approve Grade 1 profiles',async()=>{
  const db=auth('teacher','englishmath@muhak-g-h.gne.go.kr');
  await assertSucceeds(updateDoc(doc(db,'grade1_users/bob'),{status:'approved',updatedAt:serverTimestamp()}));
  await assertSucceeds(getDocs(query(collection(db,'grade1_users'),where('classId','==','class-1-2'),limit(100))));
  const other=auth('unlisted-teacher','unlisted-teacher@muhak-g-h.gne.go.kr');
  await assertFails(getDoc(doc(other,'grade1_users/bob')));
  await assertFails(updateDoc(doc(other,'grade1_users/bob'),{status:'blocked',updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(doc(auth('alice'),'grade1_users/bob'),{status:'approved',updatedAt:serverTimestamp()}));
});

test('Grade 1 staff cannot read private drafts; only explicitly submitted Grade 1 code',async()=>{
  const student=auth('alice'),teacher=auth('teacher','englishmath@muhak-g-h.gne.go.kr');
  await new Grade1Store(student).mutate('alice','lesson-01','save',code('private','class-1-1'),0);
  await assertFails(getDoc(doc(teacher,'grade1_users/alice/workspaces/lesson-01')));
  await assertFails(getDoc(doc(teacher,'grade1_users/alice/revisions/lesson-01__1')));
  await assertSucceeds(getDoc(doc(teacher,'grade1_users/alice/progress/lesson-01')));
  await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'grade1_users/alice/limits/state'),{updatedAt:Timestamp.fromMillis(Date.now()-20000)}));
  await new Grade1Store(student).mutate('alice','lesson-01','submit',code('submitted','class-1-1'),1);
  assert.equal((await getDoc(doc(teacher,'grade1_users/alice/submissions/lesson-01'))).data().code,'submitted');
  await assertFails(getDoc(doc(auth('bob'),'grade1_users/alice/submissions/lesson-01')));
});
