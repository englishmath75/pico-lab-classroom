"""Execute every published example; verify the teaching contracts independently."""
from pathlib import Path
import json, io, contextlib
import pandas as pd
root=Path(__file__).resolve().parents[2]
data=json.loads((root/'public/pandas-data-lab/pandas-intro-examples.json').read_text())
assert len(data)==28
for example in data:
    out=io.StringIO()
    with contextlib.redirect_stdout(out): exec(compile(example['code'],example['title'],'exec'),{})
    # String dtype labels can change between pandas releases; numeric results may not.
    normalize=lambda s:s.replace("dtype='str'", "dtype='object'").replace('dtype: str','dtype: object').rstrip()
    assert normalize(out.getvalue())==normalize(example['output']), example['title']
s=pd.Series([10,20,30,40,50],index=['월','화','수','목','금'])
assert s.loc['화':'목'].tolist()==[20,30,40]
assert s.iloc[1:3].tolist()==[20,30]
assert s.iloc[4:0:-2].tolist()==[50,30]
assert s.iloc[::-1].tolist()==[50,40,30,20,10]
assert s.iloc[3:1].empty
assert s.loc[['금','월']].tolist()==[50,10]
assert len(s.drop('수'))==4 and len(s)==5
s.loc['토']=60
assert len(s)==6 and s.iloc[-1]==60
n=s.drop('월',inplace=True)
assert n is None and '월' not in s.index
x=pd.Series({'월':10,'화':20});y=pd.Series({'화':200,'수':300})
assert (x+y).loc['화']==220 and pd.isna((x+y).loc['월'])
assert x.add(y,fill_value=0).reindex(['월','화','수']).tolist()==[10,220,300]
assert (x+y).fillna(0).reindex(['월','화','수']).tolist()==[0,220,0]
page=(root/'public/pandas-data-lab/pandas-intro.html').read_text()
for token in ['iloc[','loc[','cumprod','idxmax','value_counts','6lkGh9HpCYw','bI43qd9HeVw','NaN']:
    assert token in page,token
print('PASS: 28 independent examples and indexing, mutation, alignment contracts; pandas',pd.__version__)
