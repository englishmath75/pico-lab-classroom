/* Trusted bootstrap in a one-use, opaque-origin Worker. No student source in preparation. */
let runtime;
let busy = false;
let preparation;
let requestId;
let preparingPackages = false;
let initialization = {pyodideMs:0,adapterMs:0,preparationPackageMs:0,wasmBytes:0};
const now = () => performance.now();
const loading = (async () => {
  // Independent trusted assets overlap WASM initialization.
  const adapter = fetch(ASSET_BASE + '/sw-runtime/runner.py').then(r => r.text());
  const turtle = fetch(ASSET_BASE + '/sw-runtime/runtime/turtle.py').then(r => r.text());
  const start = now();
  importScripts(ASSET_BASE + '/sw-runtime/pyodide/pyodide.js');
  runtime = await loadPyodide({indexURL:ASSET_BASE + '/sw-runtime/pyodide/'});
  initialization.pyodideMs = now()-start;
  const setup = now();
  runtime.FS.writeFile('/home/pyodide/turtle.py',await turtle);
  runtime.runPython(await adapter);
  runtime.FS.writeFile('/home/pyodide/NanumGothic-Regular.ttf',new Uint8Array(await (await fetch(ASSET_BASE+'/sw-runtime/NanumGothic-Regular.ttf')).arrayBuffer()));
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
  const {id,code,stdin,trace} = data;
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
    runtime.runPython("import sys\nif 'matplotlib' in sys.modules:\n    import matplotlib, matplotlib.font_manager\n    matplotlib.font_manager.fontManager.addfont('/home/pyodide/NanumGothic-Regular.ttf')\n    matplotlib.rcParams['font.family']='NanumGothic'\n    matplotlib.rcParams['axes.unicode_minus']=False");
    self.postMessage({id,type:'running'});
    const start = now();
    runtime.globals.set('_pylab_request',JSON.stringify({code,stdin,trace}));
    const json = runtime.runPython('run_json(_pylab_request)');
    const executionMs = now()-start;
    const parseStart = now();
    const result = JSON.parse(json);
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
