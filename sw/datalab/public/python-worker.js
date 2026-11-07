/* Trusted bootstrap in a one-use, opaque-origin Worker. No student source in preparation. */
const asset=async path=>{const r=await fetch(ASSET_BASE+path);if(!r.ok)throw Error('실행 자료를 읽지 못했습니다: '+path+' ('+r.status+')');return r;};
let runtime;
let busy = false;
let preparation;
let requestId;
let preparingPackages = false;
let initialization = {pyodideMs:0,adapterMs:0,preparationPackageMs:0,wasmBytes:0};
const now = () => performance.now();
const loading = (async () => {
  // Independent trusted assets overlap WASM initialization.
  const adapter = asset('/sw-runtime/runner.py').then(r => r.text());
  const turtle = asset('/sw-runtime/runtime/turtle.py').then(r => r.text());
  const graphics = Promise.all(['classroom_graphics','tkinter','pygame'].map(async name=>[name,await (await asset('/sw-runtime/runtime/'+name+'.py')).text()]));
  const start = now();
  importScripts(ASSET_BASE + '/sw-runtime/pyodide/pyodide.js');
  runtime = await loadPyodide({indexURL:ASSET_BASE + '/sw-runtime/pyodide/'});
  initialization.pyodideMs = now()-start;
  const setup = now();
  runtime.FS.writeFile('/home/pyodide/turtle.py',await turtle);
  for(const [name,source] of await graphics)runtime.FS.writeFile('/home/pyodide/'+name+'.py',source);
  runtime.runPython(await adapter);
  runtime.FS.writeFile('/home/pyodide/NanumGothic-Regular.ttf',new Uint8Array(await (await asset('/sw-runtime/NanumGothic-Regular.ttf')).arrayBuffer()));
  runtime.runPython("import os; os.environ['MPLBACKEND'] = 'Agg'");
  initialization.adapterMs = now()-setup;
  initialization.wasmBytes = runtime._module?.HEAPU8?.byteLength || 0;
  return runtime;
})();
// Attach immediately: an offline idle bootstrap must not become an unhandled rejection.
loading.catch(error => self.postMessage({type:'initialization-failure',message:String(error)}));
self.onmessage = async ({data}) => {
  if (data.type === 'prepare') {
    if (preparation || busy) return;
    const packages = Array.isArray(data.packages) ? data.packages.filter(p => ['numpy','pandas','matplotlib'].includes(p)).slice(0,3) : [];
    preparation = loading.then(async () => {
      if (packages.length) {
        preparingPackages = true;
        const started = now();
        if (requestId !== undefined) self.postMessage({id:requestId,type:"packages"});
        await runtime.loadPackage(packages);
        // These are fixed trusted imports, never arbitrary code or identifiers.
        for (const name of packages) runtime.runPython({
          numpy:'import numpy',pandas:'import pandas',matplotlib:'import matplotlib.pyplot'
        }[name]);
        initialization.preparationPackageMs = now()-started;
        preparingPackages = false;
      }
      initialization.wasmBytes = runtime._module?.HEAPU8?.byteLength || 0;
      self.postMessage({type:'prepared',initialization});
    });
    preparation.catch(error => self.postMessage({type:'initialization-failure',message:String(error)}));
    return;
  }
  const {id,code,stdin,trace,files={},context={},exampleId='free-practice'} = data;
  requestId = id;
  if (busy) {self.postMessage({id,type:'failure',message:'이미 실행 중입니다.'});return;}
  busy = true; // Single-use even on errors. Parent always destroys this Worker.
  try {
    await loading;
    // A click can arrive after background package preparation has already begun.
    if (preparingPackages) self.postMessage({id,type:'packages'});
    if (preparation) await preparation;
    self.postMessage({id,type:'packages'});
    const packageStart = now();
    await runtime.loadPackagesFromImports(code);
    const packageMs = now()-packageStart;
    runtime.runPython("import importlib.util\nif importlib.util.find_spec('matplotlib') is not None:\n    import matplotlib, matplotlib.font_manager, matplotlib.pyplot\n    matplotlib.font_manager.fontManager.addfont('/home/pyodide/NanumGothic-Regular.ttf')\n    matplotlib.rcParams['font.family']='NanumGothic'\n    matplotlib.rcParams['axes.unicode_minus']=False");
    for(const [name,text] of Object.entries(files)){
      if(!/^[^/\\\x00-\x1f]{1,100}\.(csv|txt|json)$/.test(name)||typeof text!=='string'||text.length>1000000)throw Error('자료 이름과 크기를 확인하세요.');
      runtime.FS.writeFile('/home/pyodide/'+name,text);
    }
    runtime.globals.set('_pylab_request',JSON.stringify({code,stdin,trace,context,files}));
    const hashes=JSON.parse(runtime.runPython("import hashlib, json, sys; _sw_q=json.loads(_pylab_request); json.dumps({'code':hashlib.sha256(_sw_q['code'].encode()).hexdigest(),'input':hashlib.sha256(json.dumps({k:_sw_q[k] for k in ['stdin','files','context']},sort_keys=True).encode()).hexdigest()})"));
    const runMetadata={exampleId,runId:data.runId||('worker-'+id+'-'+Date.now()),codeHash:hashes.code,inputHash:hashes.input,runtime:'Pyodide 0.28.3',python:runtime.runPython('sys.version.split()[0]'),packages:JSON.parse(runtime.runPython("json.dumps({n: getattr(sys.modules[n], '__version__', '') for n in ['numpy','pandas','matplotlib'] if n in sys.modules})"))};
    self.postMessage({id,type:'running'});
    const start = now();
    runtime.globals.set('_pylab_request',JSON.stringify({code,stdin,trace,context}));
    const json = runtime.runPython('run_json(_pylab_request)');
    const executionMs = now()-start;
    const parseStart = now();
    const result = JSON.parse(json);
    result.runMetadata=runMetadata;
    runtime.globals.delete('_pylab_request');
    const diagnostics = result.diagnostics || {};
    delete result.diagnostics;
    self.postMessage({id,type:'result',result,metrics:{
      packageMs,pythonMs:Math.max(0,executionMs-(diagnostics.serializationMs||0)),
      traceMs:diagnostics.traceMs||0,
      serializationMs:(diagnostics.serializationMs||0)+(now()-parseStart)
    }});
  } catch(error) {self.postMessage({id,type:'failure',message:String(error)});}
};
