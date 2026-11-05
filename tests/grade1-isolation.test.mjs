import { readFileSync } from 'node:fs';
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, limit, getDocs, Timestamp, serverTimestamp } from 'firebase/firestore';
import { StudentStore as Grade2Store } from '../public/pandas-data-lab/student-cloud.js';
import { StudentStore as Grade1Store, schoolRoot } from '../mk/grade1-cloud.js';

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
    setDoc(doc(db,'cohorts/2026/grade1_users/alice'),profile('alice','class-1-1')),
    setDoc(doc(db,'cohorts/2026/grade1_users/bob'),profile('bob','class-1-2')),
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
  assert.equal((await getDoc(doc(db,'cohorts/2026/grade1_users/alice/progress/scratch-01'))).data().workspaceId,'scratch-01');
});

test('Grade 1 and Grade 2 separate per-UID quota counters and submissions',async()=>{
  const db=auth('alice');
  await new Grade2Store(db).mutate('alice','lesson-01','submit',code('print(2)','class-2-1'),0);
  await new Grade1Store(db).mutate('alice','lesson-01','submit',code('print(1)','class-1-1'),0);
  assert.equal((await getDoc(doc(db,'users/alice/submissions/lesson-01'))).data().code,'print(2)');
  assert.equal((await getDoc(doc(db,'cohorts/2026/grade1_users/alice/submissions/lesson-01'))).data().code,'print(1)');
  assert.equal((await getDoc(doc(db,'users/alice/limits/state'))).data().count,1);
  assert.equal((await getDoc(doc(db,'cohorts/2026/grade1_users/alice/limits/state'))).data().count,1);
});

test('Grade 1 identity and code are invisible to other students',async()=>{
  await new Grade1Store(auth('alice')).mutate('alice','lesson-01','save',code('secret','class-1-1'),0);
  await assertFails(new Grade1Store(auth('bob')).load('alice','lesson-01'));
  await assertFails(getDoc(doc(auth('bob'),'cohorts/2026/grade1_users/alice')));
  await assertFails(getDoc(doc(auth('bob'),'cohorts/2026/grade1_users/alice/revisions/lesson-01__1')));
});

test('Grade 1 class registration permits pending only, and rejects Grade 2 IDs',async()=>{
  const db=auth('new');
  const fresh=(classId,status)=>({email:'new@muhak-g-h.gne.go.kr',displayName:'new',classId,status,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  await assertFails(setDoc(doc(db,'cohorts/2026/grade1_users/new'),fresh('class-2-1','pending')));
  await assertFails(setDoc(doc(db,'cohorts/2026/grade1_users/new'),fresh('class-1-1','approved')));
  await assertSucceeds(setDoc(doc(db,'cohorts/2026/grade1_users/new'),fresh('class-1-2','pending')));
  await assertFails(updateDoc(doc(db,'cohorts/2026/grade1_users/new'),{classId:'class-1-1',updatedAt:serverTimestamp()}));
});

test('Only school teacher with existing staff authorization may approve Grade 1 profiles',async()=>{
  const db=auth('teacher','englishmath@muhak-g-h.gne.go.kr');
  await assertSucceeds(updateDoc(doc(db,'cohorts/2026/grade1_users/bob'),{status:'approved',updatedAt:serverTimestamp()}));
  await assertSucceeds(getDocs(query(collection(db,'cohorts/2026/grade1_users'),where('classId','==','class-1-2'),limit(100))));
  const other=auth('unlisted-teacher','unlisted-teacher@muhak-g-h.gne.go.kr');
  await assertFails(getDoc(doc(other,'cohorts/2026/grade1_users/bob')));
  await assertFails(updateDoc(doc(other,'cohorts/2026/grade1_users/bob'),{status:'blocked',updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(doc(auth('alice'),'cohorts/2026/grade1_users/bob'),{status:'approved',updatedAt:serverTimestamp()}));
});

test('Grade 1 staff cannot read private drafts; only explicitly submitted Grade 1 code',async()=>{
  const student=auth('alice'),teacher=auth('teacher','englishmath@muhak-g-h.gne.go.kr');
  await new Grade1Store(student).mutate('alice','lesson-01','save',code('private','class-1-1'),0);
  await assertFails(getDoc(doc(teacher,'cohorts/2026/grade1_users/alice/workspaces/lesson-01')));
  await assertFails(getDoc(doc(teacher,'cohorts/2026/grade1_users/alice/revisions/lesson-01__1')));
  await assertSucceeds(getDoc(doc(teacher,'cohorts/2026/grade1_users/alice/progress/lesson-01')));
  await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'cohorts/2026/grade1_users/alice/limits/state'),{updatedAt:Timestamp.fromMillis(Date.now()-20000)}));
  await new Grade1Store(student).mutate('alice','lesson-01','submit',code('submitted','class-1-1'),1);
  assert.equal((await getDoc(doc(teacher,'cohorts/2026/grade1_users/alice/submissions/lesson-01'))).data().code,'submitted');
  await assertFails(getDoc(doc(auth('bob'),'cohorts/2026/grade1_users/alice/submissions/lesson-01')));
});

test('Personal Google learner can enroll without a school domain and save private code immediately',async()=>{
  const db=auth('visitor','visitor@gmail.com');
  const personal={email:'visitor@gmail.com',displayName:'방문 학습자',userType:'personal',status:'approved',createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
  await assertSucceeds(setDoc(doc(db,'public_users/visitor'),personal));
  const store=new Grade1Store(db,'public_users');
  await store.mutate('visitor','scratch-01','save',code('print("public learner")',''),0);
  assert.equal((await store.load('visitor','scratch-01')).code,'print("public learner")');
  assert.equal((await store.list('visitor'))[0].workspaceId,'scratch-01');
  assert.equal((await store.revisions('visitor','scratch-01'))[0].code,'print("public learner")');
  assert.equal((await getDoc(doc(db,'users/visitor'))).exists(),false);
  await assertFails(getDoc(doc(db,'cohorts/2026/grade1_users/alice')));
});

test('Personal learner accounts cannot impersonate school enrollment or self-assign another identity',async()=>{
  const db=auth('visitor','visitor@gmail.com'),ownDoc=doc(db,'public_users/visitor');
  const base={email:'visitor@gmail.com',displayName:'방문',userType:'personal',status:'approved',createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
  await assertFails(setDoc(ownDoc,{...base,classId:'class-1-1'}));
  await assertFails(setDoc(ownDoc,{...base,userType:'teacher'}));
  await assertFails(setDoc(ownDoc,{...base,email:'not-me@gmail.com'}));
  await assertSucceeds(setDoc(ownDoc,base));
  await assertFails(updateDoc(ownDoc,{status:'blocked',updatedAt:serverTimestamp()}));
  await assertFails(setDoc(doc(db,'public_users/another'),base));
});

test('Other learners and teachers cannot read or submit personal code',async()=>{
  const visitor=auth('visitor','visitor@gmail.com'),other=auth('outsider','outsider@gmail.com');
  await setDoc(doc(visitor,'public_users/visitor'),{email:'visitor@gmail.com',displayName:'Guest',userType:'personal',status:'approved',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  await new Grade1Store(visitor,'public_users').mutate('visitor','lesson-01','save',code('print("secret")',''),0);
  const privatePath='public_users/visitor/workspaces/lesson-01';
  await assertFails(getDoc(doc(other,privatePath)));
  await assertFails(getDoc(doc(auth('teacher','englishmath@muhak-g-h.gne.go.kr'),privatePath)));
  await assertFails(getDoc(doc(other,'public_users/visitor')));
  await assertFails(getDocs(query(collection(other,'public_users'),limit(10))));
  await assertFails(setDoc(doc(visitor,'public_users/visitor/submissions/lesson-01'),{code:'unwanted'}));
});

test('Single teacher account can inspect authorized Grade 1 and 2 rosters without cross-grade mixing',async()=>{
  const teacher=auth('teacher','englishmath@muhak-g-h.gne.go.kr');
  const second=await assertSucceeds(getDocs(query(collection(teacher,'users'),where('classId','==','class-2-1'),limit(100))));
  const first=await assertSucceeds(getDocs(query(collection(teacher,'cohorts/2026/grade1_users'),where('classId','==','class-1-1'),limit(100))));
  assert(second.docs.some(d=>d.id==='alice'));
  assert(first.docs.some(d=>d.id==='alice'));
  assert.equal(second.docs[0].ref.parent.path,'users');
  assert.equal(first.docs[0].ref.parent.path,'cohorts/2026/grade1_users');
  await assertFails(getDocs(query(collection(teacher,'users'),where('classId','==','class-2-2'),limit(100))));
  await assertFails(getDoc(doc(teacher,'public_users/visitor')));
});

test('A future-year Grade 1 record is never reused by the 2026 student workspace',async()=>{
  const student=auth('alice');
  await env.withSecurityRulesDisabled(async c=>{
    await setDoc(doc(c.firestore(),'cohorts/2027/grade1_users/alice'),profile('alice','class-1-1'));
  });
  const current=new Grade1Store(student,'cohorts/2026/grade1_users');
  assert.equal(await current.load('alice','scratch-02'),null);
  assert.equal((await getDoc(doc(student,'cohorts/2027/grade1_users/alice'))).data().classId,'class-1-1');
});

test('Academic-year routes preserve the 2026 Grade 2 root and reject unsupported years', () => {
  assert.equal(schoolRoot(2026, 1), 'cohorts/2026/grade1_users');
  assert.equal(schoolRoot(2026, 2), 'users');
  assert.equal(schoolRoot(2027, 2), 'cohorts/2027/grade2_users');
  assert.throws(() => schoolRoot(2028, 1));
  assert.throws(() => schoolRoot(2027, 3));
});

test('Promotion creates a fresh pending profile and preserves the previous year through approval and reload', async () => {
  const student = auth('alice');
  const teacher = auth('teacher', 'englishmath@muhak-g-h.gne.go.kr');
  const oldRoot = schoolRoot(2026, 1), newRoot = schoolRoot(2027, 2);
  const oldStore = new Grade1Store(student, oldRoot);
  const nextStore = new Grade1Store(student, newRoot);
  await oldStore.mutate('alice', 'scratch-01', 'save', code('print("2026")', 'class-1-1'), 0);
  const oldProfile = (await getDoc(doc(student, oldRoot, 'alice'))).data();
  await setDoc(doc(student, newRoot, 'alice'), {
    email: 'alice@muhak-g-h.gne.go.kr', displayName: 'alice', classId: 'class-2-1',
    status: 'pending', createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  });
  await assertFails(nextStore.mutate('alice', 'scratch-01', 'save', code('before approval', 'class-2-1'), 0));
  await assertSucceeds(updateDoc(doc(teacher, newRoot, 'alice'), { status: 'approved', updatedAt: serverTimestamp() }));
  assert.equal(await nextStore.load('alice', 'scratch-01'), null);
  await nextStore.mutate('alice', 'scratch-01', 'save', code('print("2027")', 'class-2-1'), 0);
  const reconnected = auth('alice');
  assert.equal((await new Grade1Store(reconnected, oldRoot).load('alice', 'scratch-01')).code, 'print("2026")');
  assert.equal((await new Grade1Store(reconnected, newRoot).load('alice', 'scratch-01')).code, 'print("2027")');
  assert.deepEqual((await getDoc(doc(student, oldRoot, 'alice'))).data(), oldProfile);
  assert.equal((await getDoc(doc(student, 'users/alice'))).data().status, 'approved');
  assert.equal((await nextStore.revisions('alice', 'scratch-01'))[0].code, 'print("2027")');
});

test('2027 class and teacher access follow the selected grade and retain draft privacy', async () => {
  const student = auth('new'), teacher = auth('teacher', 'englishmath@muhak-g-h.gne.go.kr');
  const root = schoolRoot(2027, 2);
  const fresh = classId => ({ email: 'new@muhak-g-h.gne.go.kr', displayName: 'new', classId,
    status: 'pending', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  await assertFails(setDoc(doc(student, root, 'new'), fresh('class-1-1')));
  await assertFails(setDoc(doc(student, 'cohorts/2027/unrecognized/new'), fresh('class-2-1')));
  await assertFails(setDoc(doc(student, 'cohorts/2028/grade2_users/new'), fresh('class-2-1')));
  await assertSucceeds(setDoc(doc(student, root, 'new'), fresh('class-2-1')));
  await assertFails(updateDoc(doc(student, root, 'new'), { status: 'approved', updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(auth('outsider'), root, 'new'), { status: 'approved', updatedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(doc(teacher, root, 'new'), { status: 'approved', updatedAt: serverTimestamp() }));
  await new Grade1Store(student, root).mutate('new', 'lesson-01', 'save', code('private 2027', 'class-2-1'), 0);
  await assertFails(getDoc(doc(teacher, root, 'new', 'workspaces', 'lesson-01')));
  await assertFails(getDoc(doc(auth('bob'), root, 'new', 'workspaces', 'lesson-01')));
  await assertSucceeds(getDoc(doc(teacher, root, 'new', 'progress', 'lesson-01')));
  const roster = await getDocs(query(collection(teacher, root), where('classId', '==', 'class-2-1'), limit(100)));
  assert.equal(roster.docs[0].id, 'new');
  await assertFails(getDocs(query(collection(auth('bob'), root), where('classId', '==', 'class-2-1'), limit(100))));
});
