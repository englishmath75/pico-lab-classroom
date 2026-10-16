/* Optional local Python execution, isolated from the application UI in a worker. */
"use strict";
const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.29.5/full/";
let runtime = null;
async function getRuntime(id) {
  if (!runtime) {
    self.postMessage({ id, type:"status", message:"Python 실행 환경을 불러오는 중입니다. 첫 실행에는 추가 다운로드가 필요합니다." });
    importScripts(PYODIDE_BASE+"pyodide.js");
    runtime = loadPyodide({ indexURL:PYODIDE_BASE });
  }
  return await runtime;
}
self.onmessage = async function(event) {
  const { id, code } = event.data || {};
  if (typeof code !== "string" || code.length > 20000) {
    self.postMessage({ id, type:"error", message:"실행할 코드가 없거나 너무 깁니다." });
    return;
  }
  try {
    const py = await getRuntime(id);
    self.postMessage({ id, type:"status", message:"필요한 Python 라이브러리를 준비하고 있습니다." });
    await py.loadPackagesFromImports(code);
    if (code.includes("matplotlib")) {
      await py.loadPackage("matplotlib");
      py.runPython("import matplotlib\nmatplotlib.use('Agg')");
    }
    self.postMessage({ id, type:"status", message:"Python 코드를 실행하고 실제 출력을 확인하는 중입니다." });
    py.globals.set("student_code", code);
    const runner = [
      "import io, contextlib, traceback",
      "_output_buffer = io.StringIO()",
      "with contextlib.redirect_stdout(_output_buffer), contextlib.redirect_stderr(_output_buffer):",
      "    try:",
      "        exec(compile(student_code, '<student>', 'exec'), {'__name__': '__main__'})",
      "    except Exception:",
      "        traceback.print_exc()",
      "output_text = _output_buffer.getvalue()",
    ].join("\n");
    await py.runPythonAsync(runner);
    const output = String(py.globals.get("output_text") || "(출력 메시지가 없습니다.)");
    let svg = "";
    if (code.includes("matplotlib")) {
      try {
        py.runPython([
          "import io",
          "import matplotlib.pyplot as plt",
          "_svg = io.BytesIO()",
          "if plt.get_fignums():",
          "    plt.savefig(_svg, format='svg', bbox_inches='tight')",
          "svg_text = _svg.getvalue().decode('utf-8')",
          "plt.close('all')"
        ].join("\n"));
        svg = String(py.globals.get("svg_text") || "");
      } catch (chartError) {
        svg = "";
      }
    }
    self.postMessage({ id, type:"done", output:output, svg:svg });
  } catch(e) {
    self.postMessage({ id, type:"error", message:String(e && e.message || e) + " · 연결이 제한되면 Colab/로컬 Python을 이용해 주세요." });
  }
};
