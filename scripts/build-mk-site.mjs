// MK V3 has its OWN authored content and shell. SW source/assets are read-only dependencies.
import {mkdir,readdir,readFile,rm,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
const target=path.resolve('mk-dist');await rm(target,{recursive:true,force:true});await mkdir(target,{recursive:true});
async function copy(from,to){await mkdir(to,{recursive:true});for(const e of await readdir(from,{withFileTypes:true})){if(e.isDirectory())await copy(path.join(from,e.name),path.join(to,e.name));else if(e.isFile())await copyFile(path.join(from,e.name),path.join(to,e.name));}}
await copy('mk/src',target);await copy('mk/content',path.join(target,'content'));await copy('mk/runtime',path.join(target,'runtime'));
await mkdir(path.join(target,'assets'),{recursive:true});
await copyFile('public/pandas-data-lab/assets/englishmath-logo.png',path.join(target,'assets/englishmath-logo.png'));
await copyFile('public/pandas-data-lab/student-config.json',path.join(target,'student-config.json'));
await copyFile('public/pandas-data-lab/student-session.js',path.join(target,'student-session.js'));
await build({entryPoints:['mk/grade1-cloud.js'],outfile:path.join(target,'student-cloud.bundle.js'),bundle:true,minify:true,format:'esm',platform:'browser',target:['es2022'],legalComments:'eof'});
// Existing bookmarks keep their address while opening the corresponding MK page.
const aliases=['student-room','python-review','list-tuple-dictionary','binary','binary-color','radians','four-turtles','graphics-gallery','math-function-graphs','physics-explanation','simulation','mastery','questions-supplement','lesson01-guide','first-analysis','step-by-step','textbook-classroom','textbook-guide','teacher-10','kosis-project'];
for(const alias of aliases)await copyFile(path.join(target,'index.html'),path.join(target,alias+'.html'));
const activities=JSON.parse(await readFile('mk/content/activities.json','utf8'));await mkdir(path.join(target,'downloads'),{recursive:true});
for(const a of activities){await writeFile(path.join(target,'downloads',a.id+'.py'),a.code);if(a.stdin)await writeFile(path.join(target,'downloads',a.id+'-input.txt'),a.stdin);}
await writeFile(path.join(target,'downloads','inquiry-report.txt'),'탐구 주제:\n실행 전 예상:\n바꾼 조건:\n변경 전 코드:\n변경 후 코드:\n입력과 실행 결과:\n결과가 달라진 이유:\n다음 질문:\n');
await writeFile(path.join(target,'downloads','study-checklist.txt'),'고1 · 2026학년도 정보 / Python 기말 학습 점검\n\n□ 리스트 수정·append·insert·remove·del\n□ 다섯 슬라이싱·sort·reverse·탐색\n□ Turtle 이동·좌표·반복\n□ matplotlib 선·막대·산점도·수학 그래프\n□ 조건·반복·문자열\n□ 콤마 print와 f-string·sep·end\n□ 가로·세로 구구단·중첩 반복·별 찍기\n□ 결과 예측 → 실행 → 이유 설명\n\nB~D 탐구·물리·고급 그래픽·격자 문제는 선택 심화입니다.\n실제 평가 범위는 선생님 안내를 확인하세요.\n');
await writeFile(path.join(target,'mk-build-info.json'),JSON.stringify({site:'mk.englishmath.kr',from:'englishmath75/pico-lab-classroom',source:'mk/src + mk/content',course:'mk-info-2026-v3',version:'3.0.0',academicYears:[2026,2027],commit:process.env.VERCEL_GIT_COMMIT_SHA||process.env.GITHUB_SHA||null,activityCount:activities.length,questionCount:40,codeupCount:10,sharedFirebaseProject:'englishmath-python-classroom'},null,2));
console.log(`MK V3 built: ${activities.length} activities, 10 units, 40 review questions; SW files unchanged.`);
