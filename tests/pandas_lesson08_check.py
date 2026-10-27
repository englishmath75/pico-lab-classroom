from pathlib import Path
import sys,json,ast,hashlib
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
R=Path(__file__).resolve().parents[1];S=R/'public/pandas-data-lab'
sys.path.insert(0,str(R/'scripts/pandas-video'));import build_lesson08 as p
base=(S/'downloads/lesson_08.py').read_text()
assert ast.dump(ast.parse(base))==ast.dump(ast.parse(p.e.scenes[9]['code']))
ns={};exec(base,ns)
df=ns['df'];assert df.shape==(4,2) and df['year'].tolist()==[2021,2022,2023,2024]
assert df['temp'].tolist()==[13.1,13.4,13.0,13.8]
ax=plt.gca();line=ax.lines[0]
assert list(line.get_xdata())==df['year'].tolist() and list(line.get_ydata())==df['temp'].tolist()
assert (ax.get_xlabel(),ax.get_ylabel(),ax.get_title(),line.get_marker())==('Year','Temperature (C)','Fictional climate','o')
assert df.loc[df['temp'].idxmax(),'year']==2024 and df.loc[df['temp'].idxmin(),'year']==2023
assert abs(df['temp'].iloc[-1]-df['temp'].iloc[0]-.7)<1e-9
assert not df['temp'].is_monotonic_increasing
csv=pd.read_csv(S/'datasets/climate_fictional.csv');assert csv.shape==(10,4)
spring=csv[csv['season']=='봄'].sort_values('year')
assert spring['year'].tolist()==list(range(2020,2025)) and spring['temp_c'].tolist()==[12.6,13.0,13.2,13.8,14.1]
assert abs(spring['temp_c'].iloc[-1]-spring['temp_c'].iloc[0]-1.5)<1e-9
plt.close('all')
for i,s in enumerate(p.e.scenes):
 assert not any(w in s['speech'] for w in ['합성','복제','재현','녹화','촬영','제작 과정'])
 assert len(s['code'].splitlines())<=16,(i,s['title'])
 for line in s['code'].splitlines():assert p.e.font(27,not bool(p.re.search('[가-힣]',line))).getlength(line)<980,(i,line)
 if s['kind'] in ['code','graph']:
  out,folder=p.run_program(s)
  if s.get('expectError'):assert s['expectError'] in out
  if s.get('chart'):assert (folder/'verified_graph.png').stat().st_size>10000
  if 'savefig(' in s['code']:assert (folder/'climate_line.png').stat().st_size>10000
  if s.get('dataset')=='changed':assert '12.8' in s['code'] and '13.8' not in s['code']
 code,out,note=p.visual(s);p.frame(s,i,len(p.e.scenes),code,out,note,len(code.splitlines()),0,.8)
print('PASS: lesson 8 actual plot data, labels/units, changed values, ranges, expected errors, spring CSV, PNG save, all scene code/layout')
