"""Trusted fixtures only. Host reference tests are NOT browser acceptance PASS."""
import sys,importlib.util,json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'datalab/public/runtime'))
spec=importlib.util.spec_from_file_location('adapter',root/'datalab/public/runner.py');adapter=importlib.util.module_from_spec(spec);spec.loader.exec_module(adapter)
f=root/'tests/integration-fixtures';results=[]
for name in ['01_variables.py','02_alias_copy.py','03_nested_cycle.py','04_collections.py','05_for_if_break_continue.py','06_while.py','07_multiline.py','08_function_frame.py','09_expected_runtime_error.py','10_expected_syntax_error.py','11_input.py','14_turtle_steps.py','15_turtle_mandala.py','16_turtle_four.py','17_turtle_style_clear.py','18_random_replay.py','21_long_finite_trace.py','23_text_not_html.py','25_import_only.py']:
 if not (f/name).exists():
  print('missing',name);continue
 r=adapter._run((f/name).read_text(),['민지','17'],True)
 if not name.startswith(('09','10')):assert not r['error'],(name,r['error'])
 if r['events']:
  assert r['events'][0]['stdout']=='',name
  assert not r['events'][0]['drawing']['pens'],name
  assert r['events'][0]['imageIds']==[],name
 if name.startswith('01'):assert r['events'][-1]['globals']['x']==15 and 'name' not in r['events'][-1]['globals']
 if name.startswith('02'):
  g=r['events'][-1]['globals'];assert g['books']==g['same'] and g['copy']!=g['books']
 if name.startswith('05'):assert r['stdout']=='5\n통과\n'
 if name.startswith('14'):
  p=r['drawing']['pens'][0];assert abs(p['x']-100)<1e-6 and abs(p['y']-80)<1e-6
 if name.startswith('15'):assert len(r['drawing']['arcs'])==36 and r['drawing']['background']=='black'
 if name.startswith('16'):assert len(r['drawing']['pens'])==4
 results.append({'fixture':name,'environment':'host CPython reference adapter','status':'PASS','events':len(r['events']),'traceLimited':r['traceLimited'],'error':r['error'] and r['error']['name']})
r=adapter._run('total=0\nfor i in range(10000):\n    total+=i\nprint(total)',[],True)
assert r['stdout']=='49995000\n' and r['traceLimited'] and not r['error']
results.append({'fixture':'long-finite-10000','status':'PASS','stdout':r['stdout'],'traceLimited':True})
(root/'evidence/integration-20261107/host-reference.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print('Host reference assertions passed:',len(results))
