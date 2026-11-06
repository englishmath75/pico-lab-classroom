"""Public curriculum contracts and executable examples. Not a private exam bank."""
import ast,json,pathlib,subprocess,collections,tempfile,os
p=pathlib.Path('mk/content');activities=json.loads((p/'activities.json').read_text());lessons=json.loads((p/'lessons.json').read_text());questions=json.loads((p/'questions.json').read_text());problems=json.loads((p/'codeup.json').read_text());candidates=json.loads((p/'codeup-candidates.json').read_text())
assert len(lessons)==10 and len(problems)==10 and len(questions)==40 and len(candidates)==20
assert collections.Counter(q['topic'] for q in questions)==dict(list=12,turtle=6,matplotlib=6,control=6,fstring=4,nested=6)
assert len({a['id'] for a in activities})==len(activities)
byid={a['id']:a for a in activities}
for l in lessons[:8]:assert len(l['tasks'])>=2 and len(l['checks'])>=3 and l['activities']
for l in lessons:
 for key in l['activities']:assert key in byid
for q in questions:
 assert q['activity'] in byid and q['expected'] and q['explanation'] and q['source'] and q['scope']=='core'
for problem in problems:
 assert len(problem['hints'])==3
 for key in [problem['activity'],problem['variant']]:assert len(byid[key]['tests'])>=3
 assert problem['activity']!=problem['variant']
for a in activities:
 tree=ast.parse(a['code']);forbidden=(ast.FunctionDef,ast.AsyncFunctionDef,ast.ClassDef,ast.Lambda,ast.Tuple,ast.Dict,ast.Set,ast.ListComp,ast.DictComp,ast.SetComp,ast.GeneratorExp)
 assert not any(isinstance(n,forbidden) for n in ast.walk(tree)),a['id']
 assert not any(isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id in ['map','filter','zip','enumerate'] for n in ast.walk(tree)),a['id']
 for test in a.get('tests',[]):
  r=subprocess.run(['python','-c',a['code']],input=test['input'],capture_output=True,text=True,timeout=5)
  assert r.returncode==0 and r.stdout==test['expected'],(a['id'],r.stderr,r.stdout,test['expected'])
# Four multiplication table variants: independent mathematical expected row/column sequence.
import re
for direction in ['horizontal','vertical']:
 for style in ['comma','fstring']:
  a=byid[f'mk3-gugudan-{direction}-{style}']
  for start,end in [(2,4),(7,7),(2,9),(5,3),(1,4),(2,10)]:
   r=subprocess.run(['python','-c',a['code']],input=f'{start}\n{end}\n',text=True,capture_output=True,timeout=5)
   assert r.returncode==0
   if not 2<=start<=end<=9:assert '입력하세요' in r.stdout;continue
   expected=[(d,n,d*n) for n in range(1,10) for d in range(start,end+1)] if direction=='horizontal' else [(d,n,d*n) for d in range(start,end+1) for n in range(1,10)]
   actual=[tuple(map(int,x)) for x in re.findall(r'(\d+) x (\d+) =\s*(\d+)',r.stdout)]
   assert actual==expected
   if direction=='horizontal':assert len(r.stdout.splitlines())==9
for kind in ['left','right','decrease','pyramid']:
 for n in [1,3,5]:
  r=subprocess.run(['python','-c',byid['mk3-stars-'+kind]['code']],input=f'{n}\n',capture_output=True,text=True,timeout=5)
  expected=[]
  for row in range(1,n+1):
   spaces=n-row if kind in ['right','pyramid'] else 0
   stars=n-row+1 if kind=='decrease' else 2*row-1 if kind=='pyramid' else row
   expected.append(' '*spaces+'*'*stars)
  assert r.stdout=='\n'.join(expected)+'\n'
# Real Python calls the exact browser Turtle shim, never a source-code shape parser.
for a in activities:
 if 'import turtle' in a['code']:
  code=a['code']+"\nassert len(turtle._commands)>0\nassert len(turtle._commands)<=24000\n"
  r=subprocess.run(['python','-c',code],text=True,capture_output=True,timeout=10,env={**os.environ,'PYTHONPATH':str(pathlib.Path('mk/runtime').resolve())})
  assert r.returncode==0,(a['id'],r.stderr)
# Distribution excludes teacher originals, reference captures, SW course content and video UI.
for file in pathlib.Path('mk/src').rglob('*'):
 if file.suffix in ['.html','.js','.css']:assert not any(token in file.read_text() for token in ['df.shape','DataFrame','축제 간식','<video','시험예상']),file
for fn in ['activities.json','lessons.json','questions.json']:
 assert not any(s in (p/fn).read_text() for s in ['import pandas','패킹','딕셔너리','튜플'])
print('PASS 10 units; 40 questions; 20 candidates/10 core; 63 public cases; 24 multiplication cases; 12 star cases; Turtle runtime calls; AST scope and distribution contracts')
