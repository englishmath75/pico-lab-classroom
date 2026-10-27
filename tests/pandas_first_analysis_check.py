"""Verify the downloadable walkthrough and both homework variations with real Python."""
from pathlib import Path
from html.parser import HTMLParser
import os
import subprocess
import tempfile
import zipfile
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'public/pandas-data-lab'
ASSETS = SITE / 'first-analysis'

class Snippets(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.collect = False
        self.blocks = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        if tag == 'code' and 'data-python-block' in dict(attrs):
            self.collect = True
            self.blocks.append('')

    def handle_endtag(self, tag):
        if tag == 'code':
            self.collect = False

    def handle_data(self, data):
        if self.collect:
            self.blocks[-1] += data

source = (ASSETS / 'analyze_festival.py').read_text()
blocks = Snippets((SITE / 'first-analysis.html').read_text()).blocks
assert len(blocks) == 6
assert ''.join(blocks) == source, 'Visible code must match the downloadable Python file'
with zipfile.ZipFile(ASSETS / 'festival_first_analysis.zip') as archive:
    for name in ['festival_orders.csv', 'analyze_festival.py', 'analysis_note.txt', 'README.txt']:
        assert archive.read('festival_first_analysis/' + name) == (ASSETS/name).read_bytes()

with tempfile.TemporaryDirectory() as work:
    folder = Path(work)
    original = (ASSETS/'festival_orders.csv').read_bytes()
    (folder/'festival_orders.csv').write_bytes(original)
    variants = [
        source,
        source.replace("sort_values('revenue'", "sort_values('quantity'"),
        source.replace("groupby('menu')", "groupby('day')"),
    ]
    for i, code in enumerate(variants):
        script = folder/'my_analysis.py'
        script.write_text(code)
        # Run outside the source directory: file lookup must still work.
        run = subprocess.run(['python', str(script)], cwd=ROOT, env={**os.environ, 'MPLBACKEND': 'Agg'}, capture_output=True, text=True, check=True)
        clean = pd.read_csv(folder/'festival_clean.csv')
        excluded = pd.read_csv(folder/'excluded_orders.csv')
        summary = pd.read_csv(folder/'menu_summary.csv', index_col=0)
        assert len(clean) == 12 and len(excluded) == 3
        assert clean['order_id'].is_unique
        assert clean['quantity'].sum() == 30
        assert clean['revenue'].sum() == 101000
        assert set(excluded['order_id']) == {'O013', 'O014', 'O015'}
        assert (folder/'festival_orders.csv').read_bytes() == original
        assert (folder/'festival_chart.png').read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
        if i == 0:
            assert summary['revenue'].to_dict() == {'Waffle': 36000, 'Tteokbokki': 35000, 'Lemonade': 30000}
            assert '수량 결측: 2 행' in run.stdout
            for name in ['festival_clean.csv', 'excluded_orders.csv', 'menu_summary.csv']:
                pd.testing.assert_frame_equal(pd.read_csv(folder/name), pd.read_csv(ASSETS/'reference'/name))
        elif i == 1:
            assert summary.index.tolist() == ['Lemonade', 'Tteokbokki', 'Waffle']
        else:
            assert summary['revenue'].to_dict() == {4: 30500, 3: 27000, 2: 24500, 1: 19000}
print('PASS: six visible code blocks, ZIP contents, original preserved, cleaning, aggregation, PNG output and two homework variations')
