"""Run: python tests/pandas_classroom_check.py (requires pandas and matplotlib)."""
import contextlib
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import zipfile
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'public/pandas-data-lab'
os.environ['MPLBACKEND'] = 'Agg'
import matplotlib.pyplot as plt

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids, self.links = [], []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.append(a['id'])
        for key in ('href', 'src'):
            if key in a:
                self.links.append(a[key])

pages = {p: Page(p.read_text()) for p in SITE.glob('*.html')}
for path, page in pages.items():
    assert len(page.ids) == len(set(page.ids)), f'Duplicate IDs: {path}'
    for href in page.links:
        u = urlsplit(href)
        if u.scheme or u.netloc or u.path.startswith('/'):
            continue
        target = (path.parent / unquote(u.path)).resolve() if u.path else path
        if target.is_dir():
            target /= 'index.html'
        assert target.exists(), f'Missing link: {path.name}: {href}'
        if u.fragment and target in pages:
            assert unquote(u.fragment) in pages[target].ids, f'Missing anchor: {href}'

for path in SITE.glob('*.js'):
    subprocess.run(['node', '--check', str(path)], check=True, capture_output=True)
script = "const fs=require('fs'),vm=require('vm');const c={window:{}};vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),c);process.stdout.write(JSON.stringify(c.window.COURSE_LESSONS));"
lessons = json.loads(subprocess.check_output(['node', '-e', script, str(SITE/'course-data.js')]))
assert len(lessons) == 10
assert sum(len(l['quiz']) for l in lessons) == 20
with tempfile.TemporaryDirectory() as folder:
    for csv in (SITE/'datasets').glob('*.csv'):
        shutil.copy(csv, folder)
    before = Path.cwd()
    os.chdir(folder)
    try:
        for i, lesson in enumerate(lessons, 1):
            code = ''
            assert len(lesson['steps']) == 5
            for step in lesson['steps']:
                code += step['append'] + '\n'
                output = io.StringIO()
                plt.close('all')
                with contextlib.redirect_stdout(output):
                    exec(compile(code, f'lesson_{i}.py', 'exec'), {'__name__': '__main__'})
                actual = output.getvalue().strip() or '오류 없이 실행됩니다. 아직 print 출력은 없습니다.'
                if step['plot']:
                    assert plt.get_fignums(), f'Lesson {i}: missing plot'
                    actual += '\n[꺾은선그래프가 표시됩니다.]'
                assert actual == step['expected'], f'Lesson {i}: output mismatch\n{actual}'
            assert code == lesson['fullCode'], f'Lesson {i}: full code differs'
            assert code == (SITE/f'downloads/lesson_{i:02}.py').read_text()
            for q in lesson['quiz']:
                assert 0 <= q[2] < len(q[1]) and q[3]
    finally:
        os.chdir(before)
        plt.close('all')
with zipfile.ZipFile(SITE/'downloads/classroom-python-files.zip') as z:
    for file in (SITE/'downloads').glob('*.py'):
        assert z.read(file.name) == file.read_bytes()
    for file in (SITE/'datasets').glob('*.csv'):
        assert z.read(file.name) == file.read_bytes()
print('PASS: links/anchors, JavaScript syntax, 50 cumulative Python runs, 20 quiz definitions, downloadable files')
