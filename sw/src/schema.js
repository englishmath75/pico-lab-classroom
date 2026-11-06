// Typed records share the proven code-document envelope; plain legacy code is unchanged.
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const text=x=>typeof x==='string',bool=x=>typeof x==='boolean';
const number=x=>Number.isFinite(x),array=x=>Array.isArray(x);
const dictionary=(x,check)=>object(x)&&Object.values(x).every(check);
export function validateValue(id,v){
 if(!object(v))return false;
 const common={code:text,note:text,choices:x=>object(x)||Number.isInteger(x),graded:bool,score:x=>x===null||number(x),completed:bool};
 let shape;
 if(/^sw2-lesson-\d\d-state$/.test(id))shape={step:x=>Number.isInteger(x)&&x>=0&&x<5,done:x=>array(x)&&x.every(n=>Number.isInteger(n)&&n>=0&&n<5),predict:x=>dictionary(x,text),reflection:text,verified:x=>dictionary(x,text),revision:text,stdin:text,quiz:x=>dictionary(x,number),quizGraded:bool};
 else if(id==='sw2-report')shape=Object.fromEntries(['question','source','method','finding','graph','limits','next'].map(k=>[k,text]));
 else if(id==='sw2-review')shape={answers:x=>dictionary(x,number),graded:bool,wrong:x=>array(x)&&x.every(Number.isInteger),filter:x=>['all','wrong'].includes(x)};
 else if(['sw2-basics','sw2-binary'].includes(id))shape={answers:x=>dictionary(x,text),graded:bool};
 else if(id==='sw2-inquiry-d-state')shape={reason:text,checks:x=>array(x)&&x.every(bool),answers:x=>dictionary(x,text),graded:bool};
 else if(id==='sw2-kosis')shape={report:text,checks:x=>array(x)&&x.every(bool),fileRequired:bool};
 else if(id==='sw2-first-analysis')shape={note:text};
 else if(id==='sw2-simulation')shape={policy:object,hypothesis:text,design:text,interpretation:text,limitations:text,proposal:text,answers:x=>dictionary(x,number),graded:bool};
 else if(id==='sw2-free-state')shape={dataset:text,dataMode:x=>['provided','fictional-edited','user-file'].includes(x),stdin:text,providedVersion:text,providedData:object,csv:text};
 else if(/^sw2-datalab-.*-state$/.test(id))shape={csv:text,answers:x=>array(x)&&x.every(text),feedback:x=>array(x)&&x.every(text),concept:text,dataMode:x=>['provided','fictional-edited'].includes(x),providedData:object};
 else if(/^sw2-archive-\d\d$/.test(id))shape={answers:x=>dictionary(x,number),completed:bool};
 else if(/^sw2-(?:archive2|mastery)-\d\d$/.test(id))shape=common;
 else return false;
 return Object.entries(v).every(([key,value])=>shape[key]?.(value));
}
