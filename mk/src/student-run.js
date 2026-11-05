// Rendering is restricted to validated data. No messages grant access to the account context.
export function runPython(code,stdin='',onStatus=()=>{}) {
  const iframe=document.createElement('iframe');iframe.hidden=true;iframe.setAttribute('sandbox','allow-scripts');iframe.src=new URL('./student-runner.html',import.meta.url);
  const id=crypto.randomUUID();let timer,finish,done=false,executing=false;
  const promise=new Promise((resolve,reject)=>{
    finish=(error,result)=>{if(done)return;done=true;clearTimeout(timer);removeEventListener('message',receive);iframe.remove();error?reject(error):resolve(result);};
    async function receive(event){
      if(event.source!==iframe.contentWindow)return;const m=event.data;
      if(m?.type==='runner-ready'){
        try{const [turtle,execute]=await Promise.all(['turtle.py','execute.py'].map(async n=>{const r=await fetch('./runtime/'+n);if(!r.ok)throw Error('실행 도구를 읽지 못했습니다.');return r.text();}));
        if(!done)iframe.contentWindow.postMessage({type:'run',id,code,stdin,turtle,execute},'*');}catch(e){finish(e);}return;
      }
      if(m?.id!==id)return;
      if(m.type==='status')onStatus(String(m.text).slice(0,300));
      if(m.type==='executing'&&!executing){executing=true;clearTimeout(timer);timer=setTimeout(()=>finish(Error('실행 시간이 20초를 넘었습니다. 반복 조건을 확인하세요.')),20000);onStatus('Python 실행 중…');}
      if(m.type==='error')finish(Error(String(m.error).slice(0,20000)));
      if(m.type==='result')finish(null,{output:String(m.output||'').slice(0,80000),error:String(m.error||'').slice(0,20000),picture:/^[A-Za-z0-9+/=]{0,4000000}$/.test(m.picture||'')?m.picture:'',turtle:validateCommands(m.turtle),trace:Array.isArray(m.trace)?m.trace.slice(0,180).filter(x=>Number.isInteger(x.line)&&typeof x.values==='string').map(x=>({line:x.line,values:x.values.slice(0,1800)})):[]});
    }
    addEventListener('message',receive);timer=setTimeout(()=>finish(Error('Python 준비 시간이 2분을 넘었습니다. 연결을 확인하세요.')),120000);document.body.append(iframe);
  });return{promise,stop:()=>finish?.(Error('실행을 중지했습니다.'))};
}
const color=x=>typeof x==='string'&&/^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{1,30})$/.test(x);
const nums=x=>x.every(n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=100000);
export function validateCommands(value){if(!Array.isArray(value))return[];return value.slice(0,24000).filter(c=>Array.isArray(c)&&((c[0]==='line'&&c.length===7&&nums(c.slice(1,5))&&color(c[5])&&nums([c[6]])&&c[6]>0&&c[6]<=40)||(c[0]==='dot'&&c.length===5&&nums(c.slice(1,4))&&c[3]>0&&c[3]<=100&&color(c[4]))||(c[0]==='background'&&c.length===2&&color(c[1]))));}
export function drawTurtle(canvas,commands){
  canvas.width=600;canvas.height=440;const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,600,440);
  // Fixed mathematical coordinates preserve the meaning of goto and distance.
  for(const c of validateCommands(commands)){
    if(c[0]==='background'){ctx.fillStyle=c[1];ctx.fillRect(0,0,600,440);}
    if(c[0]==='line'){ctx.strokeStyle=c[5];ctx.lineWidth=c[6];ctx.lineCap='round';ctx.beginPath();ctx.moveTo(300+c[1],220-c[2]);ctx.lineTo(300+c[3],220-c[4]);ctx.stroke();}
    if(c[0]==='dot'){ctx.fillStyle=c[4];ctx.beginPath();ctx.arc(300+c[1],220-c[2],c[3]/2,0,2*Math.PI);ctx.fill();}
  }
}
