// Same isolation protocol as student-sandbox; no account, camera or Firebase access.
(() => {
 const runtimeURL=new URL('./avatar-vendor/python/',location.href).href;
 function workerMain(){
  let used=false;
  onmessage=async({data:m})=>{
   if(used)return;used=true;
   try{
    postMessage({type:'status',text:'내 PC에 Python 실행 환경 준비 중…'});
    importScripts(m.runtimeURL+'pyodide.js');
    const py=await loadPyodide({indexURL:m.runtimeURL});
    // This lesson needs only built-in Python. Remove network capabilities before
    // any student code executes (including Python's JavaScript FFI).
    for(const key of ['fetch','XMLHttpRequest','WebSocket','EventSource','WebTransport','importScripts','Worker'])Object.defineProperty(self,key,{value:undefined,writable:false,configurable:false});
    const output=[];let length=0;
    const emit=text=>{if(length<20000){output.push(String(text).slice(0,20000-length));length+=String(text).length;}};
    py.setStdout({batched:emit});py.setStderr({batched:emit});
    postMessage({type:'executing'});await py.runPythonAsync(m.code);
    postMessage({type:'result',output:output.join('\n')});
   }catch(error){postMessage({type:'error',error:String(error)});}finally{close();}
  };
 }
 let started=false;
 addEventListener('message',event=>{
  if(event.source!==parent||started||event.data?.type!=='run')return;started=true;
  const id=event.data.id,blob=URL.createObjectURL(new Blob(['('+workerMain.toString()+')()'],{type:'text/javascript'}));
  const worker=new Worker(blob);URL.revokeObjectURL(blob);
  worker.onmessage=({data})=>parent.postMessage({...data,id},'*');
  worker.onerror=()=>parent.postMessage({id,type:'error',error:'Python 준비에 실패했습니다. 인터넷 연결을 확인하고 다시 실행해 주세요.'},'*');
  worker.postMessage({code:String(event.data.code).slice(0,12000),runtimeURL});
 });
 parent.postMessage({type:'runner-ready'},'*');
})();
