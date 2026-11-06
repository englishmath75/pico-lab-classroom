/* This file is fetched by the parent, then embedded in an opaque srcdoc sandbox. */
(() => {
  let connected = false;
  addEventListener('message', (event) => {
    if (connected || event.source !== parent || event.data?.type !== 'pylab-connect' || event.ports.length !== 1) return;
    connected = true;
    const port = event.ports[0];
    const urls = [];
    const scripts = {};
    for (const [path, source] of Object.entries(event.data.scripts)) {
      scripts[path] = URL.createObjectURL(new Blob([source], {type:'text/javascript'}));
      urls.push(scripts[path]);
    }
    const prelude = `const ASSET_BASE = ${JSON.stringify(event.data.base)};
      const SCRIPTS = ${JSON.stringify(scripts)};
      const originalImport = self.importScripts.bind(self);
      self.importScripts = (...urls) => originalImport(...urls.map(url => {
        const parsed = new URL(url, ASSET_BASE);
        if (parsed.origin !== ASSET_BASE || !SCRIPTS[parsed.pathname] || parsed.search) throw new Error('Script blocked');
        return SCRIPTS[parsed.pathname];
      }));
      for (const name of ['WebSocket', 'XMLHttpRequest', 'EventSource']) {
        Object.defineProperty(self, name, {value: class {constructor() {throw new Error('Network API blocked');}}, writable:false, configurable:false});
      }
      let seq = 0;
      const pending = new Map();
      self.fetch = async (url, options = {}) => {
        if (options.method && options.method !== 'GET') throw new Error('Only static GET assets are allowed');
        const key = ++seq;
        return new Promise((resolve, reject) => {
          pending.set(key, {resolve, reject});
          self.postMessage({assetRequest: key, url: String(url)});
        });
      };
      self.addEventListener('message', event => {
        if (!event.data?.assetReply) return;
        event.stopImmediatePropagation();
        const item = pending.get(event.data.assetReply);
        if (!item) return;
        pending.delete(event.data.assetReply);
        if (event.data.error) item.reject(new Error(event.data.error));
        else item.resolve(new Response(event.data.bytes, {headers: {'Content-Type':event.data.mime}}));
      });
    `;
    const url = URL.createObjectURL(new Blob([prelude, event.data.worker], {type:'text/javascript'}));
    urls.push(url);
    const worker = new Worker(url);
    worker.onmessage = ({data}) => port.postMessage(data);
    worker.onerror = error => port.postMessage({bridgeError: error.message});
    port.onmessage = ({data}) => worker.postMessage(data);
    // Blob URLs live until the sandbox is removed, including lazy package imports.
  });
})();
