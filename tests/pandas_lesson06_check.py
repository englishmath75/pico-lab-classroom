from pathlib import Path
import pandas as pd,json,os,contextlib,io,math
R=Path(__file__).resolve().parents[1];S=R/'public/pandas-data-lab'
df=pd.DataFrame({'team':['A','A','B','B'],'points':[10,20,15,25]})
assert df.shape==(4,2)
g=df.groupby('team')['points']
assert g.mean().to_dict()=={'A':15.0,'B':20.0}
assert g.sum().to_dict()=={'A':30,'B':40}
assert g.count().to_dict()=={'A':2,'B':2}
assert df['points'].mean()==17.5
assert g.agg(['mean','sum','count']).loc['A'].tolist()==[15,30,2]
changed=df.copy();changed.loc[3,'points']=35
assert changed.groupby('team')['points'].mean().to_dict()=={'A':15,'B':25}
missing=df.copy();missing.loc[1,'points']=None
m=missing.groupby('team')['points'].agg(['mean','count','size'])
assert m.loc['A'].tolist()==[10,1,2]
u=pd.DataFrame({'team':['A','B','B','B'],'points':[30,10,20,30]})
assert u.groupby('team')['points'].mean().mean()==25 and u['points'].mean()==22.5
assert u.groupby('team')['points'].sum().to_dict()=={'A':30,'B':60}
csv=pd.read_csv(S/'datasets/sports_fictional.csv');assert csv.shape==(8,6)
x=csv.groupby('team')['points'].agg(['mean','sum','count'])
assert x.loc['파랑'].tolist()==[16.5,66,4] and x.loc['빨강'].tolist()==[15,60,4]
ss=json.loads((R/'scripts/pandas-video/lesson06-scenes.json').read_text());old=os.getcwd();os.chdir(S/'datasets')
try:
 for s in ss:
  assert not any(w in s['speech'] for w in ['합성','복제','재현','녹화','촬영','제작 과정'])
  assert max(map(len,s['code'].splitlines()))<=65,(s['title'],'line too long')
  if s['kind']!='code':continue
  expected='KeyError' if "groupby('Team')" in s['code'] else None
  try:
   with contextlib.redirect_stdout(io.StringIO()):exec(compile(s['code'],'lesson06.py','exec'),{})
  except Exception as err:assert type(err).__name__==expected,(s['title'],str(err))
  else:assert expected is None
finally:os.chdir(old)
print('PASS: lesson 6 grouping, means, sums, counts, missing values, unequal group sizes, errors, real CSV and all scene code')
