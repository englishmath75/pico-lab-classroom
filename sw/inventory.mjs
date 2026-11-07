import ts from 'typescript';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root='public/pandas-data-lab',output='sw/evidence/integration-20261107';
const rows=JSON.parse(await readFile(output+'/raw-code-inventory.json','utf8'));
for(const name of await readdir(root)){
 if(!/\.js$/.test(name))continue;
 const file=root+'/'+name,text=await readFile(file,'utf8');const ast=ts.createSourceFile(name,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 function visit(n){
  if((ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))&&/\b(import (?:math|turtle|pandas|numpy|matplotlib|pygame|tkinter)|from \w+ import|print\(|for \w+ in range|df\[|pen\w*\.)/.test(n.text)&&n.text.includes('\n'))rows.push({source:file,line:ast.getLineAndCharacterOfPosition(n.getStart()).line+1,kind:'javascript-literal',originalCode:n.text,title:n.parent.name?.getText(ast)||name});
  ts.forEachChild(n,visit);
 }visit(ast);
}
let n=0;
for(const r of rows){r.id='SWX'+String(++n).padStart(4,'0');r.sha256=createHash('sha256').update(r.originalCode).digest('hex');r.classification=!r.originalCode.trim()?'dynamic-or-answer':/^(?:pip |python |python3 |cd |mkdir |code |#.*\n(?:pip|python) )/.test(r.originalCode.trim())?'terminal-command':/^(?:import |from |print\(|#|[A-Za-z_]\w*\s*=|for |if |def )/m.test(r.originalCode)?'python-review-required':'explanation-or-output';r.url='https://sw.englishmath.kr/'+r.source.split('/').pop().replace(/\.js$/,'.html')+(r.section?'#'+r.section:'');r.assets=[];r.inputs=[];r.execution='UNVERIFIED';r.outputKinds=[];r.trace='NOT_RUN';r.save='NOT_REVIEWED';r.transition='NOT_CONVERTED';r.evidence=[];}
await writeFile(output+'/inventory.json',JSON.stringify(rows,null,2));
console.log(JSON.stringify({positions:rows.length,classification:rows.reduce((a,r)=>(a[r.classification]=(a[r.classification]||0)+1,a),{})}));
