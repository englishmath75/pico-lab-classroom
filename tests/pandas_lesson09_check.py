from pathlib import Path
import sys,json,ast,math
import pandas as pd
R=Path(__file__).resolve().parents[1];S=R/'public/pandas-data-lab'
sys.path.insert(0,str(R/'scripts/pandas-video'));import build_lesson09 as p
base=(S/'downloads/lesson_09.py').read_text();ns={};exec(base,ns);df=ns['df']
assert df.shape==(2,2) and df['year'].tolist()==[2023,2024]
assert df['population'].diff().iloc[-1]==-50
assert math.isclose(df['population'].pct_change().iloc[-1]*100,-5)
assert df['population'].diff().isna().tolist()==[True,False]
assert df['population'].pct_change().isna().tolist()==[True,False]
assert ast.dump(ast.parse(base))==ast.dump(ast.parse(p.e.scenes[10]['code']))
chart=p.e.scenes[22]
prefix='\n'.join(p.e.scenes[20]['code'].splitlines()[:6])
assert ast.dump(ast.parse(prefix+'\n'+chart['code']))==ast.dump(ast.parse(chart['runCode']))
inc=pd.Series([1000,1100]);assert inc.diff().iloc[-1]==100 and math.isclose(inc.pct_change().iloc[-1]*100,10)
assert (pd.Series([950,150])-pd.Series([1000,200])).tolist()==[-50,-50]
assert ((pd.Series([950,150])-pd.Series([1000,200]))/pd.Series([1000,200])*100).tolist()==[-5,-25]
reverse=df.iloc[::-1];assert reverse['population'].diff().iloc[-1]==50 and round(reverse['population'].pct_change().iloc[-1]*100,2)==5.26
assert round(reverse.sort_values('year')['population'].pct_change().iloc[-1]*100,2)==-5
assert math.isinf(pd.Series([0,10]).pct_change(fill_method=None).iloc[-1])
csv=pd.read_csv(S/'datasets/population_fictional.csv');assert csv.shape==(9,3)
csv=csv.sort_values(['region','year']);g=csv.groupby('region')['population_thousand'];csv['change']=g.diff();csv['rate_pct']=g.pct_change(fill_method=None)*100
assert csv['change'].isna().sum()==3
latest=csv[csv['year']==2024].set_index('region')
assert latest['change'].to_dict()=={'가람시':-6,'누리시':4,'하람군':-5}
assert latest['rate_pct'].round(2).to_dict()=={'가람시':-1.21,'누리시':1.27,'하람군':-4.03}
assert latest['change'].idxmin()=='가람시' and latest['rate_pct'].idxmin()=='하람군'
for i,s in enumerate(p.e.scenes):
 assert not any(w in s['speech'] for w in ['합성','복제','재현','녹화','촬영','제작 과정'])
 assert len(s['code'].splitlines())<=16,(i,s['title'])
 for line in s['code'].splitlines():assert p.e.font(27,not bool(p.re.search('[가-힣]',line))).getlength(line)<980,(i,line)
 if s['kind'] in ['code','graph']:
  out,folder=p.run_program(s)
  if s.get('expectError'):assert s['expectError'] in out
  if s.get('chart'):assert (folder/'verified_graph.png').stat().st_size>10000 and (folder/'population_change.png').stat().st_size>10000
 c,o,n=p.visual(s);p.frame(s,i,len(p.e.scenes),c,o,n,len(c.splitlines()),0,.8)
print('PASS: lesson 9 basic code AST, diff/rates/NaN, altered values, denominators, order, zero baseline, expected error, region CSV units/groups/latest, actual PNG and all scene code/layout')
