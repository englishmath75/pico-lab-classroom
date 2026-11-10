import exercises from '../exercises.json' with {type:'json'};
export {exercises};
const seq=n=>Array.from({length:n},(_,i)=>String(i+1).padStart(2,'0'));
export const units=['SW01','SW03','SW04'];
export const legacyIds=['lesson-00',...seq(10).map(n=>'lesson-'+n),...seq(10).map(n=>'scratch-'+n),...'abcd'.split('').map(n=>'inquiry-'+n)];
export const newIds=[...seq(10).map(n=>'sw2-lesson-'+n+'-state'),'sw2-inquiry-d-state','sw2-kosis','sw2-review','sw2-report','sw2-basics','sw2-binary','sw2-first-analysis','sw2-simulation','sw2-free-code','sw2-free-state',...seq(10).flatMap(n=>['sw2-archive-'+n,'sw2-archive2-'+n]),...seq(18).map(n=>'sw2-mastery-'+n),...units.flatMap(n=>['sw2-datalab-'+n+'-code','sw2-datalab-'+n+'-state'])];
export const activityIds=[...legacyIds,...newIds,...exercises.map(e=>e.id)];
const allowed=new Set(activityIds);
export const validActivity=id=>typeof id==='string'&&allowed.has(id);
export const structured=id=>id.startsWith('sw3-2026-g2-')||newIds.includes(id)&&!id.endsWith('-code');
export function titleFor(id){
 if(id.startsWith("sw3-2026-g2-"))return exercises.find(e=>e.id===id)?.title||id;
 const n=id.match(/(?:lesson|archive2?|mastery)-(\d\d)/)?.[1];
 if(id.startsWith('lesson-'))return Number(n)+'차시 코드';
 if(id.startsWith('sw2-lesson-'))return Number(n)+'차시 예측·단계·확인 문제';
 if(id.startsWith('scratch-'))return '자유 실습 '+id.slice(-2);
 if(id.startsWith('inquiry-'))return '탐구 '+id.slice(-1).toUpperCase();
 if(id.startsWith('sw2-datalab-'))return '데이터 시각화 '+id.split('-')[2]+' '+(id.endsWith('-code')?'코드':'예측·설명');
 if(id.startsWith('sw2-archive2-'))return '이전 통합 예제 '+Number(n);
 if(id.startsWith('sw2-archive-'))return '이전 차시 예제 '+Number(n);
 if(id.startsWith('sw2-mastery-'))return '기초 다지기 '+Number(n);
 return ({'sw2-inquiry-d-state':'네 마리 거북이 설명·자기 점검','sw2-kosis':'KOSIS 인구 탐구 보고서','sw2-review':'복습 답안·오답','sw2-report':'SW 탐구 보고서','sw2-basics':'Python 핵심 복습 답안','sw2-binary':'진법 표현 답안','sw2-first-analysis':'전체 과정 해석','sw2-simulation':'생물 다양성 모의실험','sw2-free-code':'자료 연결 자유 실습','sw2-free-state':'자유 실습 입력·자료'})[id]||id;
}
const frame=(label,file,storageMode='none',ids=[])=>({label,file,kind:'frame',storageMode,activityIds:ids,aliases:[file],mount:'legacy-frame',dispose:'release-frame'});
export const routes={
 exercise:{label:"Python 통합 실습",kind:"exercise",storageMode:"mixed",activityIds:[],aliases:[],mount:"exercise",dispose:"engine"},
 home:frame('01. 수업 안내','index.html'),
 'pandas-intro':frame('판다스 첫 수업 · Series','pandas-intro.html'),
 data:frame('03. 실습 자료','index.html','mixed',['sw2-free-code','sw2-free-state']),
 exam:frame('04. 복습 문제','index.html','answers',['sw2-review']),
 report:frame('05. 탐구 보고서','index.html','report',['sw2-report']),
 lab:frame('자료 연결 자유 실습','index.html','code',['sw2-free-code','sw2-free-state']),
 examples:frame('이전 차시 예제','index.html','mixed',seq(10).map(n=>'sw2-archive-'+n)),
 'final-course':frame('이전 통합 예제','index.html','mixed',seq(10).map(n=>'sw2-archive2-'+n)),
 lesson:frame('02. 차시별 실습','step-by-step.html','mixed',seq(10).flatMap(n=>['lesson-'+n,'sw2-lesson-'+n+'-state'])),
 'python-review':frame('00. Python 핵심 복습','python-review.html','answers',['sw2-basics']),
 'questions-supplement':frame('B. 진법 표현','questions-supplement.html','answers',['sw2-binary']),
 'first-analysis':frame('전체 과정 따라 하기','first-analysis.html','reflection',['sw2-first-analysis']),
 mastery:frame('기초 다지기','mastery.html','mixed',seq(18).map(n=>'sw2-mastery-'+n)),
 simulation:frame('생물 다양성 모의실험','simulation.html','mixed',['sw2-simulation','sw2-free-code','sw2-free-state']),
 avatar:frame('AI 표정 아바타 실험실','ai-avatar.html'),
 'avatar-notices':frame('아바타 공개 SW 안내','ai-avatar-notices.html'),
 ...Object.fromEntries(['lesson01-guide','list-tuple-dictionary','radians','textbook-classroom','textbook-guide','math-function-graphs','physics-explanation','graphics-gallery','teacher-10','video-player'].map(id=>[id,frame(id,id+'.html')])),
 'four-turtles':frame('D. 네 마리 거북이','four-turtles.html','mixed',['inquiry-d','sw2-inquiry-d-state']),
 'kosis-project':frame('KOSIS 인구 탐구','kosis-project.html','report',['sw2-kosis']),
 practice:{label:'자유 Python 실습실',kind:'practice',storageMode:'code',activityIds:legacyIds,aliases:['student-room.html'],mount:'practice',dispose:'engine'},
 library:{label:'내 학습 보관함',kind:'library',storageMode:'none',activityIds:[],aliases:['student-room.html?panel=library'],mount:'library',dispose:'generation'},
 teacher:{label:'교사용 관리실',kind:'teacher',storageMode:'none',activityIds:[],aliases:['student-room.html?panel=teacher'],mount:'teacher',dispose:'generation'},
 'data-lab':{label:'데이터 시각화 실험실',kind:'datalab',storageMode:'mixed',activityIds:units.flatMap(n=>['sw2-datalab-'+n+'-code','sw2-datalab-'+n+'-state']),aliases:['data-lab'],mount:'datalab',dispose:'engine'}
};
const aliases=Object.fromEntries(Object.entries(routes).filter(([,r])=>r.file&&r.file!=='index.html').map(([id,r])=>[r.file,id]));
export function resolveRoute(input,base='https://sw.englishmath.kr/'){
 const u=new URL(input,base);if(u.origin!==new URL(base).origin)return null;
 const name=u.pathname.split('/').filter(Boolean).pop()||'index.html';
 let page=u.searchParams.get('page')||aliases[name]||(name==='student-room.html'?(u.searchParams.get('panel')==='library'?'library':u.searchParams.get('panel')==='teacher'?'teacher':'practice'):name==='data-lab'||u.pathname.endsWith('/data-lab/index.html')?'data-lab':name==='index.html'?'home':null);
 if(page==='review')page='python-review';
 if(!routes[page])return null;
 const q=new URLSearchParams({page});
 if(page==='exercise'){const id=u.searchParams.get('exercise');if(!exercises.some(e=>e.id===id))return null;q.set('exercise',id);}
 if(page==='lesson')q.set('lesson',String(Math.max(1,Math.min(10,Number(u.searchParams.get('lesson'))||1))));
 if(page==='data-lab')q.set('unit',units.includes(u.searchParams.get('unit'))?u.searchParams.get('unit'):'SW01');
 if(page==='practice'){const id=u.searchParams.get('workspace')||u.searchParams.get('id');q.set('workspace',validActivity(id)&&!structured(id)?id:'scratch-01');}
 if(page==='video-player'){for(const key of ['lesson','episode','layout','embed']){const value=u.searchParams.get(key);if(/^[a-zA-Z0-9-]{1,50}$/.test(value||''))q.set(key,value);}}
 const hash=/^#[\w-]{1,80}$/.test(u.hash)?u.hash:'';
 return {id:page,...routes[page],params:Object.fromEntries(q),hash,url:'/?'+q+hash};
}
export function routeForActivity(id){
 if(id.startsWith("sw3-2026-g2-"))return "/?page=exercise&exercise="+id;
 if(id==='inquiry-d')return '/?page=four-turtles';
 // Code records are also authored in the standalone editor (with a custom
 // title). Resume that exact workspace; lesson answers retain their course view.
 if(/^lesson-(?:0[0-9]|10)$/.test(id))return '/?page=practice&workspace='+id;
 if(/^sw2-lesson-\d\d-state$/.test(id))return '/?page=lesson&lesson='+Math.max(1,Number(id.match(/\d\d/)[0]));
 if(id.startsWith('sw2-datalab-'))return '/?page=data-lab&unit='+id.split('-')[2];
 const page=({'sw2-inquiry-d-state':'four-turtles','sw2-kosis':'kosis-project','sw2-review':'exam','sw2-report':'report','sw2-basics':'python-review','sw2-binary':'questions-supplement','sw2-first-analysis':'first-analysis','sw2-simulation':'simulation','sw2-free-code':'lab','sw2-free-state':'lab'})[id];
 if(page)return '/?page='+page;
 if(id.startsWith('sw2-archive2-'))return '/?page=final-course#unit-'+Number(id.slice(-2));
 if(id.startsWith('sw2-archive-'))return '/?page=examples#unit-'+Number(id.slice(-2));
 if(id.startsWith('sw2-mastery-'))return '/?page=mastery#unit-'+Number(id.slice(-2));
 return '/?page=practice&workspace='+encodeURIComponent(id);
}
