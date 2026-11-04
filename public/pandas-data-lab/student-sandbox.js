// This document is loaded with sandbox="allow-scripts" (opaque origin).
// It never receives Firebase configuration, account information, or tokens.
(() => {
  function workerMain() {
    let used = false;
    onmessage = async ({data:m}) => {
      if (used) return; used = true;
      try {
        postMessage({type:'status',text:'Python 실행 환경 준비 중…'});
        importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
        const py = await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'});
        const output=[]; let length=0;
        const emit=text=>{if(length<80000){output.push(text.slice(0,80000-length));length+=text.length;}};
        py.setStdout({batched:emit}); py.setStderr({batched:emit});
        if (/\b(?:from|import)\s+turtle\b/.test(m.code)) throw Error('Turtle은 탐구실 전용 시뮬레이션 또는 VS Code에서 실행하세요.');
        for (const [name,text] of Object.entries(m.datasets || {})) {
          if (/^[a-zA-Z0-9_-]+\.csv$/.test(name)) py.FS.writeFile(name,text);
        }
        const plot=/matplotlib|plt\.|\.plot\s*\(/.test(m.code);
        if(plot) {await py.loadPackage('matplotlib');py.runPython("import matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt");}
        await py.loadPackagesFromImports(m.code);
        postMessage({type:'executing'});
        await py.runPythonAsync(m.code);
        let picture='';
        if(plot) picture=py.runPython("import io,base64\n_picture=''\nif plt.get_fignums():\n    _buf=io.BytesIO()\n    plt.savefig(_buf,format='png',bbox_inches='tight')\n    _picture=base64.b64encode(_buf.getvalue()).decode('ascii')\n_picture");
        postMessage({type:'result',output:output.join('\n'),picture});
      } catch(error) {postMessage({type:'error',error:String(error)});} finally {close();}
    };
  }
  let worker, started=false;
  addEventListener('message',event=>{
    if(event.source!==parent || started || event.data?.type!=='run') return;
    started=true;
    const id=event.data.id;
    const blob=URL.createObjectURL(new Blob(['('+workerMain.toString()+')()'],{type:'text/javascript'}));
    worker=new Worker(blob);URL.revokeObjectURL(blob);
    worker.onmessage=({data})=>parent.postMessage({...data,id},'*');
    worker.onerror=()=>parent.postMessage({id,type:'error',error:'Python 환경을 준비하지 못했습니다. 인터넷 연결을 확인하세요.'},'*');
    worker.postMessage({code:event.data.code,datasets:event.data.datasets});
  });
  parent.postMessage({type:'runner-ready'},'*');
})();
