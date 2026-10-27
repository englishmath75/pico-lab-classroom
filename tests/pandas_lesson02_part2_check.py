from pathlib import Path
import json,io,contextlib
import pandas as pd
R=Path(__file__).resolve().parents[1]
scenes=json.loads((R/'scripts/pandas-video/lesson02-part2-scenes.json').read_text())
assert len(scenes)>=18
for s in scenes:
 if s['kind'] in ['question','answer']:continue
 out=io.StringIO()
 try:
  with contextlib.redirect_stdout(out):exec(compile(s['code'],'lesson02_part2.py','exec'),{})
 except KeyError:assert "['Price']" in s['code']
 except TypeError:assert 'df.shape()' in s['code']
base=pd.DataFrame({'item':['A','B','C'],'price':[1000,1500,2000]})
assert base.head(2).shape==(2,2) and base.shape==(3,2)
assert base.head().shape==(3,2)
assert base.columns.tolist()==['item','price']
assert isinstance(base['price'],pd.Series)
assert isinstance(base[['price']],pd.DataFrame)
assert base[['price']].shape==(3,1)
assert base['price'].mean()==1500.0
assert base.head(2)['price'].mean()==1250.0
assert base['price'].sum()==4500
base.loc[2,'price']=3000
assert abs(base['price'].mean()-5500/3)<1e-9
print('PASS: all part 2 teaching code, deliberate errors, unchanged head source, Series/DataFrame and means')

site=R/'public/pandas-data-lab'
episodes=json.loads((site/'video-catalog.json').read_text())['episodes']
ids=[e['id'] for e in episodes]
assert len(ids)==len(set(ids))
assert 'lesson02' in ids and 'lesson02-part2' in ids
original=next(e for e in episodes if e['id']=='lesson02')
assert original['variants'][0]['src']=='./videos/lesson02/index.m3u8'
for ep in episodes:
    for variant in ep['variants']:
        assert (site/variant['src']).is_file()
        assert (site/variant['captions']).is_file()
    assert all(0<=ch['at']<ep['duration'] for ch in ep['chapters'])
print('PASS: existing first episode preserved; second episode, captions and chapters resolve')
