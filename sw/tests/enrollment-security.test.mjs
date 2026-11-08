import {readFileSync} from 'node:fs';
import {test,before,beforeEach,after} from 'node:test';
import assert from 'node:assert/strict';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,updateDoc,serverTimestamp,Timestamp,collection,query,where,limit,getDocs} from 'firebase/firestore';
import {registerStudent,StudentStore} from '../src/cloud.js';
const catalog=JSON.parse(readFileSync('sw/security/enrollment-catalog.proposed.json','utf8'));
const fields={schoolId:'muhak-g-h',grade:'1',classNumber:'1',displayName:'검증학생',confirmed:true};
const enrollment={schoolId:'muhak-g-h',schoolName:'마산무학여자고등학교',academicYear:2026,grade:1,classNumber:1};
const person=uid=>({uid,email:uid+'@muhak-g-h.gne.go.kr'});
const profile=(uid,status='pending')=>({email:person(uid).email,displayName:'검증학생',classId:'class-2-1',enrollment,status,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
let env;
const auth=(uid,claims={})=>env.authenticatedContext(uid,{email:person(uid).email,email_verified:true,firebase:{sign_in_provider:'google.com'},...claims}).firestore();
const admin=fn=>env.withSecurityRulesDisabled(c=>fn(c.firestore()));
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-englishmath-python',firestore:{host:'127.0.0.1',port:8080,rules:readFileSync('sw/security/enrollment-proposed.rules','utf8')}});});
beforeEach(async()=>{await env.clearFirestore();await admin(db=>Promise.all([
 setDoc(doc(db,'config/swEnrollment'),catalog),setDoc(doc(db,'config/access'),{allowedDomains:['muhak-g-h.gne.go.kr'],allowedEmails:[]}),
 setDoc(doc(db,'classes/class-2-1'),{active:true,title:'SW 승인 담당 수업'}),setDoc(doc(db,'classes/class-2-2'),{active:true,title:'다른 담당 수업'}),
 setDoc(doc(db,'staff/teacher'),{classIds:['class-2-1']}),setDoc(doc(db,'staff/other-teacher'),{classIds:['class-2-2']})
]));});
after(async()=>env?.cleanup());
test('first login requests actual grade 1; assigned teacher sees affiliation and approves; only then cloud save',async()=>{
 const db=auth('new-student');await registerStudent(db,person('new-student'),fields);
 const ref=doc(db,'users/new-student');assert.equal((await getDoc(ref)).data().status,'pending');assert.deepEqual((await getDoc(ref)).data().enrollment,enrollment);
 const store=new StudentStore(db),input={code:'print(1)',title:'검증',runState:'idle',completed:false};
 await assertFails(store.mutate('new-student','lesson-01','save',input,0));
 const list=await getDocs(query(collection(auth('teacher'),'users'),where('classId','==','class-2-1'),limit(100)));
 assert.equal(list.docs[0].data().enrollment.grade,1);
 await assertFails(updateDoc(doc(auth('other-teacher'),'users/new-student'),{status:'approved',updatedAt:serverTimestamp()}));
 await assertSucceeds(updateDoc(doc(auth('teacher'),'users/new-student'),{status:'approved',updatedAt:serverTimestamp()}));
 assert.equal(await store.mutate('new-student','lesson-01','save',input,0),1);
 assert.equal((await new StudentStore(auth('new-student')).load('new-student','lesson-01')).code,'print(1)');
});
test('direct SDK cannot omit affiliation, forge school/year/class/teacher, self-approve, or use another UID/domain',async()=>{
 for(const [i,change] of [{enrollment:null},{enrollment:{...enrollment,schoolId:'evil'}},{enrollment:{...enrollment,academicYear:2027}},{enrollment:{...enrollment,grade:9}},{enrollment:{...enrollment,classNumber:99}},{enrollment:{...enrollment,schoolName:'fake'}},{classId:'class-2-2'},{status:'approved'},{displayName:''},{role:'admin'}].entries()){
  const uid='invalid-'+i;await assertFails(setDoc(doc(auth(uid),'users',uid),{...profile(uid),...change}));
 }
 const legacy=profile('missing');delete legacy.enrollment;await assertFails(setDoc(doc(auth('missing'),'users/missing'),legacy));
 await assertFails(setDoc(doc(auth('stranger',{email:'stranger@gmail.com'}),'users/stranger'),{...profile('stranger'),email:'stranger@gmail.com'}));
 await assertFails(setDoc(doc(auth('alice'),'users/bob'),profile('bob')));
 await assertFails(setDoc(doc(auth('alice'),'config/swEnrollment'),catalog));
});
test('pending student can correct name/class, cannot overwrite after approval or evade blocking',async()=>{
 const db=auth('student');await registerStudent(db,person('student'),fields);
 await registerStudent(db,person('student'),{...fields,classNumber:'2',displayName:'검증학생수정'});
 assert.equal((await getDoc(doc(db,'users/student'))).data().enrollment.classNumber,2);
 await updateDoc(doc(auth('teacher'),'users/student'),{status:'approved',updatedAt:serverTimestamp()});
 await assert.rejects(registerStudent(db,person('student'),fields));
 await updateDoc(doc(auth('teacher'),'users/student'),{status:'blocked',updatedAt:serverTimestamp()});
 await assert.rejects(registerStudent(db,person('student'),fields));
 await assertFails(updateDoc(doc(db,'users/student'),{status:'pending',updatedAt:serverTimestamp()}));
 await assertSucceeds(updateDoc(doc(auth('teacher'),'users/student'),{status:'approved',updatedAt:serverTimestamp()}));
});
test('test-only legacy approvals lose save access and re-enroll pending without deleting old learning records',async()=>{
 for(const status of ['pending','approved','blocked']){
  const uid='legacy-'+status,p=profile(uid,status);delete p.enrollment;
  await admin(db=>Promise.all([setDoc(doc(db,'users',uid),p),setDoc(doc(db,'users',uid,'workspaces','lesson-01'),{workspaceId:'lesson-01',lessonId:'lesson-01',title:'기존 기록',code:'print("kept")',runState:'idle',completed:false,version:1,savedAt:Timestamp.now()})]));
  await assertFails(new StudentStore(auth(uid)).load(uid,'lesson-01'));
  await registerStudent(auth(uid),person(uid),fields);assert.equal((await getDoc(doc(auth(uid),'users',uid))).data().status,'pending');
  await updateDoc(doc(auth('teacher'),'users',uid),{status:'approved',updatedAt:serverTimestamp()});
  assert.equal((await new StudentStore(auth(uid)).load(uid,'lesson-01')).code,'print("kept")');
 }
});
test('account switch invalidates registration before it can write',async()=>{
 await assert.rejects(registerStudent(auth('alice'),person('alice'),fields,()=>{throw Error('계정 변경');}),/계정 변경/);
 assert.equal((await getDoc(doc(auth('alice'),'users/alice'))).exists(),false);
});
