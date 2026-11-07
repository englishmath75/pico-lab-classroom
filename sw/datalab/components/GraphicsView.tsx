import {useEffect,useRef,useState} from 'react';
import type {GraphicFrame} from '../lib/protocol';
export default function GraphicsView({frames,index}:{frames:GraphicFrame[];index?:number}){
 const canvas=useRef<HTMLCanvasElement|null>(null);const [cursor,setCursor]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(60);
 const fixed=index!==undefined,at=fixed?index:cursor,f=frames[at];
 useEffect(()=>{if(!playing||fixed)return;const timer=setInterval(()=>setCursor(n=>{if(n>=frames.length-1){setPlaying(false);return n;}return n+1;}),speed);return()=>clearInterval(timer);},[playing,speed,fixed,frames]);
 useEffect(()=>{const c=canvas.current;if(!c||!f)return;c.width=f.width;c.height=f.height;const ctx=c.getContext('2d');if(!ctx)return;ctx.globalCompositeOperation='source-over';ctx.fillStyle=f.background;ctx.fillRect(0,0,c.width,c.height);
 for(const d of f.commands){ctx.globalCompositeOperation=d.blend==='lighter'?'lighter':'source-over';ctx.beginPath();ctx.strokeStyle=d.color;ctx.fillStyle=d.color;ctx.lineWidth=d.width||1;
 if(d.kind==='circle')ctx.arc(d.coords[0],d.coords[1],Math.max(0,d.coords[2]),0,Math.PI*2);
 else {ctx.moveTo(d.coords[0],d.coords[1]);for(let j=2;j<d.coords.length;j+=2)ctx.lineTo(d.coords[j],d.coords[j+1]);if(d.kind!=='line')ctx.closePath();}
 if(d.kind==='polygon'||d.kind==='circle'){if(d.stipple==='gray50'){const tile=document.createElement('canvas');tile.width=tile.height=2;const tc=tile.getContext('2d')!;tc.fillStyle=d.color;tc.fillRect(0,0,1,1);tc.fillRect(1,1,1,1);ctx.fillStyle=ctx.createPattern(tile,'repeat')!;}ctx.fill();}else ctx.stroke();}
 },[f]);
 return <section><h3>Python이 계산한 작품</h3>{!fixed&&<><p>저장된 {frames.length}프레임을 재생합니다. 실시간 Python 재실행이 아닙니다.</p><div className="visual-actions"><button onClick={()=>{setCursor(0);setPlaying(false);}}>처음</button><button onClick={()=>setPlaying(v=>!v)}>{playing?'일시정지':'기록 재생'}</button><button onClick={()=>{setCursor(frames.length-1);setPlaying(false);}}>마지막 프레임</button><label>재생 간격<select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={120}>느리게</option><option value={60}>보통</option><option value={30}>빠르게</option></select></label></div><input aria-label="작품 프레임" type="range" min={0} max={frames.length-1} value={cursor} onChange={e=>{setPlaying(false);setCursor(Number(e.target.value));}}/></>}{f?<canvas ref={canvas} style={{width:'100%',height:'auto',background:'#020205'}} aria-label={'Python 작품 '+(at+1)+'프레임'}/>:<p>이 단계에는 아직 표시한 작품이 없습니다.</p>}<p>{Math.max(0,at+1)} / {frames.length}프레임 · 수업 시계 {f?.clockSeconds?.toFixed(3)||0}초</p></section>;
}
