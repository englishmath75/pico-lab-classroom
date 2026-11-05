// Opaque-origin iframe. A fresh worker and Python runtime are destroyed after EACH run.
// This boundary receives only code, stdin and audited runtime source, never identity or Firebase.
(() => {
  function workerMain() {
    let used=false;
    onmessage=async({data:m})=>{
      if(used)return;used=true;
      try {
        postMessage({type:'status',text:'Python 준비 중 · 첫 실행에는 파일 다운로드가 필요합니다.'});
        importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
        const py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'});
        py.FS.writeFile('/home/pyodide/turtle.py',m.turtle);
        const plot=/matplotlib|plt\./.test(m.code);
        if(plot){
          postMessage({type:'status',text:'matplotlib와 한글 글꼴 준비 중…'});
          await py.loadPackage('matplotlib');
          const font=await fetch('https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf');
          if(!font.ok)throw Error('한글 그래프 글꼴을 불러오지 못했습니다. 인터넷 연결을 확인하세요.');
          py.FS.writeFile('/tmp/NanumGothic.ttf',new Uint8Array(await font.arrayBuffer()));
          py.runPython("import matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nimport matplotlib.font_manager as fm\nfm.fontManager.addfont('/tmp/NanumGothic.ttf')\nplt.rcParams['font.family']='NanumGothic'\nplt.rcParams['axes.unicode_minus']=False\nplt.close('all')");
        }
        py.globals.set('_mk_code',m.code);py.globals.set('_mk_input',m.stdin);
        postMessage({type:'executing'});
        await py.runPythonAsync(m.execute);
        const result=JSON.parse(py.globals.get('_mk_result'));
        let picture='';
        if(plot)picture=py.runPython("import io,base64\n_picture=''\nif plt.get_fignums():\n    _buf=io.BytesIO()\n    plt.savefig(_buf,format='png',bbox_inches='tight')\n    _picture=base64.b64encode(_buf.getvalue()).decode('ascii')\n    plt.close('all')\n_picture");
        const turtle=JSON.parse(py.runPython("import json,sys\njson.dumps(sys.modules['turtle']._commands) if 'turtle' in sys.modules else '[]'"));
        postMessage({type:'result',...result,picture,turtle});
      }catch(error){postMessage({type:'error',error:String(error)});}finally{close();}
    };
  }
  let started=false;
  addEventListener('message',event=>{
    if(event.source!==parent||started||event.data?.type!=='run')return;
    started=true;const m=event.data,id=m.id;
    const url=URL.createObjectURL(new Blob(['('+workerMain.toString()+')()'],{type:'text/javascript'}));
    const worker=new Worker(url);URL.revokeObjectURL(url);
    worker.onmessage=({data})=>parent.postMessage({...data,id},'*');
    worker.onerror=()=>parent.postMessage({id,type:'error',error:'Python 준비에 실패했습니다. 연결을 확인하세요.'},'*');
    worker.postMessage({code:m.code,stdin:m.stdin,turtle:m.turtle,execute:m.execute});
  });
  parent.postMessage({type:'runner-ready'},'*');
})();
