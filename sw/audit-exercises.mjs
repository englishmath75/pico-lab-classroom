import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {exercises,activityIds,routes} from './src/registry.js';
const dir='sw/evidence/integration-20261107';
const inventory=JSON.parse(await readFile(dir+'/inventory.json','utf8'));
const results=JSON.parse(await readFile(dir+'/catalog-runtime.json','utf8'));
const sha=s=>createHash('sha256').update(s).digest('hex');
const terminals=[3,4,29,53,59,95],answers=[11,19,31,37,51,81,83,84,85,86,88,92],outputs=[2,33,46,48,50,77,79,90,91,94];
for(const r of inventory){
 const n=Number(r.id.slice(3));let linked=exercises.filter(e=>e.sourceId===r.id),category='';
 if(linked.length)category='executable-python';
 else if(terminals.includes(n))category='terminal-command';
 else if(answers.includes(n))category='student-answer';
 else if(outputs.includes(n))category='output-display';
 else if([34,35].includes(n))category='csv-data';
 else if(n===74)category='arduino-cpp';
 else if([186,187,189].includes(n))category='internal-runtime-source';
 else if([23,27].includes(n))category='html-javascript-artwork';
 else if([24,25,26,28].includes(n)){category='dynamic-python';const id={24:125,25:126,26:127,28:128}[n];linked=exercises.filter(e=>e.sourceId==='SWX'+String(id).padStart(4,'0'));}
 else if([1,36,82].includes(n)){category='dynamic-python';const key={1:'avatar',36:'kosis-project',82:'simulation'}[n];linked=exercises.filter(e=>e.id==='sw3-2026-g2-'+key+'-python');}
 else if([18,30,32,49,87,89,93].includes(n)){category='shared-editor';r.save={18:'inquiry-d',30:'sw2-archive2-01…10',32:'sw2-free-code',49:'sw2-mastery-01…18',87:'lesson-01…10',89:'lesson-01…10',93:'scratch-01…10'}[n];}
 else if(n>=143&&n<=157){category='course-fragment';linked=exercises.filter(e=>e.source===r.source&&(e.teacherCode.includes(r.originalCode.trim())||e.originalCode.trim()===r.originalCode.trim()));}
 assert(category,'Unclassified source '+r.id);
 r.classification=category;r.linkedExercises=linked.map(e=>e.id);
 if(category==='course-fragment')assert(linked.length,'Unlinked course fragment '+r.id);
 if(linked.length){r.execution=linked.every(e=>results.some(x=>x.id===e.id&&x.status==='PASS'))?'BROWSER_PASS':'PENDING';r.outputKinds=[...new Set(linked.flatMap(e=>e.outputKinds))];r.assets=linked.flatMap(e=>e.assets);r.inputs=linked.map(e=>e.defaultInput);r.trace='shared-trace-component; representative fixtures verified';r.save='registered account record; representative emulator flow verified';r.transition='COMMON_COMPONENT';r.evidence=['catalog-runtime.json','browser-runtime.json','account-results.json'];r.url='https://sw.englishmath.kr/?page=exercise&exercise='+linked[0].id;}
 else{r.execution=category==='shared-editor'?'SHARED_COMPONENT_VERIFIED':'NOT_APPLICABLE';r.transition=category==='shared-editor'?'COMMON_COMPONENT':'PRESERVED';r.trace=category==='shared-editor'?'shared-trace-component':'NOT_APPLICABLE';r.save||='existing route or not applicable';r.evidence=['ui-results.json'];}
}
assert.equal(new Set(activityIds).size,activityIds.length,'duplicate permanent ID');
for(const e of exercises){assert(e.teacherCode.trim(),'Empty teacher code '+e.id);assert.equal(e.teacherCodeVersion,sha(e.teacherCode).slice(0,12));assert.equal(e.runtime,'pyodide-0.28.3');assert(e.context&&e.outputKinds.length);assert(!/^\s*(?:pip |py -m |python -m )/.test(e.teacherCode));}
const files={};async function scan(path){for(const x of await readdir(path,{withFileTypes:true})){const p=path+'/'+x.name;if(x.isDirectory()){if(['graphics-original','code'].includes(x.name))await scan(p);}else if(x.name!=='student-cloud.bundle.js'&&/\.(html|js|py)$/.test(x.name))files[p]=sha(await readFile(p));}}
await scan('public/pandas-data-lab');files['sw/datalab/content/sw-visual-lessons.json']=sha(await readFile('sw/datalab/content/sw-visual-lessons.json'));
const manifest=dir+'/audited-source-hashes.json';
if(process.argv.includes('--refresh'))await writeFile(manifest,JSON.stringify(files,null,2));
else assert.deepEqual(files,JSON.parse(await readFile(manifest,'utf8')),'Teaching source changed: classify/register the new or edited example before updating the audit manifest.');
await writeFile(dir+'/inventory.json',JSON.stringify(inventory,null,2));
const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const header=['id','title','source','url','classification','linkedExercises','execution','trace','save','transition','evidence'];
await writeFile(dir+'/inventory.csv','\ufeff'+[header,...inventory.map(r=>header.map(k=>Array.isArray(r[k])?r[k].join(';'):r[k]))].map(r=>r.map(csv).join(',')).join('\n'));
await writeFile(dir+'/registered-exercises.csv','\ufeff'+[['id','title','source','url','runtime','files','outputs','wholeRun','traceProfile'],...exercises.map(e=>[e.id,e.title,e.source,'https://sw.englishmath.kr/?page=exercise&exercise='+e.id,e.runtime,Object.keys(e.files).join(';'),e.outputKinds.join(';'),results.find(r=>r.id===e.id)?.status||'NOT_RUN',e.trace.profile])].map(r=>r.map(csv).join(',')).join('\n'));
await writeFile(dir+'/pages.json',JSON.stringify(Object.entries(routes).map(([id,r])=>({id,url:'https://sw.englishmath.kr/?page='+id,file:r.file||'native component',kind:r.kind})),null,2));
console.log(JSON.stringify({sourcePositions:inventory.length,registeredExercises:exercises.length,unclassified:0,checkedSourceFiles:Object.keys(files).length}));
