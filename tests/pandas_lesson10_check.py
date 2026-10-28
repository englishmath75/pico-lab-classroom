from pathlib import Path
import sys,ast,contextlib,io
import pandas as pd
R=Path(__file__).resolve().parents[1];S=R/'public/pandas-data-lab'
sys.path.insert(0,str(R/'scripts/pandas-video'));import build_lesson10 as p
base=(S/'downloads/lesson_10.py').read_text();ns={}
with contextlib.redirect_stdout(io.StringIO()):exec(base,ns)
df=ns['df'];assert ast.dump(ast.parse(base))==ast.dump(ast.parse(p.e.scenes[7]['code']))
assert df.shape==(3,2) and df['sales'].tolist()==[12,30,18]
ranked=df.sort_values('sales',ascending=False);assert ranked['item'].tolist()==['bread','milk','juice'] and ranked.index.tolist()==[1,2,0]
assert df['item'].tolist()==['juice','bread','milk'] and df['sales'].mean()==20 and df['sales'].max()==30
changed=df.copy();changed.loc[0,'sales']=42;assert changed['sales'].mean()==30 and changed['sales'].max()==42
csv=pd.read_csv(S/'datasets/school_store_fictional.csv');assert csv.shape==(10,5) and csv.isna().sum().sum()==0 and csv.duplicated().sum()==0
csv['revenue']=csv['sold']*csv['price'];g=csv.groupby('menu')[['sold','revenue']].sum()
assert g['sold'].to_dict()=={'김밥':131,'주스':86} and g['revenue'].to_dict()=={'김밥':458500,'주스':172000}
assert csv['sold'].sum()==217 and csv['revenue'].sum()==630500 and csv['sold'].mean()==21.7
assert csv.groupby('menu')['sold'].mean().to_dict()=={'김밥':26.2,'주스':17.2}
daily=csv.groupby(['day','rain'])['sold'].sum().reset_index();r=daily.groupby('rain')['sold'].agg(['count','mean'])
assert r['count'].to_dict()=={0:3,1:2} and r['mean'].to_dict()=={0:50,1:33.5}
for i,s in enumerate(p.e.scenes):
 assert not any(w in s['speech'] for w in ['합성','복제','재현','녹화','촬영','제작 과정'])
 assert len(s['code'].splitlines())<=16,(i,s['title'])
 for line in s['code'].splitlines():assert p.e.font(27,not bool(p.re.search('[가-힣]',line))).getlength(line)<980,(i,line)
 if s['kind'] in ['code','graph']:
  out,folder=p.run_program(s)
  if s.get('expectError'):assert s['expectError'] in out
  if s.get('chart'):assert (folder/'verified_graph.png').stat().st_size>10000 and (folder/'sales_summary.png').stat().st_size>10000
 c,o,n=p.visual(s);p.frame(s,i,len(p.e.scenes),c,o,n,len(c.splitlines()),0,.8)
print('PASS: lesson10 original code AST, ranking/index/source preservation, mean/max/changed values, CSV quality/groups/revenue/rain daily means, actual graph, expected error and all scene code/layout')
