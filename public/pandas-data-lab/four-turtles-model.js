// Coordinates and pen state mirror downloads/four_turtles.py; no Python execution here.
export const PENS = [
  {name:'pen1', color:'cyan', label:'다항함수'},
  {name:'pen2', color:'magenta', label:'지수함수'},
  {name:'pen3', color:'yellow', label:'로그함수'},
  {name:'pen4', color:'lime', label:'원'}
];
export function operation(I, pen) {
  let X, Y, T;
  if (pen === 0) { X = I - 200; Y = 0.01 * X**2 - 50; }
  if (pen === 1) { if (I >= 210) return {kind:'skip'}; X = I - 150; Y = 5 * Math.exp(X / 20) - 100; }
  if (pen === 2) { if (I >= 299) return {kind:'skip'}; X = I + 1; Y = 50 * Math.log(X / 10); }
  if (pen === 3) { if (I > 360) return {kind:'skip'}; T = I * Math.PI / 180; X = 100 * Math.cos(T); Y = 100 * Math.sin(T); }
  return {kind: pen < 3 && Math.abs(Y) > 300 ? 'lift' : 'move', X, Y, ...(T === undefined ? {} : {T})};
}
export function buildFrames() {
  const pens = PENS.map(()=>({X:0,Y:0,down:false,path:'',moves:0,segments:0}));
  const frames = [{I:null, pens:pens.map(p=>({...p})), ops:[], shared:{}}];
  let shared = {};
  for (let I=0; I<401; I++) {
    const ops = PENS.map((_,j)=>operation(I,j));
    ops.forEach((op,j)=>{
      if (op.kind === 'skip') return;
      shared = {X:op.X,Y:op.Y,...('T' in op ? {T:op.T} : {})};
      const p=pens[j];
      if (op.kind === 'lift') {p.down=false;return;}
      // goto happens before pendown: the first point does not draw from (0,0).
      p.path += `${p.down?'L':'M'}${op.X.toFixed(8)},${(-op.Y).toFixed(8)} `;
      if (p.down) p.segments++;
      p.X=op.X;p.Y=op.Y;p.moves++;p.down=true;
    });
    frames.push({I,pens:pens.map(p=>({...p})),ops,shared:{...shared}});
  }
  return frames;
}
