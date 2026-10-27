"""Verify teaching claims against real pandas; no media success is inferred."""
from pathlib import Path
import contextlib
import io
import json
import math
import pandas as pd

SITE = Path(__file__).resolve().parents[1] / 'public/pandas-data-lab'

def run(code):
    namespace = {}
    output = io.StringIO()
    with contextlib.redirect_stdout(output):
        exec(compile(code, 'pilot.py', 'exec'), namespace)
    return namespace, output.getvalue()

books = (SITE/'downloads/video_lesson02_books.py').read_text()
scores = (SITE/'downloads/video_lesson02_scores.py').read_text()
ns, output = run(books)
assert ns['df'].shape == (3, 2)
assert ns['df'].index.tolist() == [0, 1, 2]
assert isinstance(ns['df']['books'], pd.Series)
assert math.isclose(ns['df']['books'].mean(), 10/3)
pd.testing.assert_frame_equal(ns['df'], pd.read_csv(SITE/'datasets/video_lesson02_books.csv'))
changed, _ = run(books.replace('[3, 5, 2]', '[3, 5, 4]'))
assert changed['df']['books'].mean() == 4.0
ns, output = run(scores)
assert output.strip() == '80.0'
pd.testing.assert_frame_equal(ns['df'], pd.read_csv(SITE/'datasets/video_lesson02_scores.csv'))
changed, output = run(scores.replace('[70, 80, 90]', '[70, 80, 100]'))
assert math.isclose(changed['df']['score'].mean(), 250/3)
ns['df'].index = [1, 2, 3]
assert ns['df'].shape == (3, 1) and ns['df']['score'].mean() == 80.0
try:
    run(scores.replace("['score'].mean()", "['Score'].mean()"))
except KeyError:
    pass
else:
    raise AssertionError('Expected KeyError for wrong column case')
try:
    run(scores.replace('DataFrame', 'Dataframe'))
except AttributeError:
    pass
else:
    raise AssertionError('Expected AttributeError for wrong constructor case')
_, output = run(scores.replace('.mean()', '.mean'))
assert 'bound method' in output and output.strip() != '80.0'
media=json.loads((SITE/'lesson-videos.json').read_text())['lessons']
assert any(m['lesson']==2 for m in media)
for key in ['src','captions']:assert (SITE/media[0][key]).is_file()
print('PASS: pilot examples, CSV equality, changed values, shape/index, real error cases; registered media count = 1 (decode checks recorded separately)')
