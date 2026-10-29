import {TAU, angleModel, formatValue, piLabel, circlePoint, arcPoints, bendPoint} from './radians-model.js';

const $ = id => document.getElementById(id);
const points = values => values.map(p=>`${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' ');
const escapeHtml = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const line = (x1,y1,x2,y2,color,width=2,dash='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const text = (x,y,label,extra='') => `<text x="${x}" y="${y}" ${extra}>${label}</text>`;
const dot = (x,y,color,r=5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="white" stroke-width="2"/>`;
const colors = {purple:'#6732d4',coral:'#d6476a',teal:'#087e87',grid:'#e7dfed',ink:'#665576'};

// A physical-length string bends without changing its length; its final arc is exactly 1 radian.
let bend = 0, animation = 0;
function renderDefinition(progress) {
  bend = progress;
  const radius = Number($('radiusRange').value), R = 26*radius, cx = 225, cy = 220;
  const rope = Array.from({length:101},(_,i)=>bendPoint(i/100,progress,R,cx,cy));
  const end = rope[rope.length-1];
  const finished = progress === 1;
  $('definitionSvg').innerHTML = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="white" stroke="#d9cce8" stroke-width="2"/>`
    + line(cx,cy,cx+R,cy,colors.teal,5)
    + (finished ? line(cx,cy,end.x,end.y,'#ac94c6',2)+`<polyline points="${points(arcPoints(1,34,cx,cy))}" fill="none" stroke="${colors.purple}" stroke-width="2"/>` : '')
    + `<polyline points="${points(rope)}" fill="none" stroke="${colors.coral}" stroke-linecap="round" stroke-width="7"/>`
    + dot(cx,cy,colors.purple,4)+dot(cx+R,cy,colors.teal,5)+dot(end.x,end.y,colors.coral,6)
    + text(cx+R/2,cy+25,`r = ${radius} cm`,'text-anchor="middle"')
    + text(230,45,`코랄색 끈 길이 = ${radius} cm`,'text-anchor="middle"')
    + text(230,390,finished?'s = r → θ = 1 rad ≈ 57.2958°':'같은 길이의 끈을 구부려 원 둘레에 놓습니다.','text-anchor="middle"')
    + (finished?text(cx+40,cy-22,'1 rad'):'');
  $('definitionSvg').setAttribute('aria-label',finished?`반지름 ${radius}cm, 호의 길이 ${radius}cm, 중심각 1라디안`:`반지름과 같은 ${radius}cm 길이의 끈을 원 둘레에 놓는 과정`);
  $('radiusReadout').textContent=`${radius} cm`;
  $('definitionRatio').textContent=`${radius} cm ÷ ${radius} cm = 1 rad`;
}
function stopBend() { if(animation)cancelAnimationFrame(animation);animation=0;$('bendStart').textContent='끈을 호로 감아 보기'; }
$('bendStart').addEventListener('click',()=>{
  if(animation){stopBend();$('bendStatus').textContent='멈췄습니다. 버튼을 다시 누르면 처음부터 관찰합니다.';return;}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){renderDefinition(1);$('bendStatus').textContent='동작 줄이기 설정에 따라 완성 모습을 표시합니다. 호와 반지름의 길이가 같습니다.';return;}
  renderDefinition(0);
  $('bendStart').textContent='애니메이션 멈추기';
  $('bendStatus').textContent='끈의 길이는 그대로입니다. 완전히 감겼을 때 원의 호와 겹칩니다.';
  const start=performance.now();
  function frame(now){
    const t=Math.min(1,(now-start)/2200);
    renderDefinition(t*t*(3-2*t));
    if(t<1)animation=requestAnimationFrame(frame);
    else {stopBend();$('bendStatus').textContent='완료: s = r이므로 θ = s/r = 1 rad입니다.';}
  }
  animation=requestAnimationFrame(frame);
});
$('bendEnd').addEventListener('click',()=>{stopBend();renderDefinition(1);$('bendStatus').textContent='호의 길이와 반지름이 같습니다. 이 중심각이 1라디안입니다.';});
$('radiusRange').addEventListener('input',()=>{stopBend();renderDefinition(1);$('bendStatus').textContent='원의 크기를 바꿔도 s/r = 1이므로 중심각은 1라디안입니다.';});
renderDefinition(0);

function unitCircle(model) {
  const cx=220,cy=200,R=125;
  const p=circlePoint(model.radians,R,cx,cy);
  const arc=arcPoints(model.radians,R,cx,cy);
  const angleArc=arcPoints(model.radians,30,cx,cy);
  const shape=`${cx},${cy} ${points(arc)}`;
  const svg=`<polygon points="${shape}" fill="#f3e9fc"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${colors.grid}" stroke-width="2"/>`
    + line(55,cy,385,cy,'#c1b3cf',1.5)+line(cx,37,cx,363,'#c1b3cf',1.5)
    + text(390,cy+5,'x')+text(cx+8,36,'y')
    + text(cx+R,cy+22,'1','text-anchor="middle"')+text(cx-R,cy+22,'−1','text-anchor="middle"')
    + text(cx-14,cy-R+5,'1','text-anchor="end"')+text(cx-14,cy+R+5,'−1','text-anchor="end"')
    + line(cx,cy,cx+R,cy,colors.teal,3)
    + line(cx,cy,p.x,p.y,colors.teal,3)
    + line(cx,p.y,p.x,p.y,'#a590bd',1.5,'4 4')
    + line(p.x,cy,p.x,p.y,colors.purple,4)
    + line(cx,cy,p.x,cy,colors.teal,5)
    + `<polyline points="${points(arc)}" fill="none" stroke="${colors.coral}" stroke-width="6" stroke-linecap="round"/>`
    + `<polyline points="${points(angleArc)}" fill="none" stroke="${colors.purple}" stroke-width="2"/>`
    + dot(cx,cy,colors.ink,3)+dot(p.x,p.y,colors.purple,7)
    + text(220,22,`θ = ${model.degrees}° = ${piLabel(model.degrees)} rad`,'text-anchor="middle"')
    + text(220,389,`P = (${formatValue(model.cos,3)}, ${formatValue(model.sin,3)})`,'text-anchor="middle"');
  $('unitCircle').innerHTML=svg;
  $('unitCircle').setAttribute('aria-label',`${model.degrees}도. 점의 좌표 x ${formatValue(model.cos)}, y ${formatValue(model.sin)}. 호의 길이 ${formatValue(model.arc)}.`);
}
function trigGraph(model) {
  const left=48,right=515,top=56,bottom=294,mid=(top+bottom)/2,amp=(bottom-top)/2;
  const x=t=>left+(right-left)*t/TAU, y=v=>mid-v*amp;
  let svg='';
  for(const v of [-1,0,1])svg+=line(left,y(v),right,y(v),colors.grid,1)+text(left-12,y(v)+5,String(v),'text-anchor="end"');
  const ticks=[[0,'0','0°'],[Math.PI/2,'π/2','90°'],[Math.PI,'π','180°'],[Math.PI*1.5,'3π/2','270°'],[TAU,'2π','360°']];
  for(const [t,label,degrees] of ticks)svg+=line(x(t),top,x(t),bottom,colors.grid,1)+text(x(t),321,label,'text-anchor="middle"')+text(x(t),343,degrees,'text-anchor="middle" style="font-size:11px"');
  for(const [fn,color] of [[Math.sin,colors.purple],[Math.cos,colors.teal]]){
    const curve=Array.from({length:361},(_,i)=>({x:x(TAU*i/360),y:y(fn(TAU*i/360))}));
    svg+=`<polyline points="${points(curve)}" fill="none" stroke="${color}" stroke-width="3"/>`;
  }
  svg+=line(x(model.radians),top-12,x(model.radians),bottom+7,colors.coral,2,'5 4');
  svg+=dot(x(model.radians),y(model.sin),colors.purple,6)+dot(x(model.radians),y(model.cos),colors.teal,6);
  svg+=text(52,24,'sin θ','style="fill:#6732d4;font-weight:800"')+text(126,24,'cos θ','style="fill:#087e87;font-weight:800"')+text(510,24,`현재 ${model.degrees}°`,'text-anchor="end"')+text(282,368,'가로축: θ (rad) / 작은 글씨는 도 단위','text-anchor="middle" style="font-size:12px"');
  $('trigGraph').innerHTML=svg;
  $('trigGraph').setAttribute('aria-label',`0부터 2π까지 사인·코사인 그래프. 현재 ${model.degrees}도에서 sin ${formatValue(model.sin)}, cos ${formatValue(model.cos)}.`);
}
function updateAngle() {
  const degrees=Number($('angleRange').value), m=angleModel(degrees);
  $('angleReadout').textContent=`${degrees}°`;
  $('degreeValue').textContent=`${degrees}°`;
  $('piValue').textContent=`${piLabel(degrees)} rad`;
  $('radianValue').textContent=formatValue(m.radians);
  $('arcValue').textContent=formatValue(m.arc);
  $('sinValue').textContent=formatValue(m.sin);
  $('cosValue').textContent=formatValue(m.cos);
  $('radiusBar').style.width=`${100/TAU}%`;
  $('arcBar').style.width=`${degrees/360*100}%`;
  $('ratioText').textContent=`두 막대는 같은 눈금입니다. 호 ${formatValue(m.arc)} ÷ 반지름 1 = ${formatValue(m.radians)} rad. 호는 반지름의 약 ${formatValue(m.radians)}배입니다.`;
  $('pointText').textContent=`점의 가로 좌표는 cos θ = ${formatValue(m.cos)}, 세로 좌표는 sin θ = ${formatValue(m.sin)}입니다. ${degrees===360?'한 바퀴를 돌아 출발점에 왔지만, 따라간 호는 2π입니다.':degrees===0?'아직 움직이지 않아 따라간 호의 길이는 0입니다.':'그래프의 세로 점선은 이 각도에 해당합니다.'}`;
  document.querySelectorAll('[data-angle]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.angle)===degrees)));
  unitCircle(m);trigGraph(m);
}
$('angleRange').addEventListener('input',updateAngle);
document.querySelectorAll('[data-angle]').forEach(b=>b.addEventListener('click',()=>{$('angleRange').value=b.dataset.angle;updateAngle();}));
updateAngle();

const quiz=[
  {q:'라디안으로 나타낸 중심각 θ의 정의는 무엇인가요?',options:['반지름 ÷ 호의 길이','호의 길이 ÷ 반지름','현의 길이 ÷ 반지름'],answer:1,ex:'라디안은 원 둘레를 따라간 호의 길이 s를 반지름 r로 나눈 s/r입니다. 두 끝점을 곧게 잇는 현의 길이는 사용하지 않습니다.'},
  {q:'반지름 3cm인 원의 호 길이가 3cm입니다. 중심각은 몇 rad인가요? 숫자만 쓰세요.',answer:1,unit:'rad',ex:'θ = s/r = 3/3 = 1 rad입니다. 반지름과 호의 길이가 같은 경우가 바로 1라디안의 정의입니다. 1도라는 뜻은 아닙니다.'},
  {q:'원 반 바퀴, 즉 180°의 라디안 값은?',options:['1 rad','π rad','2π rad'],answer:1,ex:'반 바퀴의 호 길이는 πr입니다. θ = πr/r = π이므로 180° = π rad입니다. 한 바퀴 360°일 때 2π rad입니다.'},
  {q:'math.radians(30)의 결과에 가장 가까운 값은?',options:['0.523599','30.0','57.295780'],answer:0,ex:'30 × π/180 = π/6 ≈ 0.523599입니다. 57.295780은 1라디안을 도 단위로 바꾼 값에 가깝습니다.'},
  {q:'math.sin(30)의 30은 무엇을 뜻하나요?',options:['30도','30라디안','반지름 30'],answer:1,ex:'math.sin()은 입력을 라디안으로 해석합니다. 30°의 사인값을 원하면 math.sin(math.radians(30))처럼 먼저 변환해야 합니다. 코드는 실행되더라도 단위가 틀리면 의도와 다른 결과가 나옵니다.'},
  {q:'print(round(math.sin(math.radians(30)), 1))의 출력은?',options:['30.0','0.5','-1.0'],answer:1,ex:'30°를 π/6 rad로 바꾼 뒤 sin을 구하면 수학적으로 1/2입니다. 컴퓨터의 작은 계산 오차가 있어도 소수 첫째 자리로 반올림하면 0.5가 출력됩니다.'},
  {q:'단위원에서 90° 위치의 점은 (0, 1)입니다. cos(π/2)의 수학적 값은?',options:['0','1','-1'],answer:0,ex:'cos는 단위원 점의 가로 좌표입니다. 90°에서는 x = 0이므로 cos(π/2) = 0입니다. Python에서는 약 6.12e-17처럼 0에 매우 가까운 값이 나올 수 있습니다.'},
  {q:'각도 모드를 바꾸지 않은 Turtle에서 turtle.left(30)은?',options:['왼쪽으로 30도 회전','왼쪽으로 30라디안 회전','왼쪽으로 30만큼 직선 이동'],answer:0,ex:'Turtle 회전의 기본 단위는 도입니다. turtle.radians()로 각도 모드를 바꿨을 때만 이후 회전 입력을 라디안으로 받습니다. 직선 이동은 forward() 같은 명령으로 합니다.'},
  {q:'반지름 4cm, 호의 길이 6cm일 때 중심각은 몇 rad인가요? 소수로 쓰세요.',answer:1.5,unit:'rad',ex:'두 길이의 단위가 모두 cm이므로 θ = 6/4 = 1.5 rad입니다. 1.5도를 뜻하는 것이 아닙니다. 라디안은 호에 반지름 길이가 몇 번 들어가는지 나타냅니다.'},
  {q:'같은 중심각에서 반지름과 호의 길이가 모두 2배가 되면 라디안 값은?',options:['2배가 된다','절반이 된다','같다'],answer:2,ex:'(2s)/(2r) = s/r이므로 비율은 변하지 않습니다. 라디안은 원의 크기가 아닌 각도를 나타내는 값입니다.'},
  {q:'print(round(math.degrees(math.pi / 2)))의 출력은?',options:['90','1.570796','180'],answer:0,ex:'math.degrees()는 라디안을 도로 바꿉니다. (π/2) × 180/π = 90이므로 round() 결과는 정수 90입니다.'},
  {q:'0°와 360°에 대한 설명 중 옳은 것은?',options:['점의 위치와 따라간 호의 길이가 모두 같다','점의 위치는 같지만 따라간 호의 길이는 다르다','점의 위치가 서로 반대이다'],answer:1,ex:'360°는 한 바퀴 돌아 처음 위치로 온 것입니다. 점의 위치와 sin·cos 값은 0°일 때와 같지만, 출발점부터 따라간 호는 각각 0과 2πr입니다. 위치와 누적 회전량을 구별하세요.'}
];
$('quizItems').innerHTML=quiz.map((q,i)=>`<fieldset class="quiz-item"><legend>${i+1}. ${escapeHtml(q.q)}</legend>${q.options?q.options.map((option,j)=>`<label><input type="radio" name="q${i}" value="${j}"><span>${escapeHtml(option)}</span></label>`).join(''):`<label for="answer${i}">계산 결과 (${q.unit})</label><input id="answer${i}" name="q${i}" type="number" inputmode="decimal" step="any" autocomplete="off">`}<div id="feedback${i}" class="feedback" hidden></div></fieldset>`).join('');
$('quizForm').addEventListener('submit',event=>{
  event.preventDefault();let correct=0,answered=0;
  quiz.forEach((q,i)=>{
    const field=q.options?document.querySelector(`input[name="q${i}"]:checked`):$(`answer${i}`);
    const supplied=Boolean(field&&field.value.trim()!=='');
    const ok=supplied&&Math.abs(Number(field.value)-q.answer)<1e-9;
    if(supplied)answered++;if(ok)correct++;
    const feedback=$(`feedback${i}`);feedback.hidden=false;feedback.className=`feedback ${ok?'correct':'incorrect'}`;
    feedback.textContent=`${!supplied?'미응답':ok?'정답':'다시 생각해 보세요'} · 정답: ${q.options?q.options[q.answer]:q.answer+' '+q.unit}. ${q.ex}`;
  });
  $('quizScore').textContent=`12문항 중 ${correct}문항 정답 · ${answered}문항 응답. 각 문항 아래의 해설로 풀이를 확인하세요.`;
});
$('quizForm').addEventListener('reset',()=>{quiz.forEach((_,i)=>{$(`feedback${i}`).hidden=true;$(`feedback${i}`).textContent='';});$('quizScore').textContent='선택을 초기화했습니다. 다시 풀어 보세요.';});

document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
  const source=$(button.dataset.copy);
  try{await navigator.clipboard.writeText(source.textContent);button.textContent='복사됨';$('copyStatus').textContent='코드를 복사했습니다. VS Code의 Python 파일에 붙여 넣으세요.';setTimeout(()=>button.textContent='복사',2000);}
  catch{const selection=getSelection(),range=document.createRange();range.selectNodeContents(source);selection.removeAllRanges();selection.addRange(range);$('copyStatus').textContent='자동 복사가 제한되어 코드를 선택했습니다. Ctrl+C 또는 기기의 복사 메뉴를 사용하세요.';button.textContent='선택됨';}
}));
function updateContents(){const hash=location.hash||'#question';document.querySelectorAll('.topic-toc a').forEach(a=>{if(a.hash===hash)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
window.addEventListener('hashchange',updateContents);updateContents();
