import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {schoolsFor,enrollmentInput,affiliation,registrationMode,approvedStudent} from '../src/enrollment.js';
const catalog=JSON.parse(readFileSync('sw/security/enrollment-catalog.proposed.json','utf8'));
const email='fictional@muhak-g-h.gne.go.kr';
const fields={schoolId:'muhak-g-h',grade:'1',classNumber:'1',displayName:'검증학생',confirmed:true};
test('school/grade/class/name/confirmation are mandatory and never inferred from Google name',()=>{
 for(const key of ['schoolId','grade','classNumber','displayName']) assert.throws(()=>enrollmentInput(catalog,email,{...fields,[key]:''}));
 assert.throws(()=>enrollmentInput(catalog,email,{...fields,confirmed:false}));
 assert.throws(()=>enrollmentInput(catalog,email,{...fields,displayName:' '.repeat(5)}));
});
test('grade-1 affiliation is retained independently of historical teacher roster',()=>{
 const p=enrollmentInput(catalog,email,fields);
 assert.equal(p.enrollment.grade,1);assert.equal(p.enrollment.classNumber,1);
 assert.equal(affiliation(p),'마산무학여자고등학교 · 2026학년도 1학년 1반');
 assert.equal(p.classId,catalog.schools['muhak-g-h'].approvalClassId);
});
test('wrong school/domain, unsupported grades/classes and inactive catalog are rejected',()=>{
 for(const change of [{schoolId:'other'},{grade:'0'},{grade:'4'},{classNumber:'0'},{classNumber:'99'},{displayName:'<script>'}]) assert.throws(()=>enrollmentInput(catalog,email,{...fields,...change}));
 assert.deepEqual(schoolsFor(catalog,'fictional@gmail.com'),[]);
 assert.throws(()=>enrollmentInput({...catalog,enabled:false},email,fields));
});
test('legacy test approvals always require enrollment; teachers retain their access',()=>{
 for(const status of ['pending','approved','blocked']){assert.equal(registrationMode({status},null),'form');assert.equal(approvedStudent({status}),false);}
 assert.equal(registrationMode(null,{classIds:['class-2-1']}),'hidden');
 const p=enrollmentInput(catalog,email,fields);
 assert.equal(registrationMode({...p,status:'pending'},null),'pending');
 assert.equal(approvedStudent({...p,status:'pending'}),false);
 assert.equal(approvedStudent({...p,status:'approved'}),true);
 assert.equal(registrationMode({...p,status:'blocked'},null),'hidden');
});
test('proposed shared rules preserve MK and commercial sections exactly',()=>{
 const old=readFileSync('sw/security/integration-proposed.rules','utf8'),next=readFileSync('sw/security/enrollment-proposed.rules','utf8');
 const marker='    // Academic-year-scoped 2026 Grade 1 cohort';
 assert.equal(next.slice(next.indexOf(marker)),old.slice(old.indexOf(marker)));
});
