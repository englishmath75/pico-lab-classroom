(()=>{'use strict';
const $=id=>document.getElementById(id);
for(const button of document.querySelectorAll('[data-copy]'))button.addEventListener('click',async()=>{const id=button.getAttribute('data-copy');const text=$(id)?.textContent||'';const status=$(id==='turtleSource'?'copyTurtleStatus':'copyNumpyStatus');try{await navigator.clipboard.writeText(text);status.textContent='코드 복사 완료 · VS Code에 붙여 넣고 .py로 저장하세요.';}catch(e){const selection=window.getSelection();const range=document.createRange();range.selectNodeContents($(id));selection.removeAllRanges();selection.addRange(range);status.textContent='코드를 선택했습니다. Ctrl+C로 복사하세요.';}});
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
function graph(){const {ctx,w,h}=crisp($('numpyGraph'));clear(ctx,w,h);const type=$('functionType').value,a=Number($('coeffA').value),b=Number($('coeffB').value);$('valueA').textContent=a;$('valueB').textContent=b;const cfg={
 poly:{min:-5,max:5,fn:x=>a*x*x+b,color:'#47dce9',title:'다항함수 · y = a×x²+b'},
 exp:{min:-2,max:2,fn:x=>a*Math.exp(x)+b,color:'#ff68d7',title:'지수함수 · y = a×eˣ+b'},
 log:{min:.1,max:10,fn:x=>a*Math.log(x)+b,color:'#f7d447',title:'로그함수 · y = a×ln(x)+b'},
 circle:{min:-a,max:a,fn:x=>x,color:'#74f275',title:'원의 방정식 · x²+y²=a²'},
 sin:{min:-2*Math.PI,max:2*Math.PI,fn:x=>a*Math.sin(x)+b,color:'#ffae49',title:'사인 · y = a×sin(x)+b'},
 cos:{min:-2*Math.PI,max:2*Math.PI,fn:x=>a*Math.cos(x)+b,color:'#ff78be',title:'코사인 · y = a×cos(x)+b'}
}[type];
const points=[];if(type==='circle'){for(let i=0;i<=360;i++){let angle=i*Math.PI/180;points.push([a*Math.cos(angle),a*Math.sin(angle)]);} }else{for(let i=0;i<=399;i++){let x=cfg.min+(cfg.max-cfg.min)*i/399;points.push([x,cfg.fn(x)]);}}
const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);let xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);if(type==='circle'){const ratio=(h-32-46)/(w-70-28);xmin=-a*1.35;xmax=a*1.35;ymin=-a*1.35*ratio;ymax=a*1.35*ratio;}else{const mx=(xmax-xmin)*.08||1,my=(ymax-ymin)*.15||1;xmin-=mx;xmax+=mx;ymin-=my;ymax+=my;}
const {tx,ty}=axes(ctx,w,h,{xMin:xmin,xMax:xmax,yMin:ymin,yMax:ymax});
ctx.save();ctx.beginPath();ctx.rect(70,32,w-98,h-78);ctx.clip();path(ctx,points.map(([x,y])=>[tx(x),ty(y)]),cfg.color,3.3);ctx.restore();
ctx.fillStyle='#e8f4fb';ctx.font='bold 15px sans-serif';ctx.fillText(cfg.title,82,25);
const tips={poly:'x가 2라면 계산은 a×2²+b 입니다. Python의 ** 연산이 제곱을 뜻합니다.',exp:'np.exp(x)는 자연상수 e의 x제곱을 계산합니다. x가 커지면 증가 속도가 빨라집니다.',log:'np.log(x)는 자연로그입니다. x는 0보다 커야 하므로 예제는 0.1부터 시작합니다.',circle:'theta 각도에 대해 x=a cos(theta), y=a sin(theta)를 계산합니다. 원본의 r=a를 반영합니다.',sin:'np.sin은 라디안 각도를 사용하고, a는 진폭, b는 중심 높이를 결정합니다.',cos:'np.cos도 라디안 각도를 사용합니다. sin과 시작값은 다르지만 주기는 같습니다.'};
$('plotExplain').textContent=tips[type]+(type==='circle'?' b는 이 원의 식에 사용되지 않습니다.':'');
}
$('functionType').addEventListener('change',graph);$('coeffA').addEventListener('input',graph);$('coeffB').addEventListener('input',graph);turtle();graph();
const questions=[
 ['Turtle에서 pen.goto(x, y)의 역할은?',['현재 좌표를 (x, y)로 이동한다','NumPy 배열을 생성한다','모듈을 설치한다'],0,'goto는 거북이 펜을 지정 좌표로 이동합니다.'],
 ['Python에서 x**2는?',['x에 2를 곱하기','x의 제곱','x를 2로 나누기'],1,'**는 거듭제곱 연산자입니다.'],
 ['range(-200, 201)에서 순회하는 정수는 몇 개인가요?',['400','401','201'],1,'-200부터 200까지 양 끝을 포함하므로 총 401개입니다.'],
 ['math.log(x)를 사용할 때 x의 조건은?',['x > 0','x = 0','x < 0'],0,'실수 범위의 자연로그는 양수 x에서만 정의됩니다.'],
 ['원 둘레 좌표를 만드는 식으로 적절한 것은?',['x=r cos(θ), y=r sin(θ)','x=r+θ, y=r−θ','x=r², y=θ²'],0,'각도에 따라 원의 x좌표와 y좌표를 계산합니다.'],
 ['np.linspace(-5, 5, 400)의 의미는?',['-5부터 5까지 400개의 x값 생성','400번 파일 저장','0~399 정수 생성'],0,'시작과 끝 사이를 균일하게 나눈 400개 점을 만듭니다.'],
 ['a=2, b=3이고 y=a*x**2+b일 때 x=2의 y는?',['7','11','14'],1,'2×2²+3 = 11입니다.'],
 ['Matplotlib의 ax.plot(x, y)는?',['x와 y 값으로 그래프를 그린다','실행 창을 닫는다','pip 패키지를 설치한다'],0,'ax.plot은 x좌표 배열과 y좌표 배열을 그립니다.'],
 ['원본 NumPy+Matplotlib 코드가 그리는 곡선 종류는?',['2종','4종','6종'],2,'다항·지수·로그·원·사인·코사인 총 6종입니다.'],
 ['plt.show()의 일반적인 역할은?',['만든 그래프를 화면에 표시','함수명을 변경','데이터프레임 삭제'],0,'일반적인 데스크톱 Matplotlib 환경에서는 그래프 창을 표시합니다.']
];
const quiz=$('graphQuiz');const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
quiz.innerHTML=questions.map((q,i)=>'<div class="quiz"><b>'+(i+1)+'. '+esc(q[0])+'</b>'+q[1].map((a,j)=>'<label><input type="radio" name="mgq'+i+'" value="'+j+'"> '+(j+1)+'번. '+esc(a)+'</label>').join('')+'<p class="feedback" id="mgf'+i+'"></p></div>').join('');
$('checkGraphQuiz').onclick=()=>{let correct=0;questions.forEach((q,i)=>{const sel=document.querySelector('input[name="mgq'+i+'"]:checked');const ok=sel&&Number(sel.value)===q[2];if(ok)correct++;$('mgf'+i).textContent=(sel?(ok?'정답':'오답'):'미응답')+' · 정답 '+(q[2]+1)+'번 — '+q[3];});$('graphQuizResult').textContent=correct+' / '+questions.length+'문항 정답';};
$('resetGraphQuiz').onclick=()=>{document.querySelectorAll('#graphQuiz input').forEach(i=>i.checked=false);questions.forEach((q,i)=>$('mgf'+i).textContent='');$('graphQuizResult').textContent='';};
})();