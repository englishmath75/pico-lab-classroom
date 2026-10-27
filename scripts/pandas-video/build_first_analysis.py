"""Festival walkthrough reuses the existing narrated video assembly; all data outputs are executed."""
import json,os,re
from pathlib import Path
from PIL import Image,ImageDraw
import build_lesson02 as e
ROOT=e.ROOT
e.WORK=ROOT.parent/'production/first-analysis';e.OUT=e.SITE/'videos/first-analysis'
e.WORK.mkdir(parents=True,exist_ok=True);e.OUT.mkdir(parents=True,exist_ok=True)
e.scenes=json.loads(Path(__file__).with_name('first-analysis-scenes.json').read_text())
import subprocess,hashlib,shutil

def program(s):return s.get('runCode',s.get('prefix','')+'\n'+s['code'])
def run_program(code):
 data=(e.SITE/'first-analysis/festival_orders.csv').read_bytes()
 digest=hashlib.sha256(code.encode()+data).hexdigest()[:20]
 folder=e.WORK/'runs'/digest;folder.mkdir(parents=True,exist_ok=True)
 marker=folder/'execution.json'
 if marker.exists():return json.loads(marker.read_text())['stdout'].rstrip(),folder
 (folder/'festival_orders.csv').write_bytes(data)
 path=folder/'my_analysis.py';path.write_text(code)
 r=subprocess.run(['python3',str(path)],env={**os.environ,'MPLBACKEND':'Agg'},capture_output=True,text=True)
 if r.returncode:raise RuntimeError(r.stderr)
 marker.write_text(json.dumps({'returncode':r.returncode,'stdout':r.stdout,'codeSha256':hashlib.sha256(code.encode()).hexdigest()},ensure_ascii=False,indent=2))
 return r.stdout.rstrip(),folder

def visual(s):
 if s['kind'] in ['code','graph']:result,_=run_program(program(s))
 elif s['kind']=='question':result='먼저 정답과 근거를 적으세요.'
 elif s['kind']=='answer':result='레몬에이드 12개\n와플 36000원\n매출 = 수량 × 단가\n비용이 없어 이익은 확정 불가'
 else:result=''
 return s['code'],result,s['note']
e.visual=visual

def frame(s,idx,total,code,output,note,shown,active,progress):
 im=Image.new('RGB',(1920,1080),'#f1f6fa');d=ImageDraw.Draw(im)
 d.rectangle((0,0,1920,126),fill='#102c3c');d.text((48,20),'축제 간식 분석 · 전체 과정 따라 하기',font=e.font(43),fill='white')
 d.text((50,80),'영수쌤의 Python 교실 · 소프트웨어와 생활',font=e.font(25),fill='#a9d9d0')
 d.text((48,149),f'{idx+1:02} / {total:02}   '+s['title'],font=e.font(32),fill='#173c4d')
 d.rounded_rectangle((40,210,1110,884),radius=16,fill='#102633')
 label={'guide':'실습 순서','csv':'festival_orders.csv','question':'결과 예측 문제','answer':'정답과 해설'}.get(s['kind'],'Python 코드')
 if s['kind']=='guide' and s['dataset']=='columns':label='CSV 일부와 열 이름'
 d.text((64,228),label,font=e.font(25),fill='#a6d8d1')
 for n,line in enumerate(code.splitlines()[:16]):
  y=280+n*35
  if n==active:d.rounded_rectangle((54,y-2,1096,y+34),radius=5,fill='#285367')
  d.text((63,y),f'{n+1:2}',font=e.font(24,True),fill='#7998a9')
  d.text((113,y),line if n<shown or s['kind']!='code' else '',font=e.font(27,not bool(re.search('[가-힣]',line))),fill='#edf7f8')
 d.rounded_rectangle((1132,210,1880,438),radius=16,fill='white',outline='#d6e2e9',width=2)
 label='전체 분석 흐름'
 rows=[['단계','확인할 결과'],['원본','16행·5열'],['전처리','분석 대상 12건'],['분석','판매량·매출·그래프']]
 widths=[239,478]
 if s['dataset']=='columns':label='CSV 열의 의미';rows=[['열','뜻'],['order_id','고유 주문 번호'],['day','축제 며칠째'],['menu','메뉴 이름'],['quantity','주문 수량(개)'],['unit_price','개당 가격(원)']]
 if s['dataset']=='cleaning':label='전처리 흐름';rows=[['구분','행 수'],['원본','16'],['중복 제거 뒤','15'],['분석 제외','3'],['분석 사용','12']]
 if s['dataset']=='summary':
  label='분석 대상 12건의 메뉴별 합계';widths=[239,239,239];rows=[['메뉴','수량(개)','매출(원)'],['와플','8','36000'],['떡볶이','10','35000'],['레몬에이드','12','30000']]
 if s['dataset']=='files':label='생성할 결과 파일';widths=[480,237];rows=[['파일','내용'],['festival_clean.csv','정제 12건'],['excluded_orders.csv','제외 3건'],['menu_summary.csv','메뉴별 합계'],['festival_chart.png','비교 그래프']]
 d.text((1156,227),label,font=e.font(24),fill='#173c4d')
 rh=27 if len(rows)>5 else 32
 for j,row in enumerate(rows):
  x=1150
  for c,value in enumerate(row):
   y=268+j*rh;w=widths[c];d.rectangle((x,y,x+w-8,y+rh-3),fill='#e5f4f1' if j==0 else '#f3f7fa');d.text((x+10,y+1),value,font=e.font(23),fill='#123b46');x+=w
 d.rounded_rectangle((1132,456,1880,884),radius=16,fill='#102633')
 d.text((1156,474),'실행 결과' if s['kind']=='code' else '확인할 내용',font=e.font(25),fill='#a6d8d1')
 result=output if progress>.43 or s['kind']!='code' else '실행 전에 결과를 예측하세요.'
 if not result:result='아직 출력 명령이 없습니다.' if s['kind']=='code' else note
 lines=e.wrap(result,23,694)
 if len(lines)>10:lines=['[출력의 마지막 부분]']+lines[-9:]
 for n,line in enumerate(lines):d.text((1156,524+n*32),line,font=e.font(23,not bool(re.search('[가-힣]',line))),fill='#e5fbe8')
 if s['kind']=='graph':
  _,folder=run_program(program(s))
  with Image.open(folder/'festival_chart.png') as chart:
   chart.load();chart=chart.convert('RGB');chart.thumbnail((1810,674))
   d.rectangle((40,210,1880,884),fill='white')
   im.paste(chart,((1920-chart.width)//2,210+(674-chart.height)//2))
 d.rectangle((0,908,1920,1080),fill='#071b26')
 for n,line in enumerate(e.wrap(note,25,1816)[:2]):d.text((48,916+n*32),line,font=e.font(25),fill='#f5cc78')
 d.rectangle((0,1072,int(1920*progress),1080),fill='#36c5b5')
 return im

e.frame=frame
if __name__=='__main__':e.build()
