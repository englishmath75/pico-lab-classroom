/* Explicit audited source groups. Inventory contains outputs and shell commands too;
   only these source positions enter the executable registry. IDs remain stable. */
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {transform as compileTS} from 'esbuild';
const input='sw/evidence/integration-20261107/inventory.json';const inventory=JSON.parse(await readFile(input,'utf8'));
const byId=Object.fromEntries(inventory.map(r=>[r.id,r]));
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>'SWX'+String(a+i).padStart(4,'0'));
const selected=[...range(5,10),...range(12,17),...range(20,22),...range(38,45),'SWX0047','SWX0052','SWX0054','SWX0055','SWX0056',...range(57,58),...range(60,73),'SWX0075','SWX0076','SWX0078','SWX0080',...range(96,132),...range(133,142),...range(158,185),'SWX0188'];
const pageNames={'app.js':'index.html','final-classroom.js':'index.html','mastery.js':'mastery.html'};
const catalog=[];
const sha=s=>createHash('sha256').update(s).digest('hex');
const oldData=JSON.parse((await readFile('public/pandas-data-lab/app.js','utf8')).split('const DATA=')[1].split('\n')[0].replace(/;\s*$/,''));
let festival='';
for(const id of selected){
 const r=byId[id];let code=r.originalCode,context='선생님 코드를 수정해 실행하고, 한 줄씩 상태 변화를 확인하세요.';
 if(+id.slice(3)>=5&&+id.slice(3)<=10){festival+=code+'\n';code=festival;context='이 단계까지 필요한 앞 단계 코드를 함께 넣었습니다. 각 실행은 새 Python 공간입니다.';}
 if(['SWX0013','SWX0014','SWX0015','SWX0020'].includes(id))code='import turtle\n'+code;
 if(id==='SWX0016')code='import turtle\npen1=turtle.Turtle()\npen2=turtle.Turtle()\n'+code;
 if(id==='SWX0017')code='import turtle\npen=turtle.Turtle()\npen2=turtle.Turtle()\nx,y=60,40\n'+code;
 if(['SWX0039','SWX0041'].includes(id))code=byId.SWX0038.originalCode+'\n'+code;
 if(id==='SWX0040')code='import pandas as pd\n'+code;
 if(['SWX0042','SWX0043'].includes(id))code='import pandas as pd\n'+byId.SWX0040.originalCode+'\n'+code;
 if(id==='SWX0056')code='x, y = 0, 0\nvx, vy = 6, -3\n'+code;
 if(r.source.includes('graphics-original')){code='# 웹 수업: 원본 Python 계산을 90프레임까지 기록합니다.\n# 네온 파티클은 중앙 클릭 1회를 수업 입력으로 사용합니다.\nimport classroom_graphics\nclassroom_graphics.set_frame_limit(90)\n'+code;context='원본의 수학·물리 계산을 Python으로 실행합니다. PC GUI 대신 수업용 Canvas 호환 기능을 사용하고, 90프레임을 기록·재생합니다. after()·tick()의 간격을 수업 시계에 누적해 계산하며, 실제 대기 없이 해당 시간의 Python 좌표를 기록합니다. 전체 Tkinter·pygame API를 지원하는 환경은 아닙니다.';}
 let page=r.source.split('/').pop();page=pageNames[page]||page;
 if(r.source.includes('graphics-original'))page='graphics-gallery.html';
 if(r.kind==='download'&&!r.source.includes('graphics-original'))page='python-review.html';
 if(id==='SWX0170'){code=code.replace("df.describe(numeric_only=True)","df.select_dtypes(include='number').describe()");context='원문은 그대로 보존했습니다. describe()에는 numeric_only 인수가 없어, 실행용 예제는 숫자 열을 먼저 선택하도록 문법을 보완했습니다.';}
 if(code.includes('COURSE_CSV')){const dataset=code.includes('population_thousand')?'population':'sports';code='# 이 예제에 필요한 수업용 가상 CSV 자료입니다.\nCOURSE_CSV = '+JSON.stringify(oldData[dataset].csv)+'\n\n'+code;context='교재의 가상 CSV를 함께 제공합니다. 아래 준비 자료를 읽고 코드를 실행하세요.';}
 const packages=['numpy','pandas','matplotlib'].filter(p=>new RegExp('(?:import |from )'+p).test(code));
 const files={};
 for(const filename of [...code.matchAll(/['"]([\w.-]+\.csv)['"]/g)].map(m=>m[1])){
  for(const dir of ['public/pandas-data-lab/data','public/pandas-data-lab/first-analysis','public/pandas-data-lab/datasets'])try{files[filename]=await readFile(dir+'/'+filename,'utf8');break;}catch{}
 }
 const entry={id:'sw3-2026-g2-'+id.toLowerCase(),sourceId:id,pageId:page.replace('.html',''),title:({SWX0125:'네온 파티클 · 입자의 움직임',SWX0126:'오로라 · 파동과 색의 변화',SWX0127:'워프 터널 · 원근감과 속도',SWX0128:'로렌츠 · 나비 모양의 궤적'}[id]||r.title||page).slice(0,65),source:r.source,sourceLine:r.line,section:r.section||null,originalCode:r.originalCode,teacherCode:code,teacherCodeVersion:sha(code).slice(0,12),context,runtime:'pyodide-0.28.3',packages,files,assets:Object.entries(files).map(([name,text])=>({name,sha256:sha(text)})),defaultInput:'',outputKinds:['text','state',...(code.includes('turtle')?['turtle']:[]),...(code.includes('pandas')?['table']:[]),...(code.includes('matplotlib')?['figure']:[]),...(code.includes('classroom_graphics')?['animation']:[])],trace:{mode:code.includes('classroom_graphics')?'bounded-animation':'execution-boundary'},persistenceVersion:1,autoRun:'visible-once',expected:{status:'NOT_RUN'}};
 catalog.push(entry);r.registrationId=entry.id;r.transition='REGISTERED_NOT_VERIFIED';r.url='https://sw.englishmath.kr/?page=exercise&exercise='+entry.id;
}
// Course append fragments require all preceding steps, not isolated execution.
const course=JSON.parse((await readFile('public/pandas-data-lab/course-data.js','utf8')).split('window.COURSE_LESSONS = ')[1].replace(/;\s*$/,''));
for(const [i,l] of course.entries()){
 let code='';for(const [j,step] of l.steps.entries()){
  code+=step.append+'\n';const files={};try{files[l.dataset]=await readFile('public/pandas-data-lab/datasets/'+l.dataset,'utf8');}catch{}
  catalog.push({id:`sw3-2026-g2-lesson-${i+1}-step-${j+1}`,pageId:'step-by-step',lesson:i+1,step:j+1,title:`${i+1}차시 ${j+1}단계 · ${step.title}`,source:'public/pandas-data-lab/course-data.js',originalCode:step.append,teacherCode:code,teacherCodeVersion:sha(code).slice(0,12),context:step.guide,runtime:'pyodide-0.28.3',packages:['pandas'],files,assets:Object.keys(files),defaultInput:'',outputKinds:['text','state','table',...(step.plot?['figure']:[])],trace:{mode:'execution-boundary'},persistenceVersion:1,autoRun:'visible-once',expected:{description:step.expected,status:'NOT_RUN'}});
 }
}
// Dynamic Python examples captured from the unchanged classroom pages.
const dynamic=JSON.parse(await readFile('sw/dynamic-exercises.json','utf8'));
for(const row of dynamic){
 let code=row.code,files={},title='',context='';
 if(row.pageId==='kosis-project'){
  title='KOSIS 분석 연습 · 가상 CSV로 준비';
  files['population_clean.csv']='year,population\n2020,123456\n2021,122900\n2022,121350\n2023,120700\n2024,119800\n';
  code=code.replace('KOSIS Population Trend - Student Analysis','Practice population data - replace with your CSV');
  context='처음에는 본문에 제시된 가상 수치로 흐름을 연습합니다. 실제 KOSIS 통계가 아닙니다. 준비한 실제 population_clean.csv를 자료 업로드에서 선택한 뒤 다시 실행하고 출처를 기록하세요.';
 }else if(row.pageId==='simulation'){
  title='모의실험 결과를 Python으로 분석';code='COURSE_CSV = '+JSON.stringify(row.csv)+'\n'+code;
  context='기본 정책의 가상 실험 결과입니다. 정책을 바꾼 최신 CSV는 기존 실험의 자료 연결 버튼으로 자유 실습에 전달할 수 있습니다.';
 }else{
  title='가상 표정 점수로 조건문 실습';context='가상 점수 세 개를 직접 수정하는 실습입니다. 카메라 영상·실측값을 이 계정 저장 실습으로 자동 전달하지 않습니다.';
 }
 catalog.push({id:'sw3-2026-g2-'+row.pageId+'-python',pageId:row.pageId==='avatar'?'ai-avatar':row.pageId,title,source:'public/pandas-data-lab/'+(row.pageId==='avatar'?'ai-avatar':row.pageId)+'.html',sourceSelector:row.selector,originalCode:row.code,teacherCode:code,teacherCodeVersion:sha(code).slice(0,12),context,runtime:'pyodide-0.28.3',packages:row.pageId==='avatar'?[]:['pandas','matplotlib'],files,assets:Object.keys(files),defaultInput:'',outputKinds:row.pageId==='avatar'?['text','state']:['text','state','table','figure'],trace:{mode:'execution-boundary'},persistenceVersion:1,autoRun:'visible-once',expected:{status:'NOT_RUN'}});
}
// Each visual-lab example also has an independent permanent practice record.
const programSource=await compileTS(await readFile('sw/datalab/lib/data-lab-program.ts','utf8'),{loader:'ts',format:'esm'});
const {buildDataLabProgram}=await import('data:text/javascript;base64,'+Buffer.from(programSource.code).toString('base64'));
for(const l of JSON.parse(await readFile('sw/datalab/content/sw-visual-lessons.json','utf8')))for(const [i,e] of l.examples.entries()){
 const code=buildDataLabProgram(l.csv,e.code,l.id);
 catalog.push({id:'sw3-2026-g2-datalab-'+l.id.toLowerCase()+'-'+(i+1),pageId:'data-lab',title:l.title+' · '+e.title,source:'sw/datalab/content/sw-visual-lessons.json',sourceSelector:l.id+'/examples/'+i,originalCode:e.code,teacherCode:code,teacherCodeVersion:sha(code).slice(0,12),context:l.concept,runtime:'pyodide-0.28.3',packages:['pandas'],files:{},assets:[],defaultInput:'',outputKinds:['text','state','table'],trace:{mode:'execution-boundary'},persistenceVersion:1,autoRun:'visible-once',expected:{status:'NOT_RUN'}});
}
for(const e of catalog){e.objective=e.context;e.trace.profile=e.trace.mode==='bounded-animation'?'90-frames-up-to-180':'20000-events-64MiB';}
await writeFile('sw/exercises.json',JSON.stringify(catalog,null,2));await writeFile(input,JSON.stringify(inventory,null,2));console.log('Registered',catalog.length,'explicit exercises (verification pending)');
