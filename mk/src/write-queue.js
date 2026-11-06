// Firestore counts saves, submissions and deletes together for each learning space.
// Keep that same boundary in the UI. A timed-out request still owns its queue slot
// until it settles, so a second request cannot overtake a possibly committed write.
export class SpaceWriteQueue {
  constructor({gap=16000,timeout=10000,now=()=>Date.now(),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}) {
    this.gap=gap;this.timeout=timeout;this.now=now;this.wait=wait;this.spaces=new Map();
  }
  run(key,task,{current=()=>true,onWait=()=>{}}={}) {
    let state=this.spaces.get(key);
    if(!state){state={tail:Promise.resolve(),next:0};this.spaces.set(key,state);}
    let resolveResult,rejectResult;
    const result=new Promise((resolve,reject)=>{resolveResult=resolve;rejectResult=reject;});
    const ensureCurrent=()=>{if(!current())throw Object.assign(Error('학습 공간이 바뀌어 이전 저장 요청을 취소했습니다.'),{code:'stale-scope'});};
    const operation=state.tail.catch(()=>{}).then(async()=>{
      for(let attempt=0;attempt<2;attempt++) {
        ensureCurrent();
        const delay=Math.max(0,state.next-this.now());
        if(delay){onWait(delay);await this.wait(delay);ensureCurrent();}
        let timer,timedOut=false;
        if(this.timeout)timer=setTimeout(()=>{
          timedOut=true;
          rejectResult(Object.assign(Error('저장 응답이 지연되고 있습니다. 현재 내용을 보관한 뒤 저장 상태를 다시 확인해 주세요.'),{code:'deadline'}));
        },this.timeout);
        try {
          const value=await task();
          state.next=this.now()+this.gap;
          resolveResult(value);return;
        } catch(error) {
          // A different device may have used this space's quota most recently.
          if(error.code==='cooldown')state.next=this.now()+this.gap;
          if(error.code==='cooldown'&&attempt===0&&!timedOut)continue;
          throw error;
        } finally {clearTimeout(timer);}
      }
    });
    state.tail=operation.catch(error=>{rejectResult(error);});
    return result;
  }
}
