import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {applyListOperation, initialList, LIST_OPERATIONS, listHighlights} from '../mk/src/list-explorer.js';
import {answerMatches} from '../mk/src/answer-check.js';

test('all list operations and cumulative sequences agree with CPython', () => {
  const sequences = LIST_OPERATIONS.map(operation => ({start:initialList(), operations:[operation]}));
  sequences.push(
    {start:initialList(), operations:LIST_OPERATIONS.slice(1)},
    {start:[], operations:['del a[0]', 'remove(20)', 'a[3]="테스트"', 'insert(1,15)', 'append(60)', '처음']},
    {start:[20,10,20], operations:['remove(20)', 'remove(20)', 'remove(20)', 'del a[0]', 'del a[0]']},
    {start:initialList(), operations:Array(7).fill('del a[0]')},
  );
  let seed = 20261105;
  for (let trial=0; trial<40; trial++) {
    const operations=Array.from({length:50},()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return LIST_OPERATIONS[seed%LIST_OPERATIONS.length];});
    sequences.push({start:initialList(),operations});
  }
  const oracle=spawnSync(process.env.PYTHON||'python3',['-c',String.raw`
import json,sys
results=[]
for case in json.load(sys.stdin):
    a=case['start'][:]
    for operation in case['operations']:
        before=a[:];error=None;sliced=':' in operation;output=None
        try:
            if operation=='처음': a=[10,20,30,40,50]
            elif sliced: output=eval(operation,{}, {'a':a})
            else: exec(('a.' if operation.startswith(('append','insert','remove')) else '')+operation,{}, {'a':a})
        except (IndexError,ValueError) as exc: error=type(exc).__name__
        results.append(dict(before=before,current=a[:],output=a[:] if output is None else output,error=error,sliced=sliced))
print(json.dumps(results,ensure_ascii=False))
`],{input:JSON.stringify(sequences),encoding:'utf8',maxBuffer:4000000});
  assert.equal(oracle.status,0,oracle.stderr);
  const expected=JSON.parse(oracle.stdout);let index=0;
  for(const sequence of sequences){
    let current=sequence.start;
    for(const operation of sequence.operations){
      Object.freeze(current);
      const result=applyListOperation(current,operation), {explanation,...actual}=result;
      assert.deepEqual(actual,expected[index++],operation+' from '+JSON.stringify(current));
      assert.equal(typeof explanation,'string');
      assert.notEqual(result.before,current); assert.notEqual(result.output,result.current);
      current=result.current;
    }
  }
  console.log(`CPython oracle: ${index} state transitions matched`);
});

test('assignment survives append, slices, and later operations; history is immutable',()=>{
  const assigned=applyListOperation(initialList(),'a[3]="테스트"');
  const appended=applyListOperation(assigned.current,'append(60)');
  assert.deepEqual(appended.current,[10,20,30,'테스트',50,60]);
  const reversed=applyListOperation(appended.current,'a[::-1]');
  assert.deepEqual(reversed.output,[60,50,'테스트',30,20,10]);
  assert.deepEqual(reversed.current,appended.current);
  const twice=applyListOperation(reversed.current,'append(60)');
  assert.match(twice.explanation,/인덱스는 6/);
  assert.deepEqual(assigned.current,[10,20,30,'테스트',50]);
  assert.deepEqual(twice.current,[10,20,30,'테스트',50,60,60]);
  assert.throws(()=>applyListOperation(initialList(),'unknown'),RangeError);
});

const questions=JSON.parse(readFileSync(new URL('../mk/content/questions.json',import.meta.url)));
test('36 exact model answers accepted; 4 rubric questions require self review',()=>{
  assert.equal(questions.length,40);
  for(const q of questions){
    assert.equal(answerMatches(q,q.expected),q.mode==='exact',q.id);
    assert.equal(answerMatches(q,'incorrect answer'),false,q.id);
    assert.equal(answerMatches(q,''),false,q.id);
  }
  assert.equal(questions.filter(q=>q.mode==='self').length,4);
});

export const falsePositives=[
  ['q04','dela[0]'],['q06','a[3]="테 스트"'],['q16','b l u e'],
  ['q27','n+ =1'],['q30','score >8 0'],['q31','3 4/7'],['q32','print(f"{3} {4}")'],
  ['q05','[1 0,20]'],['q19','28'],['q29','246'],['q38','32'],['q22','plt.s how()'],
  ['q06','a[3]="테스트 "'],['q32','print(f "{3}{4}")'],['q04','del\na[0]'],
];
test('meaningful spaces, token boundaries, and separated values are not erased',()=>{
  for(const [id,answer] of falsePositives)assert.equal(answerMatches(questions.find(q=>q.id===id),answer),false,`${id}: ${answer}`);
});
test('harmless formatting and quote styles remain accepted',()=>{
  for(const [id,answer] of [
    ['q02',' a . append ( 30 ) '],['q04','del  a [ 0 ]'],['q06',"a [ 3 ] = '테스트'"],
    ['q05','[10,20]'],['q27','n+=1'],['q30','score>80'],['q32',"print( F'{3}{4}' )"],
    ['q19','2   8'],['q29','2\n4\n6'],['q31','34 / 7'],['q38','3\t2'],
  ])assert.equal(answerMatches(questions.find(q=>q.id===id),answer),true,`${id}: ${answer}`);
});


test('highlight meanings follow actual positions through cumulative and empty-list operations', () => {
  let current=initialList();
  const check=(op,beforeMarks,afterMarks)=>{
    const result=applyListOperation(current,op),marks=listHighlights(result,op);
    const compact=values=>values.flatMap((kind,index)=>kind?[[index,kind]]:[]);
    assert.deepEqual(compact(marks.before),beforeMarks,op+' before');
    assert.deepEqual(compact(marks.after),afterMarks,op+' after');
    current=result.current;
  };
  check('a[3]="테스트"',[[3,'removed']],[[3,'added']]);
  check('append(60)',[],[[5,'added']]);
  check('insert(1,15)',[],[[1,'added'],[2,'moved'],[3,'moved'],[4,'moved'],[5,'moved'],[6,'moved']]);
  check('remove(20)',[[2,'removed']],[[2,'moved'],[3,'moved'],[4,'moved'],[5,'moved']]);
  check('remove(20)',[],[]);
  check('a[1:3]',[[1,'selected'],[2,'selected']],[[0,'selected'],[1,'selected']]);
  current=[];
  check('a[::-1]',[],[]);check('del a[0]',[],[]);check('a[3]="테스트"',[],[]);
  check('insert(1,15)',[],[[0,'added']]);
  check('처음',[],[]);
});
