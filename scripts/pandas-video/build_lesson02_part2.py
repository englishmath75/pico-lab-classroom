"""Second episode, reusing the published lesson 2 renderer and audio/caption assembly."""
import json,re
from pathlib import Path
import build_lesson02 as engine
from PIL import ImageDraw

ROOT=engine.ROOT
engine.WORK=ROOT.parent/'production/lesson02-part2'
engine.OUT=engine.SITE/'videos/lesson02-part2'
engine.WORK.mkdir(parents=True,exist_ok=True);engine.OUT.mkdir(parents=True,exist_ok=True)
engine.scenes=json.loads((Path(__file__).with_name('lesson02-part2-scenes.json')).read_text())
for s in engine.scenes:
 if s['kind']=='syntax':s['correctionCode']=s['code'].replace('print(df.shape())',"print(df.shape)\nprint(df['price'].mean())")

def visual(s):
 if s['kind']=='question':out='영상을 멈추고\n먼저 답과 이유를 적으세요.'
 elif s['kind']=='answer':out='① 3행 그대로\n② Series\n③ 1500.0'
 else:out=engine.execute(s['code'])
 # The published layout has a dedicated 10-line output window. Clearly label excerpts.
 if len(out.splitlines())>9:
  out='[출력의 마지막 8줄]\n'+'\n'.join(out.splitlines()[-8:])
 return s['code'],out,s['note']
engine.visual=visual
base_frame=engine.frame

def frame(s,idx,total,code,output,note,shown,active,progress):
 if s['kind']=='syntax' and progress>.55:
  code=s['correctionCode'];output=engine.execute(code);shown=len(code.splitlines());active=len(code.splitlines())-1
 im=base_frame(s,idx,total,code,output,note,shown,active,progress);d=ImageDraw.Draw(im)
 d.rectangle((0,0,1920,128),fill='#102c3c');d.text((52,22),'2차시 2편 · 표 살펴보기와 평균 계산',font=engine.font(43),fill='white')
 d.text((54,82),'영수쌤의 데이터 분석 교실 · 소프트웨어와 생활',font=engine.font(24),fill='#e9c078')
 d.text((1220,84),'학습용 재현 장면 · 실제 녹화 아님',font=engine.font(25),fill='#ffd580')
 d.rounded_rectangle((1240,210,1877,470),radius=16,fill='white',outline='#d6e2e9',width=2)
 table=[['인덱스','item','price'],['0','A','1000'],['1','B','1500'],['2','C','3000' if s['kind']=='changed' else '2000']]
 label='매점 가격 · 3행 2열'
 if "print(df['price'])" in code and "head" not in code:
  table=[['인덱스','price'],['0','1000'],['1','1500'],['2','2000']];label='Series · 값 3개와 인덱스'
 if "print(df[['price']])" in code:
  table=[['인덱스','price'],['0','1000'],['1','1500'],['2','2000']];label='DataFrame · 3행 1열'
 d.text((1265,225),label,font=engine.font(24),fill='#173c4d')
 for r,row in enumerate(table):
  for c,v in enumerate(row):
   w=582//len(row);x=1260+c*w;y=272+r*44
   d.rectangle((x,y,x+w-9,y+41),fill='#e5f4f1' if r==0 else '#f3f7fa')
   d.text((x+12,y+4),v,font=engine.font(24),fill='#123b46')
 if s['kind'] in ['question','answer']:
  d.rectangle((60,218,1195,270),fill='#102633')
  d.text((66,227),'예측 문제 · 실행 코드 아님' if s['kind']=='question' else '정답 해설 · 실행 코드 아님',font=engine.font(24),fill='#9cded7')
  d.rectangle((1245,493,1870,540),fill='#102633')
  d.text((1263,500),'먼저 생각하기' if s['kind']=='question' else '정답과 해설',font=engine.font(24),fill='#9cded7')
 return im
engine.frame=frame
if __name__=='__main__':engine.build()
