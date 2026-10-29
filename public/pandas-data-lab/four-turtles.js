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
    $(`step${j}`).textContent=!op?'아직 반복문을 실행하지 않았습니다.':op.kind==='skip'?'조건이 거짓 → 이번 반복에서는 이동하지 않고 마지막 위치 유지':op.kind==='lift'?'이번 좌표는 표시 범위 밖 → 이동하지 않고 펜 들기':'이 객체만 새 좌표로 이동 → 다음 점을 그릴 준비';
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

const editor=$('studentCode'),reason=$('studentReason'),key='englishmath-inquiry-c-four-turtles-v1',reasonKey=key+'-reason';
let saved=false;
try{const draft=localStorage.getItem(key);if(draft!==null){editor.value=draft;saved=true;}reason.value=localStorage.getItem(reasonKey)||'';}catch{}
$('saveStatus').textContent=saved?'이 브라우저에 저장한 답안을 불러왔습니다.':'답안을 입력하면 이 브라우저에 자동 저장됩니다.';
function saveDraft(){try{localStorage.setItem(key,editor.value);localStorage.setItem(reasonKey,reason.value);$('saveStatus').textContent='이 브라우저에 저장했습니다. 다른 PC로 옮길 때는 내 답안 .py를 내려받으세요.';}catch{$('saveStatus').textContent='브라우저 저장을 사용할 수 없습니다. 내 답안 .py로 내려받아 보관하세요.';}}
editor.addEventListener('input',saveDraft);reason.addEventListener('input',saveDraft);
editor.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();const start=editor.selectionStart,end=editor.selectionEnd;editor.setRangeText('    ',start,end,'end');saveDraft();}});
$('saveDraft').addEventListener('click',saveDraft);
function downloadText(text,name){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('downloadDraft').addEventListener('click',()=>{if(!editor.value.trim()){$('saveStatus').textContent='먼저 답안을 작성해 주세요.';editor.focus();return;}downloadText(editor.value+(reason.value.trim()?'\n\n# 객체를 여러 개 만드는 이유\n'+reason.value.split('\n').map(line=>'# '+line).join('\n')+'\n':''),'my_four_turtles.py');$('saveStatus').textContent='내 답안 다운로드를 요청했습니다. 내려받은 파일을 VS Code에서 실행하세요.';});
async function copyCode(text,status){try{await navigator.clipboard.writeText(text);$(status).textContent='코드를 복사했습니다. VS Code의 .py 파일에 붙여 넣으세요.';}catch{$(status).textContent='자동 복사가 제한되었습니다. 코드 영역을 선택한 뒤 Ctrl+C로 복사하세요.';}}
$('copyDraft').addEventListener('click',()=>copyCode(editor.value,'saveStatus'));
$('copyAnswer').addEventListener('click',()=>copyCode($('answerCode').textContent,'answerStatus'));
document.querySelectorAll('[data-copy-code]').forEach(button=>button.addEventListener('click',()=>copyCode($(button.dataset.copyCode).textContent,button.dataset.copyStatus)));
$('expandOriginal').addEventListener('click',()=>{const expanded=$('expandOriginal').getAttribute('aria-expanded')!=='true';document.querySelector('.original-block').classList.toggle('expanded',expanded);$('expandOriginal').setAttribute('aria-expanded',String(expanded));$('expandOriginal').textContent=expanded?'원본 코드 접어 보기':'원본 코드 전체 펼치기';});
function loadOriginal(){editor.value=$('originalCode').textContent;saveDraft();$('loadConfirm').hidden=true;location.hash='practice';editor.focus();}
$('loadOriginal').addEventListener('click',()=>{if(editor.value.trim()){$('loadConfirm').hidden=false;$('originalStatus').textContent='작성 중인 코드를 교체할지 확인해 주세요.';}else loadOriginal();});
$('confirmLoad').addEventListener('click',loadOriginal);
$('cancelLoad').addEventListener('click',()=>{$('loadConfirm').hidden=true;$('originalStatus').textContent='기존 답안을 유지했습니다.';});
document.querySelectorAll('[data-reveal-answer]').forEach(button=>button.addEventListener('click',()=>{
  if(!editor.value.trim()){$('saveStatus').textContent='완성하지 않아도 괜찮습니다. 먼저 떠오르는 코드부터 작성한 뒤 모범답안을 열어 보세요.';location.hash='practice';editor.focus();return;}
  $('answerPanel').hidden=false;document.querySelectorAll('[data-reveal-answer]').forEach(b=>b.setAttribute('aria-expanded','true'));location.hash='answerPanel';
}));
$('hideAnswer').addEventListener('click',()=>{$('answerPanel').hidden=true;document.querySelectorAll('[data-reveal-answer]').forEach(b=>b.setAttribute('aria-expanded','false'));location.hash='practice';});
$('selfCheck').addEventListener('change',()=>{const checked=[...$('selfCheck').querySelectorAll('input:checked')];const score=checked.reduce((sum,input)=>sum+Number(input.dataset.points),0);$('selfScore').textContent=`자기 점검 ${checked.length}/4개 · 참고 점수 ${score}/20점. 코드 정확성을 자동 채점한 점수가 아닙니다.`;});

const questions=[
 {q:'1. turtle.Turtle()을 호출하면 무엇이 만들어지나요?',a:['새 거북이 객체','새 파이썬 모듈','새 수학 함수'],correct:0,why:'turtle 모듈의 Turtle 클래스를 호출하여 새 거북이 객체(인스턴스)를 만듭니다. pen1은 그 객체를 가리키는 변수입니다.'},
 {q:'2. 네 그래프의 담당을 나누려고 네 객체를 만드는 이유는?',a:['변수 이름의 길이를 늘리려고','각 객체가 자기 위치·색상·펜 상태를 따로 기억하게 하려고','객체 생성만으로 코드를 병렬 실행하려고'],correct:1,why:'각 그래프를 맡은 객체가 자기 상태를 유지해야 다른 객체의 이동·색 변경에 영향을 받지 않습니다. 실행 순서는 별도로 구성하며, 객체 수만 늘린다고 자동으로 병렬 실행되지 않습니다.'},
 {q:'3. pen1 = turtle.Turtle() 다음에 pen2 = pen1을 쓰면?',a:['독립된 객체 두 개가 된다','pen1이 삭제된다','두 이름이 같은 객체를 가리킨다'],correct:2,why:'대입은 객체를 복제하지 않습니다. 독립된 두 번째 거북이는 pen2 = turtle.Turtle()로 새로 만들어야 합니다.'},
 {q:'4. pen2가 지수함수를 맡을 때 원본 블록에서 바꿀 부분은?',a:['수학식을 모두 새로 유도한다','색 이름만 바꾸면 된다','블록 안의 pen 명령을 pen2 명령으로 바꾼다'],correct:2,why:'pen.color, pen.penup, pen.goto, pen.pendown 등 명령을 받는 객체를 pen2로 통일합니다. 제공된 계산식·계수·반복 범위는 그대로 사용합니다.'}
];
questions.forEach((item,i)=>{const field=document.createElement('fieldset');field.className='knowledge-item';const legend=document.createElement('legend');legend.textContent=item.q;field.append(legend);item.a.forEach((text,j)=>{const label=document.createElement('label'),input=document.createElement('input');input.type='radio';input.name=`knowledge${i}`;input.value=j;label.append(input,document.createTextNode(` ${text}`));field.append(label);});const feedback=document.createElement('p');feedback.className='knowledge-feedback';feedback.id=`feedback${i}`;feedback.hidden=true;field.append(feedback);$('knowledgeItems').append(field);});
$('knowledgeForm').addEventListener('submit',event=>{event.preventDefault();let score=0,answered=0;questions.forEach((item,i)=>{const selected=$('knowledgeForm').querySelector(`input[name="knowledge${i}"]:checked`),correct=selected&&Number(selected.value)===item.correct;answered+=Boolean(selected);score+=Boolean(correct);const feedback=$(`feedback${i}`);feedback.hidden=false;feedback.textContent=`${selected?(correct?'정답입니다.':'다시 살펴보세요.'):'아직 답을 고르지 않았습니다.'} 정답: ${item.a[item.correct]}. ${item.why}`;});$('knowledgeScore').textContent=`4문항 중 ${score}문항 정답 · ${answered}문항 응답. 주관식 20점과 별도의 개념 확인입니다.`;});
$('knowledgeForm').addEventListener('reset',()=>{questions.forEach((_,i)=>$(`feedback${i}`).hidden=true);$('knowledgeScore').textContent='선택을 초기화했습니다.';});
function activeSection(){const hash=location.hash||'#goals';document.querySelectorAll('.topic-toc a').forEach(a=>{if(a.hash===hash||(hash==='#answerPanel'&&a.hash==='#answer'))a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
addEventListener('hashchange',activeSection);activeSection();
