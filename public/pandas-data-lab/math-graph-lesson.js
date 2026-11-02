(()=>{'use strict';
const $=id=>document.getElementById(id);
for(const button of document.querySelectorAll('[data-copy]'))button.addEventListener('click',async()=>{const id=button.getAttribute('data-copy');const text=$(id)?.textContent||'';const status=$(({turtleSource:'copyTurtleStatus',linearQuadSource:'copyLinearStatus',sinCosSource:'copyTrigStatus'})[id]);try{await navigator.clipboard.writeText(text);status.textContent='코드 복사 완료 · VS Code에 붙여 넣고 .py로 저장하세요.';}catch(e){const selection=window.getSelection();const range=document.createRange();range.selectNodeContents($(id));selection.removeAllRanges();selection.addRange(range);status.textContent='코드를 선택했습니다. Ctrl+C로 복사하세요.';}});
const crisp=c=>{const ctx=c.getContext('2d');return{ctx,w:c.width,h:c.height}};
const clear=(ctx,w,h)=>{ctx.fillStyle='#0e1b2c';ctx.fillRect(0,0,w,h);};
function axes(ctx,w,h,{xMin=-5,xMax=5,yMin=-5,yMax=5}={}){const pad={left:70,right:28,top:32,bottom:46},W=w-pad.left-pad.right,H=h-pad.top-pad.bottom;const tx=x=>pad.left+(x-xMin)/(xMax-xMin)*W,ty=y=>pad.top+(yMax-y)/(yMax-yMin)*H;ctx.strokeStyle='#294257';ctx.lineWidth=1;ctx.font='12px sans-serif';ctx.fillStyle='#9db6c4';for(let i=0;i<=8;i++){let x=xMin+(xMax-xMin)*i/8,px=tx(x);ctx.beginPath();ctx.moveTo(px,pad.top);ctx.lineTo(px,h-pad.bottom);ctx.stroke();ctx.fillText(Number(x.toFixed(2)).toString(),px-13,h-pad.bottom+17);}for(let j=0;j<=6;j++){let y=yMin+(yMax-yMin)*j/6,py=ty(y);ctx.beginPath();ctx.moveTo(pad.left,py);ctx.lineTo(w-pad.right,py);ctx.stroke();ctx.fillText(Number(y.toFixed(1)).toString(),5,py+4);}ctx.strokeStyle='#8baec5';ctx.lineWidth=1.7;if(xMin<=0&&xMax>=0){ctx.beginPath();ctx.moveTo(tx(0),pad.top);ctx.lineTo(tx(0),h-pad.bottom);ctx.stroke();}if(yMin<=0&&yMax>=0){ctx.beginPath();ctx.moveTo(pad.left,ty(0));ctx.lineTo(w-pad.right,ty(0));ctx.stroke();}ctx.fillStyle='#d5e6f0';ctx.font='bold 13px sans-serif';ctx.fillText('x',w-18,h-pad.bottom-7);ctx.fillText('y',pad.left+8,18);return{tx,ty};}
function path(ctx,pts,color,width=2.6){ctx.beginPath();let started=false;for(const p of pts){if(!p||!Number.isFinite(p[0])||!Number.isFinite(p[1])){started=false;continue;}if(!started){ctx.moveTo(p[0],p[1]);started=true}else ctx.lineTo(p[0],p[1]);}ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function turtle(){const {ctx,w,h}=crisp($('turtleGraph'));clear(ctx,w,h);const {tx,ty}=axes(ctx,w,h,{xMin:-330,xMax:330,yMin:-165,yMax:165});ctx.save();ctx.beginPath();ctx.rect(70,32,w-98,h-78);ctx.clip();const plots=[
 {min:-200,max:200,fn:x=>.01*x*x-50,col:'cyan'},
 {min:-150,max:59,fn:x=>5*Math.exp(x/20)-100,col:'#ff49d7'},
 {min:1,max:299,fn:x=>50*Math.log(x/10),col:'#f4d02d'}];
for(const p of plots){const pts=[];for(let x=p.min;x<=p.max;x++){const y=p.fn(x);pts.push(Math.abs(y)<=300?[tx(x),ty(y)]:null);}path(ctx,pts,p.col);}
const circ=[];for(let i=0;i<=360;i++){const angle=i*Math.PI/180;circ.push([tx(100*Math.cos(angle)),ty(100*Math.sin(angle))]);}path(ctx,circ,'#74f275',3);
ctx.restore();ctx.fillStyle='#c9d8e4';ctx.font='12px sans-serif';ctx.fillText('Turtle 코드의 원래 계수·범위를 계산한 브라우저 미리보기',75,22);
}
function graph(){
const {ctx,w,h}=crisp($('numpyGraph'));clear(ctx,w,h);
const type=$('functionType').value;
let points=[],extra=null,xmin,xmax,ymin,ymax,title,tip,color;
if(type==='line'){
  xmin=-11;xmax=11;ymin=-20;ymax=28;color='cyan';title='일차함수 y = 2x + 4';
  for(let i=0;i<200;i++){let x=-10+20*i/199;points.push([x,2*x+4]);}
  tip='x를 -10부터 10까지 200개로 나누고 y=2*x+4를 계산합니다. 직선이 나타납니다.';
}else if(type==='square'){
  xmin=-11;xmax=11;ymin=-10;ymax=110;color='cyan';title='이차함수 y = x²';
  for(let i=0;i<200;i++){let x=-10+20*i/199;points.push([x,x*x]);}
  tip='같은 200개 x값에 대해 y=x**2를 계산하면 U자 모양의 포물선이 나타납니다.';
}else{
  xmin=-2*Math.PI;xmax=2*Math.PI;ymin=-1.5;ymax=1.5;color='#ffb14e';title='사인·코사인 함수';
  extra=[];
  for(let i=0;i<400;i++){let x=-2*Math.PI+4*Math.PI*i/399;points.push([x,Math.sin(x)]);extra.push([x,Math.cos(x)]);}
  tip='-2π부터 2π까지 400개 x값으로 sin(x)와 cos(x)를 계산해 두 곡선을 한 좌표계에 함께 표시합니다. x는 라디안입니다.';
}
const {tx,ty}=axes(ctx,w,h,{xMin:xmin,xMax:xmax,yMin:ymin,yMax:ymax});
ctx.save();ctx.beginPath();ctx.rect(70,32,w-98,h-78);ctx.clip();
path(ctx,points.map(([x,y])=>[tx(x),ty(y)]),color,3);
if(extra)path(ctx,extra.map(([x,y])=>[tx(x),ty(y)]),'#ff73c6',3);
ctx.restore();
ctx.fillStyle='#e8f4fb';ctx.font='bold 15px sans-serif';ctx.fillText(title,82,25);
if(extra){ctx.fillStyle='#ffb14e';ctx.fillText('● sin(x)',w-220,25);ctx.fillStyle='#ff73c6';ctx.fillText('● cos(x)',w-115,25);}
$('plotExplain').textContent=tip;
}
$('functionType').addEventListener('change',graph);turtle();graph();
const questions=[
 ['Turtle에서 pen.goto(x, y)의 역할은?',['현재 좌표를 (x, y)로 이동한다','NumPy 배열을 생성한다','모듈을 설치한다'],0,'goto는 거북이 펜을 지정 좌표로 이동합니다.'],
 ['Python에서 x**2는?',['x에 2를 곱하기','x의 제곱','x를 2로 나누기'],1,'**는 거듭제곱 연산자입니다.'],
 ['range(-200, 201)에서 순회하는 정수는 몇 개인가요?',['400','401','201'],1,'-200부터 200까지 양 끝을 포함하므로 총 401개입니다.'],
 ['math.log(x)를 사용할 때 x의 조건은?',['x > 0','x = 0','x < 0'],0,'실수 범위의 자연로그는 양수 x에서만 정의됩니다.'],
 ['원 둘레 좌표를 만드는 식으로 적절한 것은?',['x=r cos(θ), y=r sin(θ)','x=r+θ, y=r−θ','x=r², y=θ²'],0,'각도에 따라 원의 x좌표와 y좌표를 계산합니다.'],
 ['np.linspace(-10, 10, 200)의 의미는?',['-10부터 10까지 200개의 x값 생성','200번 파일 저장','0~199 정수 생성'],0,'시작과 끝을 포함해 200개의 x값을 일정 간격으로 만듭니다.'],
 ['y = 2*x + 4에서 x=2일 때 y는?',['6','8','10'],1,'2×2 + 4 = 8입니다.'],
 ['Matplotlib의 plt.plot(x, y)는?',['x와 y 값으로 그래프를 그린다','실행 창을 닫는다','pip 패키지를 설치한다'],0,'plt.plot은 x와 y의 대응 값을 선으로 연결해 그래프를 그립니다.'],
 ['이번 Matplotlib 실습에서 배우는 네 함수는?',['일차·이차·사인·코사인','지수·로그·원·사인','다항·지수·로그·원'],0,'간단한 코드 두 개에서 일차함수, 이차함수, 사인함수, 코사인함수를 배웁니다.'],
 ['plt.show()의 일반적인 역할은?',['만든 그래프를 화면에 표시','함수명을 변경','데이터프레임 삭제'],0,'일반적인 데스크톱 Matplotlib 환경에서는 그래프 창을 표시합니다.']
];
const quiz=$('graphQuiz');const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
quiz.innerHTML=questions.map((q,i)=>'<div class="quiz"><b>'+(i+1)+'. '+esc(q[0])+'</b>'+q[1].map((a,j)=>'<label><input type="radio" name="mgq'+i+'" value="'+j+'"> '+(j+1)+'번. '+esc(a)+'</label>').join('')+'<p class="feedback" id="mgf'+i+'"></p></div>').join('');
$('checkGraphQuiz').onclick=()=>{let correct=0;questions.forEach((q,i)=>{const sel=document.querySelector('input[name="mgq'+i+'"]:checked');const ok=sel&&Number(sel.value)===q[2];if(ok)correct++;$('mgf'+i).textContent=(sel?(ok?'정답':'오답'):'미응답')+' · 정답 '+(q[2]+1)+'번 — '+q[3];});$('graphQuizResult').textContent=correct+' / '+questions.length+'문항 정답';};
$('resetGraphQuiz').onclick=()=>{document.querySelectorAll('#graphQuiz input').forEach(i=>i.checked=false);questions.forEach((q,i)=>$('mgf'+i).textContent='');$('graphQuizResult').textContent='';};
})();