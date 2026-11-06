import manifest from "../content/runtime-assets.json";
const allowed = new Set<string>(manifest);
const scriptPaths = ["/sw-runtime/pyodide/pyodide.js", "/sw-runtime/pyodide/pyodide.asm.js"];
const assetCache = new Map<string, {bytes:ArrayBuffer;mime:string}>();
let cachedBytes=0;
const MAX_CACHE_BYTES=48*1024*1024;
const sourceCache = new Map<string, Promise<string>>();
function source(path: string) {
  if (!sourceCache.has(path)) sourceCache.set(path, fetch(path, {credentials:"same-origin", redirect:"error"}).then(async response => {
    if (!response.ok) throw new Error("실행기 파일을 불러오지 못했습니다.");
    return response.text();
  }).catch(error => {sourceCache.delete(path); throw error;}));
  return sourceCache.get(path)!;
}
/** Opaque origin + connect-src none. Broker exposes ONLY pinned public static assets. */
export class IsolatedWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: {message: string}) => void) | null = null;
  bootstrapMs = 0;
  private frame: HTMLIFrameElement;
  private port: MessagePort;
  private stopped = false;
  private assetCount = 0;
  private abort = new AbortController();
  constructor() {
    const createdAt = performance.now();
    this.frame = document.createElement("iframe");
    this.frame.hidden = true;
    this.frame.title = "격리된 Python 실행 공간";
    this.frame.setAttribute("sandbox", "allow-scripts");
    const channel = new MessageChannel();
    this.port = channel.port1;
    this.port.onmessage = (event) => {
      if (event.data?.assetRequest) { void this.asset(event.data); return; }
      if (typeof event.data?.bridgeError === "string") this.onerror?.({message:event.data.bridgeError});
      else this.onmessage?.(event);
    };
    void Promise.all([source("/sw-runtime/runtime/frame.js"), source("/sw-runtime/python-worker.js"), ...scriptPaths.map(source)]).then(([bridge,worker,...scripts]) => {
      if (this.stopped) return;
      this.frame.onload = () => {
        this.bootstrapMs = performance.now() - createdAt;
        this.frame.contentWindow?.postMessage({type:"pylab-connect",base:location.origin,worker,scripts:Object.fromEntries(scriptPaths.map((p,i)=>[p,scripts[i]]))}, "*", [channel.port2]);
      };
      this.frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:; worker-src blob:; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'"><script>${bridge.replaceAll("</script", "<\\/script")}</script>`;
      document.body.append(this.frame);
    }).catch(error => {if (!this.stopped) this.onerror?.({message:String(error)});});
  }
  private async asset(data: {assetRequest:number;url:string}) {
    try {
      const url = new URL(data.url,location.origin);
      if (++this.assetCount > 100 || url.origin !== location.origin || url.search || url.hash || !allowed.has(url.pathname)) throw new Error("허용된 정적 실행 파일만 읽을 수 있습니다.");
      let asset=assetCache.get(url.pathname);
      if (!asset) {
        const response = await fetch(url.pathname,{credentials:"same-origin",redirect:"error",signal:this.abort.signal});
        if (!response.ok) throw new Error("실행 패키지를 불러오지 못했습니다.");
        const bytes=await response.arrayBuffer();
        if(bytes.byteLength>32*1024*1024)throw new Error("실행 파일 크기 제한 초과");
        asset={bytes,mime:response.headers.get("content-type") || "application/octet-stream"};
        while(cachedBytes+bytes.byteLength>MAX_CACHE_BYTES && assetCache.size) {
          const key=assetCache.keys().next().value!;
          cachedBytes-=assetCache.get(key)!.bytes.byteLength;assetCache.delete(key);
        }
        cachedBytes-=assetCache.get(url.pathname)?.bytes.byteLength || 0;
        assetCache.set(url.pathname,asset);cachedBytes+=bytes.byteLength;
      }
      // Transfer a copy: neither Python nor a later run can mutate cached assets.
      if (!this.stopped) {const bytes=asset.bytes.slice(0);this.port.postMessage({assetReply:data.assetRequest,bytes,mime:asset.mime},[bytes]);}

    } catch(error) {if (!this.stopped) this.port.postMessage({assetReply:data.assetRequest,error:String(error)});}
  }
  postMessage(data: unknown) { this.port.postMessage(data); }
  terminate() { this.stopped=true; this.abort.abort(); this.port.close(); this.frame.remove(); }
}
