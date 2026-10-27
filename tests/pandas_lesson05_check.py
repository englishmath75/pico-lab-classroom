from pathlib import Path
import pandas as pd,json,os,contextlib,io,math
R=Path(__file__).resolve().parents[1];S=R/'public/pandas-data-lab'
df=pd.DataFrame({'item':['A','A','B','C'],'sales':[10,10,None,30]})
assert df.shape==(4,2) and df.isna().sum().tolist()==[0,1]
assert df.duplicated().tolist()==[False,True,False,False]
clean=df.drop_duplicates();assert clean.shape==(3,2) and clean.index.tolist()==[0,2,3]
assert df.shape==(4,2) and math.isclose(df['sales'].mean(),50/3)
assert df['sales'].fillna(0).mean()==12.5 and df['sales'].isna().sum()==1
assert clean['sales'].mean()==20 and math.isclose(clean['sales'].fillna(0).mean(),40/3)
assert df.dropna(subset=['sales']).shape==(3,2)
assert pd.Series(['10','20','30']).astype(int).mean()==20
n=pd.to_numeric(pd.Series(['10','?','30']),errors='coerce');assert n.isna().sum()==1 and n.mean()==20
csv=pd.read_csv(S/'datasets/school_store_fictional.csv');assert csv.shape==(10,5) and csv.isna().sum().sum()==0 and csv.duplicated().sum()==0
ss=json.loads((R/'scripts/pandas-video/lesson05-scenes.json').read_text());old=os.getcwd();os.chdir(S/'datasets')
try:
 for s in ss:
  assert not any(w in s['speech'] for w in ['합성','복제','재현','녹화','촬영','제작 과정'])
  if s['kind']!='code':continue
  expected='ValueError' if "['10', '?', '30']" in s['code'] and '.astype(int)' in s['code'] else None
  try:
   with contextlib.redirect_stdout(io.StringIO()):exec(compile(s['code'],'lesson05.py','exec'),{})
  except Exception as err:assert type(err).__name__==expected,(s['title'],str(err))
  else:assert expected is None
finally:os.chdir(old)
print('PASS: lesson 5 examples, original preservation, missing values, duplicates, denominators, types and real CSV structure')
