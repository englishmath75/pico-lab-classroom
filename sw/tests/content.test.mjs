import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const sha=b=>createHash('sha256').update(b).digest('hex');
test('preserve ten lessons, fifty stages, twenty course questions and seven report fields',async()=>{
 const original=await readFile('public/pandas-data-lab/course-data.js','utf8'),published=await readFile('dist/course-data.js','utf8');
 assert.equal(sha(published),sha(original));const context={window:{}};vm.runInNewContext(original,context);
 const lessons=context.window.COURSE_LESSONS;assert.equal(lessons.length,10);assert(lessons.every(l=>l.steps.length===5));assert.equal(lessons.flatMap(l=>l.quiz).length,20);
 const app=await readFile('public/pandas-data-lab/app.js','utf8'),fields=['question','source','method','finding','graph','limits','next'];
 fields.forEach(k=>assert(app.includes('"'+k+'"')));const frame=await readFile('dist/sw-content/index.html','utf8');
 assert(frame.includes('id="reportFields"'));
 const proof={baselineSource:'c38e7ce5e057b68898d086dde1caaaceae4f6d00',courseSha256:sha(original),lessons:10,stages:50,courseQuestions:20,reportFields:fields,sourceSha:process.env.GITHUB_SHA};
 await mkdir('sw/evidence',{recursive:true});await writeFile('sw/evidence/content-preservation.json',JSON.stringify(proof,null,2));
});
test('provided CSV bytes, protected runtime and all four inquiries survive packaging',async()=>{
 const files=await readdir('public/pandas-data-lab/datasets');for(const file of files)if(file.endsWith('.csv'))assert.equal(sha(await readFile('public/pandas-data-lab/datasets/'+file)),sha(await readFile('dist/datasets/'+file)));
 for(const file of ['list-tuple-dictionary.html','questions-supplement.html','radians.html','four-turtles.html'])assert((await readFile('dist/sw-content/'+file,'utf8')).length>1000);
 const manifest=JSON.parse(await readFile('sw/datalab/content/runtime-assets.json','utf8'));for(const p of manifest)assert((await readFile('dist'+p)).length>0);
 const candidate=await readFile('dist/index.html','utf8');assert(/sw-assets\/app\.[0-9a-f]{12}\.js/.test(candidate));assert(candidate.includes('data-sw-integrated="2"'));
 assert(!candidate.includes('새 데이터 분석 시각화 실험실'));assert(candidate.includes('새 파이썬 교실 체험 ↗'));
});

test('published lesson and teacher storage guidance matches account storage',async()=>{
 const lesson=await readFile('dist/sw-content/step-by-step.html','utf8');
 const teacher=await readFile('dist/sw-content/teacher-10.html','utf8');
 assert(!lesson.includes('학습 진도와 입력 내용은 현재 기기의 브라우저에만 저장됩니다.'));
 assert(lesson.includes('상단의 클라우드 저장 완료 표시를 확인하세요.'));
 assert(!teacher.includes('학습 기록은 브라우저 로컬 저장이며 자동 제출되지 않습니다.'));
 assert(teacher.includes('다른 PC에서도 같은 계정으로 이어서 학습합니다.'));
 assert(teacher.includes('선생님께 제출은 별도로 선택합니다.'));
});

test('00-class frames retain topic links and original lessons without a nested site sidebar',async()=>{
 for(const name of ['python-review','math-function-graphs','physics-explanation','graphics-gallery']){
  const before=await readFile('public/pandas-data-lab/'+name+'.html','utf8'),after=await readFile('dist/sw-content/'+name+'.html','utf8');
  assert(!after.includes('class="curriculum-side"'),name+' nested site navigation removed');
  assert(!after.includes('curriculum-nav.css'),name+' viewport-sized sidebar CSS removed');
  assert(after.includes('aria-label="00차시 주제 바로가기"'));
  const topics=after.match(/<nav class="sw-review-topics curriculum-subnav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.equal((topics?.match(/<a /g)||[]).length,7,name+' all seven topic links retained');
  const code=s=>[...s.matchAll(/<pre\b[^>]*>([\s\S]*?)<\/pre>/g)].map(m=>m[1]);
  assert.deepEqual(code(after),code(before),name+' every teaching code block preserved');
 }
});
