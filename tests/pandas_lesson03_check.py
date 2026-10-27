from pathlib import Path
import json,os,contextlib,io
import pandas as pd
R=Path(__file__).resolve().parents[1];S=R/'public/pandas-data-lab'
df=pd.read_csv(S/'datasets/sports_fictional.csv')
assert df.shape==(8,6) and df.columns.tolist()==['player','team','position','games','points','assists']
assert df[['player','points']].shape==(8,2) and df.loc[0,'player']==df.iloc[0,0]=='하늘'
assert len(df.loc[0:2,'player'])==3 and len(df.iloc[0:2,0])==2
renamed=df.copy();renamed.index=range(1,9)
assert renamed.loc[1,'player']==renamed.iloc[0,0]=='하늘'
try:renamed.loc[0,'player']
except KeyError:pass
else:raise AssertionError('loc requires an existing label')
scenes=json.loads((R/'scripts/pandas-video/lesson03-scenes.json').read_text())
old=os.getcwd();os.chdir(S/'datasets')
try:
 for s in scenes:
  assert not any(w in s['speech'] for w in ['합성','복제','재현','녹화','촬영','제작 과정'])
  if s['kind']!='code':continue
  expected='FileNotFoundError' if 'missing_sports.csv' in s['code'] else 'KeyError' if "['Player']" in s['code'] else None
  try:
   with contextlib.redirect_stdout(io.StringIO()):exec(compile(s['code'],'lesson03.py','exec'),{})
  except Exception as error:assert type(error).__name__==expected,(s['title'],str(error))
  else:assert expected is None
finally:os.chdir(old)
print('PASS: all lesson 3 teaching code, CSV 8x6, loc/iloc, changed index, slice endpoints and intentional errors')
