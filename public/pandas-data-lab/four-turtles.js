import {PENS,buildFrames} from './four-turtles-model.js';
const $=id=>document.getElementById(id);
const frames=buildFrames();
let frame=401,playing=false,raf=0,previous=0,elapsed=0;
const short=value=>Math.abs(value)<.00005?'0.0000':value.toFixed(4);
function render(){
  const current=frames[frame];
  PENS.forEach((pen,j)=>{
    const state=current.pens[j],op=current.ops[j];
    $(`track${j}`).setAttribute('d',state.path);
    $(`marker${j}`).setAttribute('cx',state.X);
    $(`marker${j}`).setAttribute('cy',-state.Y);
    $(`marker${j}`).style.display=$('showMarkers').checked&&state.moves?'':'none';
    $(`penGroup${j}`).style.display=$(`visible${j}`).checked?'':'none';
    $(`coord${j}`).textContent=`위치 (${short(state.X)}, ${short(state.Y)}) · 이동 ${state.moves}회`;
    $(`step${j}`).textContent=!op?'아직 반복문을 실행하지 않았습니다.':op.kind==='skip'?'조건이 거짓 → 이번 반복에서는 이동하지 않고 마지막 위치 유지':op.kind==='lift'?`Y=${short(op.Y)}, abs(Y)>300 → penup(), 이동하지 않음`:`goto(${short(op.X)}, ${short(op.Y)}) → pendown()`;
  });
  $('axes').style.display=$('showAxes').checked?'':'none';
  $('frameRange').value=frame;
  $('frameOutput').textContent=`${frame} / 401`;
  $('frameStatus').textContent=frame===0?'준비 · 네 거북이 모두 (0, 0), 펜을 든 상태':`I = ${current.I} 실행 후 · S.update() ${frame}회${frame===401?' · 완료':''}`;
  $('sharedState').textContent=frame===0?'X, Y는 아직 계산 전입니다.':`반복 끝의 공통 변수: X = ${short(current.shared.X)}, Y = ${short(current.shared.Y)}. 이 값이 바뀌어도 각 거북이의 위치는 따로 유지됩니다.`;
  $('turtleGraph').setAttribute('aria-label',`${$('frameStatus').textContent}. cyan 다항함수, magenta 지수함수, yellow 로그함수, lime 원의 그래프.`);
  $('play').textContent=playing?'재생 중':frame===401?'처음부터 재생':'재생';
  $('play').disabled=playing;
  $('pause').disabled=!playing;
}
function stop(){playing=false;cancelAnimationFrame(raf);previous=0;elapsed=0;render();}
function tick(now){
  if(!playing)return;
  if(previous)elapsed+=Math.min(now-previous,250);
  previous=now;
  const interval=1000/Number($('speed').value);
  const steps=Math.floor(elapsed/interval);
  if(steps){frame=Math.min(401,frame+steps);elapsed-=steps*interval;render();}
  if(frame===401){stop();return;}
  raf=requestAnimationFrame(tick);
}
$('play').addEventListener('click',()=>{if(frame===401)frame=0;playing=true;previous=0;elapsed=0;render();raf=requestAnimationFrame(tick);});
$('pause').addEventListener('click',stop);
$('restart').addEventListener('click',()=>{stop();frame=0;render();});
$('nextFrame').addEventListener('click',()=>{stop();frame=Math.min(401,frame+1);render();});
$('finish').addEventListener('click',()=>{stop();frame=401;render();});
$('frameRange').addEventListener('input',()=>{const selected=Number($('frameRange').value);stop();frame=selected;render();});
document.querySelectorAll('.display-options input').forEach(input=>input.addEventListener('change',render));
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
render();

const editor=$('studentCode'),key='englishmath-inquiry-c-four-turtles-v1';
let saved=false;
try{const draft=localStorage.getItem(key);if(draft!==null){editor.value=draft;saved=true;}}catch{}
$('saveStatus').textContent=saved?'이 브라우저에 저장한 답안을 불러왔습니다.':'답안을 입력하면 이 브라우저에 자동 저장됩니다.';
function saveDraft(){try{localStorage.setItem(key,editor.value);$('saveStatus').textContent='이 브라우저에 저장했습니다. 다른 PC로 옮길 때는 내 답안 .py를 내려받으세요.';}catch{$('saveStatus').textContent='브라우저 저장을 사용할 수 없습니다. 내 답안 .py로 내려받아 보관하세요.';}}
editor.addEventListener('input',saveDraft);
editor.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();const start=editor.selectionStart,end=editor.selectionEnd;editor.setRangeText('    ',start,end,'end');saveDraft();}});
$('saveDraft').addEventListener('click',saveDraft);
function downloadText(text,name){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('downloadDraft').addEventListener('click',()=>{if(!editor.value.trim()){$('saveStatus').textContent='먼저 답안을 작성해 주세요.';editor.focus();return;}downloadText(editor.value,'my_four_turtles.py');$('saveStatus').textContent='내 답안 다운로드를 요청했습니다. 내려받은 파일을 VS Code에서 실행하세요.';});
async function copyCode(text,status){try{await navigator.clipboard.writeText(text);$(status).textContent='코드를 복사했습니다. VS Code의 .py 파일에 붙여 넣으세요.';}catch{$(status).textContent='자동 복사가 제한되었습니다. 코드 영역을 선택한 뒤 Ctrl+C로 복사하세요.';}}
$('copyDraft').addEventListener('click',()=>copyCode(editor.value,'saveStatus'));
$('copyAnswer').addEventListener('click',()=>copyCode($('answerCode').textContent,'answerStatus'));
document.querySelectorAll('[data-reveal-answer]').forEach(button=>button.addEventListener('click',()=>{
  if(!editor.value.trim()){$('saveStatus').textContent='완성하지 않아도 괜찮습니다. 먼저 떠오르는 코드부터 작성한 뒤 모범답안을 열어 보세요.';location.hash='practice';editor.focus();return;}
  $('answerPanel').hidden=false;button.setAttribute('aria-expanded','true');location.hash='answerPanel';
}));
$('hideAnswer').addEventListener('click',()=>{$('answerPanel').hidden=true;document.querySelectorAll('[data-reveal-answer]').forEach(b=>b.setAttribute('aria-expanded','false'));location.hash='practice';});
$('selfCheck').addEventListener('change',()=>{const n=$('selfCheck').querySelectorAll('input:checked').length;$('selfScore').textContent=`자기 점검 ${n}/5개 · 참고 점수 ${n*4}/20점. 코드의 실행·정확성을 자동 채점한 점수가 아닙니다.`;});

const questions=[
  {q:'1. 네 개의 Turtle() 호출이 필요한 이유는?',a:['색상 문자열을 네 번 출력하려고','각 그래프의 위치·색상·펜 상태를 독립적으로 유지하려고','네 개의 CPU 스레드를 만들려고'],correct:1,why:'Turtle()을 호출할 때마다 별개의 거북이 객체가 생깁니다. X, Y 변수를 재사용하더라도 pen1~pen4가 기억하는 위치와 펜 상태는 서로 다릅니다. 스레드를 만드는 코드는 아닙니다.'},
  {q:'2. range(401)에서 I의 마지막 값과 반복 횟수는?',a:['401, 401회','400, 400회','400, 401회'],correct:2,why:'range의 끝값은 포함하지 않습니다. 0부터 400까지이므로 마지막 I는 400, 반복 횟수는 401회입니다. S.update()도 공통 반복문 끝에서 401회 호출됩니다.'},
  {q:'3. I=210일 때 이번 반복에서 pen2는 어떻게 되나요?',a:['이동하지 않고 직전 위치를 유지한다','원점으로 돌아간다','X=60으로 이동한다'],correct:0,why:'I < 210이 거짓이므로 pen2 블록 전체를 건너뜁니다. 마지막으로 실행한 I=209에서 X=59였습니다. 조건을 건너뛰어도 거북이가 삭제되거나 위치가 초기화되지 않습니다.'},
  {q:'4. I=0에서 로그함수의 X를 I+1로 만드는 이유는?',a:['X/10을 양수로 만들어 log의 정의역을 만족시키려고','색상을 yellow로 바꾸려고','반복을 한 번 줄이려고'],correct:0,why:'I=0이면 X=1, X/10=0.1입니다. 실수 로그는 양수에서 정의되므로 이 값은 유효합니다. X=I로 바꾸면 첫 계산이 math.log(0)이 되어 ValueError가 납니다.'},
  {q:'5. 원을 그릴 때 T=math.radians(I)가 필요한 이유는?',a:['turtle.goto가 라디안만 받기 때문에','math.sin과 math.cos가 입력을 라디안으로 해석하기 때문에','I를 정수로 바꾸기 위해'],correct:1,why:'I는 0~360의 도 단위 각도입니다. math의 sin·cos는 라디안을 받으므로 먼저 변환합니다. goto는 각도가 아니라 X, Y 좌표를 받습니다.'},
  {q:'6. 첫 유효 좌표에서 goto() 다음에 pendown()을 쓰면?',a:['원점에서 첫 좌표까지 불필요한 선을 긋지 않는다','첫 좌표로 이동하지 않는다','모든 그래프가 지워진다'],correct:0,why:'처음에는 penup 상태입니다. goto로 첫 점까지 선 없이 이동한 뒤 pendown을 호출하면 다음 유효 점으로 이동할 때부터 선이 생깁니다. 범위를 벗어났다가 다시 들어오는 경우에도 같은 원리로 불필요한 연결을 막습니다.'}
];
questions.forEach((item,i)=>{const field=document.createElement('fieldset');field.className='knowledge-item';const legend=document.createElement('legend');legend.textContent=item.q;field.append(legend);item.a.forEach((text,j)=>{const label=document.createElement('label'),input=document.createElement('input');input.type='radio';input.name=`knowledge${i}`;input.value=j;label.append(input,document.createTextNode(` ${text}`));field.append(label);});const feedback=document.createElement('p');feedback.className='knowledge-feedback';feedback.id=`feedback${i}`;feedback.hidden=true;field.append(feedback);$('knowledgeItems').append(field);});
$('knowledgeForm').addEventListener('submit',event=>{event.preventDefault();let score=0,answered=0;questions.forEach((item,i)=>{const selected=$('knowledgeForm').querySelector(`input[name="knowledge${i}"]:checked`),correct=selected&&Number(selected.value)===item.correct;answered+=Boolean(selected);score+=Boolean(correct);const feedback=$(`feedback${i}`);feedback.hidden=false;feedback.textContent=`${selected?(correct?'정답입니다.':'다시 살펴보세요.'):'아직 답을 고르지 않았습니다.'} 정답: ${item.a[item.correct]}. ${item.why}`;});$('knowledgeScore').textContent=`6문항 중 ${score}문항 정답 · ${answered}문항 응답. 주관식 20점과 별도의 개념 확인입니다.`;});
$('knowledgeForm').addEventListener('reset',()=>{questions.forEach((_,i)=>$(`feedback${i}`).hidden=true);$('knowledgeScore').textContent='선택을 초기화했습니다.';});
function activeSection(){const hash=location.hash||'#goals';document.querySelectorAll('.topic-toc a').forEach(a=>{if(a.hash===hash||(hash==='#answerPanel'&&a.hash==='#execution'))a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
addEventListener('hashchange',activeSection);activeSection();
