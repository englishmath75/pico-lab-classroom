from pathlib import Path
import pandas as pd,json,os,contextlib,io
R=Path(__file__).resolve().parents[1];S=R/'public/pandas-data-lab'
df=pd.DataFrame({'name':['Minji','Yuna','Sora'],'position':['G','F','G'],'points':[17,21,13]})
assert (df['points']>=15).tolist()==[True,True,False]
assert df[df['points']>=15]['name'].tolist()==['Minji','Yuna']
assert df[df['points']>17]['name'].tolist()==['Yuna']
ranked=df.sort_values('points',ascending=False)
assert ranked['name'].tolist()==['Yuna','Minji','Sora'] and ranked.index.tolist()==[1,0,2]
assert df['name'].tolist()==['Minji','Yuna','Sora']
a=df['position']=='G';b=df['points']>=15
assert df[a&b]['name'].tolist()==['Minji'] and len(df[a|b])==3
csv=pd.read_csv(S/'datasets/sports_fictional.csv');chosen=csv[(csv['position']=='G')&(csv['points']>=15)].sort_values('points',ascending=False)
assert chosen['player'].tolist()==['수빈','혜린','하늘'] and chosen['points'].tolist()==[22,19,18]
ss=json.loads((R/'scripts/pandas-video/lesson04-scenes.json').read_text());old=os.getcwd();os.chdir(S/'datasets')
try:
 for s in ss:
  assert not any(w in s['speech'] for w in ['합성','복제','재현','녹화','촬영','제작 과정'])
  if s['kind']!='code':continue
  expected='ValueError' if ') and' in s['code'] else 'TypeError' if 'descending=True' in s['code'] else None
  try:
   with contextlib.redirect_stdout(io.StringIO()):exec(compile(s['code'],'lesson04.py','exec'),{})
  except Exception as err:assert type(err).__name__==expected,(s['title'],str(err))
  else:assert expected is None
finally:os.chdir(old)
print('PASS: lesson 4 examples, boundaries, sort/index, & and |, CSV extension and intentional errors')
