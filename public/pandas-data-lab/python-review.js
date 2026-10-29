/* Keep the review heading and its first topic on the same native anchor route. */
(() => {
  const topics = [...document.querySelectorAll('.curriculum-subnav a')];
  const topicForHash = {
    '#basics': '#basics', '#setup': '#basics', '#structures': '#basics',
    '#turtle': '#turtle', '#trig': '#turtle',
    '#physics': '#physics', '#physics-guide': '#physics'
  };
  function updateReviewSelection() {
    const hash = location.hash || '#basics';
    const selected = topicForHash[hash];
    topics.forEach(link => {
      const target = new URL(link.href, location.href);
      const active = target.pathname === location.pathname && target.hash === selected;
      link.classList.toggle('is-current', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('hashchange', updateReviewSelection);
  updateReviewSelection();
})();
(()=>{'use strict';const $=id=>document.getElementById(id),TAU=Math.PI*2,rad=d=>d*Math.PI/180;const drawCanvas=(id,draw)=>{const c=$(id);if(c&&c.getContext)draw(c.getContext('2d'),c.width,c.height)};const clear=(ctx,w,h)=>{ctx.fillStyle='#0b1628';ctx.fillRect(0,0,w,h)};const line=(ctx,pts,color,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()};const dot=(ctx,x,y,color,r=5)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()};
function graph(){const d=+$('degree').value;$('degreeValue').textContent=d+'°';const sinOn=$('sinOn').checked,cosOn=$('cosOn').checked,tanOn=$('tanOn').checked;const sin=Math.sin(rad(d)),cos=Math.cos(rad(d)),tan=Math.abs(cos)<1e-10?null:sin/cos;$('trigValues').textContent='각도 '+d+'° · sin = '+sin.toFixed(3)+' · cos = '+cos.toFixed(3)+' · tan = '+(tan===null?'정의되지 않음':tan.toFixed(3));
drawCanvas('trigGraph',(c,w,h)=>{clear(c,w,h);const left=35,right=w-14,top=26,bottom=h-38,mid=(top+bottom)/2,amp=(bottom-top)/4;
c.font='12px sans-serif';c.fillStyle='#c9dae9';[0,90,180,270,360].forEach(t=>{const x=left+(right-left)*t/360;line(c,[[x,top],[x,bottom]],'#244052',1);c.fillText(String(t)+'°',x-11,h-13)});line(c,[[left,mid],[right,mid]],'#9cacc3',1);c.fillText('0',8,mid+4);c.fillText('+1',5,mid-amp+3);c.fillText('-1',5,mid+amp+3);
for(const [on,color,fn] of [[sinOn,'#55e1d3',x=>Math.sin(rad(x))],[cosOn,'#f6c978',x=>Math.cos(rad(x))],[tanOn,'#e48bef',x=>Math.tan(rad(x))]]){if(!on)continue;let seg=[];for(let k=0;k<=720;k++){const theta=k/2,v=fn(theta);if(Math.abs(v)>2.8||!Number.isFinite(v)){if(seg.length>1)line(c,seg,color,2.3);seg=[];continue}seg.push([left+(right-left)*theta/360,mid-amp*v]);}if(seg.length>1)line(c,seg,color,2.3);}
const x=left+(right-left)*d/360;line(c,[[x,top],[x,bottom]],'#ffffff80',1);});
drawCanvas('unitCircle',(c,w,h)=>{clear(c,w,h);const cx=w*.48,cy=h*.52,R=Math.min(w,h)*.31;line(c,[[20,cy],[w-14,cy]],'#71859c');line(c,[[cx,15],[cx,h-15]],'#71859c');c.strokeStyle='#d9e6ef';c.lineWidth=2;c.beginPath();c.arc(cx,cy,R,0,TAU);c.stroke();const x=cx+R*cos,y=cy-R*sin;line(c,[[cx,cy],[x,y]],'#f6c978',3);line(c,[[x,y],[x,cy]],'#55e1d3',2);dot(c,x,y,'#f6c978',6);c.fillStyle='#e4f4fa';c.font='13px sans-serif';c.fillText('x=cos θ',16,25);c.fillText('y=sin θ',16,43);c.fillText('θ='+d+'°',16,61);c.fillText('tan θ = sin θ / cos θ',16,h-14);});}
['degree','sinOn','cosOn','tanOn'].forEach(id=>$(id).addEventListener('input',graph));graph();
let balls=[],running=true,frame=0,lastTime=0;const reset=()=>{balls=[{x:35,y:165,vx:+$('vx').value,vy:-5,life:255,r:8,hue:170}];frame=0;};['vx','gravity','drag'].forEach(id=>$(id).oninput=()=>{$('vxValue').textContent=$('vx').value;$('gValue').textContent=$('gravity').value;$('dragValue').textContent=$('drag').value;reset()});$('restart').onclick=reset;$('pause').onclick=()=>{running=!running;$('pause').textContent=running?'일시정지':'계속 실행'};$('burst').onclick=()=>{for(let i=0;i<30;i++){const a=TAU*i/30,s=2+Math.random()*5;balls.push({x:100,y:160,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:255,r:3+Math.random()*3,hue:(i*12)%360})} };
function physics(){for(const id of ['vx','gravity','drag'])if(!$(id))return;const g=+$('gravity').value,drag=+$('drag').value;if(running){frame++;for(const b of balls){b.x+=b.vx;b.y+=b.vy;b.vy+=g;b.vx*=drag;b.vy*=drag;b.life-=b.r<7?3.8:.2;if(b.y>=320-b.r){b.y=320-b.r;b.vy=-Math.abs(b.vy)*.72;}if(b.x>690)b.x=0;}balls=balls.filter(x=>x.life>0);if(!balls.length)reset();}
drawCanvas('motionCanvas',(c,w,h)=>{clear(c,w,h);line(c,[[0,h-20],[w,h-20]],'#5e788d',2);balls.forEach(b=>dot(c,b.x,b.y,'hsla('+b.hue+',90%,65%,'+Math.max(.1,b.life/255)+')',b.r));c.fillStyle='#d0e8f1';c.font='14px sans-serif';c.fillText('가상 물리 실험 / 아래쪽이 +y 방향',18,25)});$('motionReadout').textContent='프레임 '+frame+' · 중력 '+g+' · 저항 '+drag+' · 입자 '+balls.length+'개';}reset();['vx','gravity','drag'].forEach(id=>$(id).dispatchEvent(new Event('input')));
const particles=[];function extras(t){drawCanvas('waveCanvas',(c,w,h)=>{clear(c,w,h);for(let j=0;j<8;j++){const points=[];for(let x=0;x<w;x+=3)points.push([x,h/2+Math.sin(x*.018+t*.0014+j*.55)*29+Math.cos(x*.012-t*.0007)*12+(j-4)*11]);line(c,points,'hsla('+(180+j*19)+',95%,67%,'+(0.3+j*.07)+')',2)}});
drawCanvas('auroraCanvas',(c,w,h)=>{clear(c,w,h);for(let j=0;j<5;j++){const pts=[];for(let x=0;x<w;x+=4)pts.push([x,h*.48+Math.sin(x*.014+t*.001*(1+j*.15))*22+Math.cos(x*.027-t*.0005)*11+(j-2)*23]);line(c,pts,'hsla('+(148+j*32)+',90%,65%,0.75)',4)}});
if(Math.random()<.3){const a=Math.random()*TAU;particles.push({x:190,y:120,vx:Math.cos(a)*3,vy:Math.sin(a)*3-2,life:80,color:Math.floor(Math.random()*360)})}drawCanvas('particlesCanvas',(c,w,h)=>{clear(c,w,h);for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.vx*=.98;p.life--;dot(c,p.x,p.y,'hsla('+p.color+',96%,68%,'+Math.max(0,p.life/80)+')',3)} });for(let i=particles.length-1;i>=0;i--)if(particles[i].life<=0)particles.splice(i,1);}
function animate(t){if(t-lastTime>25){physics();extras(t);lastTime=t;}requestAnimationFrame(animate)}requestAnimationFrame(animate);
const QUESTIONS=[
['기본','import random이 의미하는 것은?',['random 모듈 사용 준비','Python 삭제','모든 모듈 설치'],0,'import는 기능을 불러옵니다. 설치와는 다릅니다.'],
['기본','py -m pip install pandas는 어떤 작업을 하나요?',['모듈 불러오기','현재 Python 환경에 패키지 설치','패키지 삭제'],1,'-m pip install은 외부 패키지를 설치합니다.'],
['기본','원소 1개의 튜플은?',['(3)','[3]','(3,)'],2,'쉼표가 있는 (3,)이 튜플입니다.'],
['기본',"pd.DataFrame({'x':[3,5,2]}).shape 결과는?",['(3, 1)','(1, 3)','(3, 2)'],0,'데이터 행 3개와 x 열 1개입니다.'],
['기본',"['red','blue'][5 % 2] 결과는?",['red','blue','오류'],1,'5 % 2 = 1이므로 인덱스 1입니다.'],
['기본','for _ in range(30)의 반복 횟수는?',['29회','30회','31회'],1,'0~29로 30번 반복합니다.'],
['기본','x=10 이후 x *= 0.5의 결과는?',['10','5.0','0.5'],1,'x=x*0.5이므로 5.0입니다.'],
['그래픽','math.sin(math.radians(30))의 값은?',['약 0.5','약 1.0','30'],0,'Python 삼각함수는 라디안 단위입니다.'],
['그래픽','90°에서 tan 값은?',['0','정의되지 않음','1'],1,'cos 90°=0으로 나눌 수 없습니다.'],
['그래픽','vy=2에 vy += 0.15를 실행하면?',['1.85','2.15','0.15'],1,'수직 속도가 0.15 증가합니다.'],
['그래픽','vx=10에 vx *= 0.96을 실행하면?',['9.6','10.96','0.96'],0,'속도가 96%로 감소합니다.'],
['그래픽','life=255에 life -= 4.5를 실행하면?',['260','250.5','4.5'],1,'현재 수명에서 4.5를 뺍니다.']];
$('quizItems').innerHTML=QUESTIONS.map((q,i)=>'<div class="quiz"><b>'+(i+1)+'. ['+q[0]+'] '+q[1]+'</b>'+q[2].map((v,j)=>'<label><input type="radio" name="quiz'+i+'" value="'+j+'"> '+String(j+1)+'번. '+v+'</label>').join('')+'<p id="feedback'+i+'" class="feedback"></p></div>').join('');
$('grade').onclick=()=>{let n=0;QUESTIONS.forEach((q,i)=>{const sel=document.querySelector('input[name="quiz'+i+'"]:checked'),ok=sel&&+sel.value===q[3];if(ok)n++;$('feedback'+i).textContent=(sel?(ok?'정답':'오답'):'미응답')+' · 정답 '+(q[3]+1)+'번: '+q[4]});$('score').textContent=n+' / '+QUESTIONS.length+'문항 정답'};$('resetQuiz').onclick=()=>{document.querySelectorAll('#quizItems input').forEach(x=>x.checked=false);QUESTIONS.forEach((q,i)=>$('feedback'+i).textContent='');$('score').textContent=''};})();
