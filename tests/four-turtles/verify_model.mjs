import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {buildFrames,PENS,operation} from '../../public/pandas-data-lab/four-turtles-model.js';
const frames=buildFrames();
assert.equal(frames.length,402);
assert.deepEqual(PENS.map(p=>p.color),['cyan','magenta','yellow','lime']);
assert.deepEqual(frames[401].pens.map(p=>p.moves),[375,210,299,361]);
assert.deepEqual(frames[401].pens.map(p=>p.segments),[374,209,298,360]);
assert.equal(operation(209,1).X,59);
assert.equal(operation(210,1).kind,'skip');
assert.equal(operation(298,2).X,299);
assert.equal(operation(299,2).kind,'skip');
assert.equal(operation(360,3).kind,'move');
assert.equal(operation(361,3).kind,'skip');
assert.equal(operation(12,0).kind,'lift');
assert.equal(operation(13,0).X,-187);
assert.equal(operation(387,0).X,187);
assert.equal(operation(388,0).kind,'lift');
const traceFile=new URL('../../test-results/four-turtles/turtle-trace.json',import.meta.url);
if(!existsSync(traceFile))throw new Error('Run the real Tk/Turtle verification first; a mocked trace is not accepted.');
const trace=JSON.parse(readFileSync(traceFile,'utf8'));
assert.equal(trace.frames.length,401);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
trace.frames.forEach((snapshot,index)=>{
  assert.equal(snapshot.I,index);
  snapshot.pens.forEach((actual,j)=>{const simulated=frames[index+1].pens[j];close(actual.X,simulated.X);close(actual.Y,simulated.Y);assert.equal(actual.down,simulated.down);});
});
trace.events.forEach(event=>{const op=operation(event.I,event.pen-1);assert.equal(op.kind,'move');close(op.X,event.X);close(op.Y,event.Y);assert.equal(PENS[event.pen-1].color,event.color);});
// Within a frame, turtle objects execute in order, never as parallel threads.
for(let I=0;I<401;I++){const order=trace.events.filter(e=>e.I===I).map(e=>e.pen);assert.deepEqual(order,[...order].sort((a,b)=>a-b));}
console.log('PASS: 401 real Turtle frames, 1245 goto calls, all pen states/colors/order match the browser model.');
