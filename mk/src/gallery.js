// Curated Canvas interpretations. Teacher originals stay outside the public build.
const canvas=document.getElementById('canvas'),ctx=canvas.getContext('2d'),toggle=document.getElementById('toggle'),status=document.getElementById('status');
const modes=['particles','aurora','warp','chaos','alpha','waves'];let mode=new URLSearchParams(location.search).get('mode');if(!modes.includes(mode))mode='particles';
let running=false,t=0,last=0,frame;let pointer={x:360,y:150};
function draw(){const w=canvas.width,h=canvas.height,n=+document.getElementById('density').value;ctx.fillStyle='#171c32';ctx.fillRect(0,0,w,h);
 if(mode==='alpha'){ctx.fillStyle='#080d19';ctx.fillRect(0,115,w,65);for(let i=0;i<4;i++){ctx.fillStyle=['#ef786350','#69d1aa90','#7abfe7b0','#ecd266ff'][i];ctx.beginPath();ctx.arc(w*(i+1)/5,150,58,0,Math.PI*2);ctx.fill();}status.textContent='웹 색상 투명도: 뒤 두 16진수가 불투명도를 정합니다. Python 출력이 아닙니다.';return;}
 if(mode==='aurora'){for(let layer=0;layer<4;layer++){ctx.beginPath();for(let x=0;x<=w;x+=5){const y=150+Math.sin(x*.012+t*(layer+1))*(20+layer*13)+Math.cos(x*.02-t)*15; x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=['#9b87e8','#81d4ba','#ef9a85','#79bce7'][layer];ctx.lineWidth=5;ctx.stroke();}return;}
 for(let i=0;i<n;i++){let x,y,r=2;
 if(mode==='particles'){const angle=i*2.39996+t;const radius=18+(i%40)*4+Math.sin(t+i)*10;x=pointer.x+Math.cos(angle)*radius;y=pointer.y+Math.sin(angle)*radius*.65;r=1+i%3;}
 if(mode==='warp'){const z=((i*17-t*100)%700+700)%700+20;const scale=180/z;x=w/2+Math.cos(i*2.4)*180*scale;y=h/2+Math.sin(i*2.4)*100*scale;r=Math.min(8,scale*2);}
 if(mode==='waves'){const col=i%20,row=Math.floor(i/20);x=30+col*34;y=45+row*17+Math.sin(col*.35+row*.4+t)*24;}
 if(mode==='chaos'){const angle=i*.13+t*.2;const radius=80*Math.sin(i*.041+t*.3);x=w/2+Math.cos(angle)*radius*2;y=h/2+Math.sin(angle*1.07)*radius;}
 ctx.fillStyle=`hsl(${i*13+t*30} 70% 72%)`;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
}
function tick(now){if(!running)return;if(now-last>33){t+=.01*+document.getElementById('speed').value;draw();last=now;}frame=requestAnimationFrame(tick);}
function stop(){running=false;cancelAnimationFrame(frame);toggle.textContent='움직임 시작';}
toggle.onclick=()=>{if(running)stop();else{running=true;toggle.textContent='움직임 중지';status.textContent='웹 Canvas 실행 중 · 최대 240개, 30fps 이내';frame=requestAnimationFrame(tick);}};
document.getElementById('reset').onclick=()=>{stop();t=0;draw();};
for(const id of ['density','speed'])document.getElementById(id).oninput=()=>draw();
canvas.onpointermove=e=>{const rect=canvas.getBoundingClientRect();pointer={x:(e.clientX-rect.left)*720/rect.width,y:(e.clientY-rect.top)*300/rect.height};if(!running)draw();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});addEventListener('pagehide',stop);draw();
