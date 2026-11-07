import {useEffect,useRef} from 'react';
type Job={cancelled:boolean;visible:boolean;ready:()=>boolean;run:()=>Promise<void>};
const queue:Job[]=[];let draining=false;
async function drain(){if(draining)return;draining=true;try{while(queue.length){const job=queue.shift()!;if(!job.cancelled&&job.visible&&job.ready())await job.run();}}finally{draining=false;}}
/** Run each untouched teacher example at most once, only while visible.
 * No runtime is started for offscreen snippets or on keystrokes. */
export function useVisibleExample(enabled:boolean,ready:()=>boolean,run:()=>Promise<void>){
 const target=useRef<HTMLElement|null>(null),latest=useRef({ready,run});latest.current={ready,run};
 useEffect(()=>{
  if(!enabled||!target.current)return;
  let started=false;const job:Job={cancelled:false,visible:false,ready:()=>!started&&latest.current.ready(),run:async()=>{started=true;await latest.current.run();}};
  const observer=new IntersectionObserver(entries=>{job.visible=entries[0]?.isIntersecting||false;if(job.visible&&!started&&!queue.includes(job)){queue.push(job);void drain();}},{threshold:0.5});
  observer.observe(target.current);return()=>{job.cancelled=true;observer.disconnect();};
 },[enabled]);return target;
}
