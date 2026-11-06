import type { RunResult, TraceValue } from './protocol';
function record(x: unknown): x is Record<string, unknown> {return !!x && typeof x === 'object' && !Array.isArray(x);}
function text(x: unknown, max: number): x is string {return typeof x === 'string' && x.length <= max;}
function value(x: unknown): x is TraceValue {
 return x === null || typeof x === 'boolean' || (typeof x === 'number' && Number.isFinite(x)) || text(x,10000) || (record(x) && (text(x.ref,100) || (text(x.type,100) && text(x.value,10000))));
}
function scope(x: unknown) {return record(x) && Object.keys(x).length <= 41 && Object.entries(x).every(([k,v])=>k.length<=100 && value(v));}
function drawing(x: unknown) {
 if (x === undefined) return true;
 const n = (v:unknown) => typeof v === 'number' && Number.isFinite(v) && Math.abs(v)<=100000;
 const color = (v:unknown) => typeof v === 'string' && /^(#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?|black|white|red|green|blue|orange|purple|yellow|cyan|magenta|navy|teal|gold|gray|pink)$/.test(v);
 const style = (v:Record<string,unknown>) => color(v.color) && n(v.width) && (v.width as number)>0 && (v.width as number)<=30;
 return record(x) && Array.isArray(x.pens) && x.pens.length<=16 && Array.isArray(x.segments) && x.segments.length<=512 &&
 x.pens.every(p=>record(p)&&Number.isInteger(p.id)&&n(p.x)&&n(p.y)&&n(p.heading)&&typeof p.down==='boolean'&&style(p)) &&
 x.segments.every(s=>record(s)&&[s.x1,s.y1,s.x2,s.y2].every(n)&&Number.isInteger(s.pen)&&style(s));
}
function table(x: unknown) {
 if(x === undefined) return true;
 if(!record(x)) return false;
 if('unsupported' in x) return text(x.unsupported,200);
 const cell=(c:unknown)=>c===null||typeof c==='boolean'||(typeof c==='number'&&Number.isFinite(c))||text(c,256);
 return Array.isArray(x.shape)&&x.shape.length===2&&x.shape.every(v=>Number.isSafeInteger(v)&&v>=0)&&
 Array.isArray(x.index)&&x.index.length<=32&&x.index.every(cell)&&Array.isArray(x.columns)&&x.columns.length<=12&&x.columns.every(cell)&&
 Array.isArray(x.dtypes)&&x.dtypes.length===x.columns.length&&x.dtypes.every(v=>text(v,80))&&
 Array.isArray(x.rows)&&x.rows.length===x.index.length&&x.rows.every(row=>Array.isArray(row)&&row.length===(x.columns as unknown[]).length&&row.every(cell))&&typeof x.truncated==='boolean';
}
/** Treat even worker messages as untrusted. Never render arbitrary image URLs. */
export function validResult(x: unknown): x is RunResult {
 if (!record(x) || !drawing(x.drawing) || !text(x.stdout,65536) || !text(x.stderr,65536) || typeof x.limited !== 'boolean') return false;
 if (!Array.isArray(x.images) || x.images.length>3 || !x.images.every(i=>text(i,2800000) && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(i))) return false;
 if (x.error != null && (!record(x.error) || !text(x.error.name,100) || !text(x.error.message,2000) || !text(x.error.traceback,8000) || !(x.error.line===null || Number.isInteger(x.error.line)))) return false;
 if (!Array.isArray(x.events) || x.events.length>250) return false;
 for(const event of x.events) {
  if(!record(event) || !drawing(event.drawing) || !['call','line','return','exception','final'].includes(String(event.event)) || !Number.isInteger(event.line) || !text(event.stdout,65536) || !scope(event.globals) || !record(event.objects) || Object.keys(event.objects).length>256 || !Array.isArray(event.frames) || event.frames.length>15) return false;
  if(!event.frames.every(f=>record(f) && text(f.id,100) && text(f.name,100) && Number.isInteger(f.line) && scope(f.locals)))return false;
  if(!Object.values(event.objects).every(o=>record(o) && text(o.type,100) && table(o.table) && Array.isArray(o.items) && o.items.length<=32 && o.items.every(v=>value(v) || (Array.isArray(v) && v.length===2 && v.every(value)))))return false;
 }
 return JSON.stringify(x).length <= 12*1024*1024;
}
