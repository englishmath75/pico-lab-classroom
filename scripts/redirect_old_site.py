"""Add backwards-compatible navigation only to the legacy Pages build."""
import sys
from pathlib import Path

SCRIPT = '''<script id="sw-address-migration">
(()=>{
  const oldBase='/pico-lab-classroom/';
  if(location.hostname!=='englishmath75.github.io'||!location.pathname.startsWith(oldBase))return;
  const rest=location.pathname.slice(oldBase.length);
  const course='pandas-data-lab/';
  const next=rest.startsWith(course)?'/sw/'+rest.slice(course.length):
    (!rest||rest==='index.html'?'/sw/pico.html':'/sw/'+rest);
  // Only move when the destination is actually published; otherwise the old lesson stays usable.
  fetch(next,{method:'HEAD',cache:'no-cache',signal:AbortSignal.timeout(5000)})
    .then(response=>{if(response.ok)location.replace(next+location.search+location.hash);})
    .catch(()=>{});
})();
</script>'''

def inject(directory):
    count=0
    for page in Path(directory).rglob('*.html'):
        source=page.read_text(encoding='utf-8-sig')
        if 'id="sw-address-migration"' in source:
            continue
        if '</head>' in source:
            source=source.replace('</head>',SCRIPT+'</head>',1)
        elif '</body>' in source:
            source=source.replace('</body>',SCRIPT+'</body>',1)
        else:
            source+=SCRIPT
        page.write_text(source,encoding='utf-8')
        count+=1
    print(f'Legacy address migration added to {count} HTML pages')

if __name__=='__main__':inject(sys.argv[1])
