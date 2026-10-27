from pathlib import Path
import sys,json,ast,os,subprocess,hashlib
import pandas as pd
from PIL import Image
R=Path(__file__).resolve().parents[1];S=R/'public/pandas-data-lab';A=S/'first-analysis'
sys.path.insert(0,str(R/'scripts/pandas-video'));import build_first_analysis as v
source=(A/'analyze_festival.py').read_text();canonical=json.loads((R/'scripts/pandas-video/first-analysis-code.json').read_text())
assert source==canonical['canonicalSource']
for name,expected_hash in canonical['sourceInputs'].items():assert hashlib.sha256((A/name).read_bytes()).hexdigest()==expected_hash,(name,'source changed after scripting')
assert ast.dump(ast.parse(source))==ast.dump(ast.parse(canonical['formattedSource']))
for scene in v.e.scenes:
 assert not any(w in scene['speech'] for w in ['합성','복제','재현 장면','녹화','촬영','제작 과정'])
 assert len(scene['code'].splitlines())<=16,(scene['title'],'too many code lines')
 for line in scene['code'].splitlines():
  assert v.e.font(27,not bool(v.re.search('[가-힣]',line))).getlength(line)<980,(scene['title'],line)
 if scene['kind'] in ['code','graph']:v.visual(scene)
out,folder=v.run_program(canonical['formattedSource'])
raw=pd.read_csv(folder/'festival_orders.csv');clean=pd.read_csv(folder/'festival_clean.csv');excluded=pd.read_csv(folder/'excluded_orders.csv');summary=pd.read_csv(folder/'menu_summary.csv',index_col=0)
assert raw.shape==(16,5) and clean.shape==(12,6) and len(excluded)==3
assert set(excluded['order_id'])=={'O013','O014','O015'}
assert raw['order_id'].duplicated().sum()==1
assert clean['quantity'].sum()==30 and clean['revenue'].sum()==101000
assert summary['quantity'].to_dict()=={'Waffle':8,'Tteokbokki':10,'Lemonade':12}
assert summary['revenue'].to_dict()=={'Waffle':36000,'Tteokbokki':35000,'Lemonade':30000}
assert (folder/'festival_orders.csv').read_bytes()==(A/'festival_orders.csv').read_bytes()
for name in ['festival_clean.csv','excluded_orders.csv','menu_summary.csv']:
 pd.testing.assert_frame_equal(pd.read_csv(folder/name),pd.read_csv(A/'reference'/name))
with Image.open(folder/'festival_chart.png') as img:img.verify()
print('PASS: canonical AST, every filmed Python stage, CSV 16→15→12, excluded IDs, totals, graph and original preserved')
