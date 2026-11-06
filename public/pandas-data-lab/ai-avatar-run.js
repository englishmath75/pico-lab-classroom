export function runPython(code, datasets, onStatus=()=>{}) {
  const iframe=document.createElement('iframe');
  iframe.hidden=true;iframe.setAttribute("allow", "camera 'none'; microphone 'none'");iframe.setAttribute('sandbox','allow-scripts');iframe.src=new URL('./ai-avatar-runner.html',import.meta.url);
  const id=crypto.randomUUID();let timer,executionStarted=false,finish;
  const promise=new Promise((resolve,reject)=>{
    finish=(error,result)=>{clearTimeout(timer);removeEventListener('message',receive);iframe.remove();error?reject(error):resolve(result);};
    function receive(event) {
      if(event.source!==iframe.contentWindow) return;
      const m=event.data;
      if(m?.type==='runner-ready') {iframe.contentWindow.postMessage({type:'run',id,code,datasets},'*');return;}
      if(m?.id!==id) return;
      if(m.type==='status') onStatus(String(m.text).slice(0,300));
      if(m.type==='executing'&&!executionStarted) {executionStarted=true;clearTimeout(timer);timer=setTimeout(()=>finish(Error('실행 시간이 20초를 초과했습니다. 반복문을 확인하세요.')),20000);onStatus('Python 실행 중…');}
      if(m.type==='result') finish(null,{output:String(m.output||'').slice(0,80000),picture:/^[A-Za-z0-9+/=]{0,4000000}$/.test(m.picture||'')?m.picture:''});
      if(m.type==='error') finish(Error(String(m.error).slice(0,20000)));
    }
    addEventListener('message',receive);
    timer=setTimeout(()=>finish(Error('Python 준비 시간이 2분을 초과했습니다. 인터넷 연결을 확인하세요.')),120000);
    document.body.append(iframe);
  });
  return {promise,stop:()=>finish?.(Error('실행을 중지했습니다.'))};
}

