"""Independent CPython/content audit of all 40 declared model answers.

Native Python and the checked-in Turtle shim are used, not a deployed website.
The prose-only q21/q24 explanations are reviewed explicitly, not auto-graded.
"""
import contextlib
import importlib
import io
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
Q = {q['id']: q for q in json.loads((ROOT/'mk/content/questions.json').read_text())}
sys.path.insert(0, str(ROOT/'mk/runtime'))
import turtle

checked = set()
def answer(n): return Q[f'q{n:02}']['expected']
def code(n): return Q[f'q{n:02}']['starter']
def run(source):
    env = {}; out = io.StringIO()
    with contextlib.redirect_stdout(out): exec(source, env)
    return out.getvalue(), env
def check(n, actual):
    assert actual == answer(n), (n, actual, answer(n))
    checked.add(n)

for n in [1,3,5,7,9,10,12,16,23,25,26,28,34]:
    check(n, run(code(n))[0].strip())
check(8, run(code(8))[0].strip().splitlines()[1])
check(29, ' '.join(run(code(29))[0].split()))
check(31, '/'.join(run(code(31))[0].splitlines()))
check(33, str(run(code(33))[0].split('[')[1].split('4')[0].count(' ')))
assert run('a=[10,20]\n'+answer(2))[1]['a'] == [10,20,30]; checked.add(2)
assert run('a=[10,20,30]\n'+answer(4))[1]['a'] == [20,30]; checked.add(4)
assert run('a=[10,20,30,40]\n'+answer(6))[1]['a'] == [10,20,30,'테스트']; checked.add(6)
assert run(code(11))[0] == 'None\n'; checked.add(11)
for n in [13,14,15,17,18]:
    importlib.reload(turtle)
    source=code(n)
    if n==14: source=source.replace('# 빈칸', answer(n))
    if n==15: source=source.replace('range(4)', 'range(3)')
    run(source)
    if n==13: assert turtle.heading()==90 and answer(n)=='위'
    elif n==14: assert turtle.position()==(100,100) and not turtle._commands
    elif n==15: assert len(turtle._commands)==3 and math.dist(turtle.position(),(0,0))>1 and answer(n)=='아니요'
    elif n==17: assert turtle.xcor()<0<turtle.ycor() and answer(n)=='왼쪽 위'
    else: assert turtle.pensize()==5 and turtle.heading()==0 and turtle.position()==(80,0) and answer(n)=='선 굵기'
    checked.add(n)
env=run(code(19))[1];check(19,f"{env['x'][1]} {env['y'][1]}")
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
env=run(code(20))[1]
try: plt.plot(env['x'],env['y'])
except ValueError: checked.add(20)
else: raise AssertionError('q20 must fail due to incompatible lengths')
shown=[]; original_show=plt.show
try:
    plt.show=lambda: shown.append(True)
    run(code(22).replace('# 빈칸',answer(22)))
    assert shown == [True]; checked.add(22)
finally:
    plt.show=original_show;plt.close('all')
# Category comparison and causation are conceptual questions, reviewed here.
assert answer(21)=='막대' and '범주별' in Q['q21']['explanation'];checked.add(21)
assert answer(24)=='아니요' and '원인을 증명' in Q['q24']['explanation'];checked.add(24)
output,env=run(code(27).replace('# 빈칸',answer(27)))
assert output=='1\n2\n3\n' and env['n']==4;checked.add(27)
for score,expected in [(79,False),(80,False),(81,True)]: assert eval(answer(30),{}, {'score':score})==expected
checked.add(30)
assert run(answer(32))[0] == run(code(32))[0] == '34\n';checked.add(32)
assert answer(35)=='num';checked.add(35) # fixed multiplier across one row
assert list(range(2,eval(answer(36),{}, {'end':4}))) == [2,3,4];checked.add(36)
assert not 2 <= 5 <= 3 <= 9 and answer(37)=='안내';checked.add(37)
check(38,f'{5-2} {2}')
assert run(answer(39))[0]=='\n';checked.add(39)
check(40,str(2*3-1))
assert checked == set(range(1,41)), checked
print('PASS 40 model answers reviewed: executable cases checked with CPython/Turtle/matplotlib; q21/q24/q35 prose reasoning reviewed')
