from pathlib import Path
import pandas as pd,json,os,contextlib,io,sys
R=Path(__file__).resolve().parents[1];S=R/'public/pandas-data-lab'
texts=['climate change','climate risk','climate change']
joined=' '.join(texts);assert joined=='climate change climate risk climate change'
parts=joined.split();assert parts==['climate','change','climate','risk','climate','change']
words=pd.Series(parts);freq=words.value_counts()
assert freq.to_dict()=={'climate':3,'change':2,'risk':1}
assert (len(texts),len(words),len(freq),freq.sum())==(3,6,3,6)
assert pd.Series(' '.join(['climate change']*3).split()).value_counts().to_dict()=={'climate':3,'change':3}
assert pd.Series(' '.join(['기후 변화','기후 위기','기후 변화']).split()).value_counts().to_dict()=={'기후':3,'변화':2,'위기':1}
assert pd.Series('Climate climate'.split()).value_counts().to_dict()=={'Climate':1,'climate':1}
assert pd.Series('Climate climate'.lower().split()).value_counts().to_dict()=={'climate':2}
text='climate change, climate change';assert pd.Series(text.split()).value_counts().to_dict()=={'climate':2,'change,':1,'change':1}
assert pd.Series(text.replace(',','').split()).value_counts().to_dict()=={'climate':2,'change':2}
left=pd.DataFrame({'key':['A','B'],'score':[80,90]});right=pd.DataFrame({'key':['A','B'],'grade':['B','A']})
expected=pd.DataFrame({'key':['A','B'],'score':[80,90],'grade':['B','A']})
pd.testing.assert_frame_equal(pd.merge(left,right,on='key'),expected)
pd.testing.assert_frame_equal(pd.merge(left,right.iloc[::-1],on='key'),expected)
pd.testing.assert_frame_equal(pd.merge(left,right.iloc[:1],on='key'),expected.iloc[:1])
csv=pd.read_csv(S/'datasets/sports_fictional.csv');assert csv.shape==(8,6) and csv['team'].value_counts().to_dict()=={'파랑':4,'빨강':4}
sys.path.insert(0,str(R/'scripts/pandas-video'));import build_lesson07 as p
ss=p.e.scenes;old=os.getcwd();os.chdir(S/'datasets')
try:
 for s in ss:
  assert not any(w in s['speech'] for w in ['합성','복제','재현','녹화','촬영','제작 과정'])
  assert len(s['code'].splitlines())<=16
  for line in s['code'].splitlines():assert p.e.font(27,not bool(p.re.search('[가-힣]',line))).getlength(line)<980,(s['title'],line)
  if s['kind']!='code':continue
  errtype='AttributeError' if '.value_count()' in s['code'] else None
  try:
   with contextlib.redirect_stdout(io.StringIO()):exec(compile(s['code'],'lesson07.py','exec'),{})
  except Exception as err:assert type(err).__name__==errtype,(s['title'],str(err))
  else:assert errtype is None
finally:os.chdir(old)
print('PASS: lesson 7 tokenization, frequencies, case/punctuation, Korean spacing limits, intentional error, key-based merge, CSV and all scene code/layout')
