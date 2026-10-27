"""Lesson 6 reuses the existing narrated video assembly; all data outputs are executed."""
import json,os,re
from pathlib import Path
from PIL import Image,ImageDraw
import build_lesson02 as e
ROOT=e.ROOT
e.WORK=ROOT.parent/'production/lesson06';e.OUT=e.SITE/'videos/lesson06'
e.WORK.mkdir(parents=True,exist_ok=True);e.OUT.mkdir(parents=True,exist_ok=True)
e.scenes=json.loads(Path(__file__).with_name('lesson06-scenes.json').read_text())
execute=e.execute
def run(code):
 old=os.getcwd()
 try:
  os.chdir(e.SITE/'datasets');return execute(code)
 finally:os.chdir(old)
e.execute=run

def visual(s):
 if s['kind']=='guide':result='';code=s['code']
 elif s['kind']=='csv':result='데이터 8행 · 6열\n첫 줄은 열 이름';code=s['code']
 elif s['kind']=='question':result='먼저 답과 이유를 적으세요.';code=s['code']
 elif s['kind']=='answer':result='15.0\n결측이 아닌 값의 개수\ncount = 1 / size = 2\n평균만으로 합계를 단정하지 않기';code=s['code']
 else:code=s['code'];result=run(code)
 return code,result,s['note']
e.visual=visual

def frame(s,idx,total,code,output,note,shown,active,progress):
 im=Image.new('RGB',(1920,1080),'#f1f6fa');d=ImageDraw.Draw(im)
 d.rectangle((0,0,1920,126),fill='#102c3c');d.text((48,20),'6차시 · groupby로 팀별 평균 비교',font=e.font(43),fill='white')
 d.text((50,80),'영수쌤의 Python 교실 · 소프트웨어와 생활',font=e.font(25),fill='#a9d9d0')
 d.text((48,149),f'{idx+1:02} / {total:02}   '+s['title'],font=e.font(32),fill='#173c4d')
 d.rounded_rectangle((40,210,1110,884),radius=16,fill='#102633')
 label={'guide':'실습 순서','csv':'sports_fictional.csv','question':'결과 예측 문제','answer':'정답과 해설'}.get(s['kind'],'Python 코드')
 d.text((64,228),label,font=e.font(25),fill='#a6d8d1')
 for n,line in enumerate(code.splitlines()[:16]):
  y=280+n*35
  if n==active:d.rounded_rectangle((54,y-2,1096,y+34),radius=5,fill='#285367')
  d.text((63,y),f'{n+1:2}',font=e.font(24,True),fill='#7998a9')
  d.text((113,y),line if n<shown or s['kind']!='code' else '',font=e.font(27,not bool(re.search('[가-힣]',line))),fill='#edf7f8')
 d.rounded_rectangle((1132,210,1880,438),radius=16,fill='white',outline='#d6e2e9',width=2)
 d.text((1156,227),'스포츠 CSV · 확장 자료' if s['dataset']=='csv' else '입력 자료 · 한 선수당 한 행',font=e.font(24),fill='#173c4d')
 rows=[['인덱스','team','points'],['0','A','10'],['1','A','20'],['2','B','15'],['3','B','25']]
 if s['dataset']=='changed':rows[-1][-1]='35'
 if s['dataset']=='missing':rows[2][-1]='결측'
 if s['dataset']=='unequal':rows=[['인덱스','team','points'],['0','A','30'],['1','B','10'],['2','B','20'],['3','B','30']]
 if s['dataset']=='csv':rows=[['팀','기록 수','득점 합계'],['파랑','4','66'],['빨강','4','60'],['전체','8','126']]
 for j,row in enumerate(rows):
  for c,value in enumerate(row):
   x=1150+c*239;y=268+j*32;d.rectangle((x,y,x+231,y+29),fill='#e5f4f1' if j==0 else '#f3f7fa');d.text((x+12,y+3),value,font=e.font(24),fill='#123b46')
 d.rounded_rectangle((1132,456,1880,884),radius=16,fill='#102633')
 d.text((1156,474),'실행 결과' if s['kind']=='code' else '확인할 내용',font=e.font(25),fill='#a6d8d1')
 result=output if progress>.43 or s['kind']!='code' else '실행 전에 결과를 예측하세요.'
 if not result:result='아직 출력 명령이 없습니다.' if s['kind']=='code' else note
 lines=e.wrap(result,23,694)
 if len(lines)>10:lines=['[출력의 마지막 부분]']+lines[-9:]
 for n,line in enumerate(lines):d.text((1156,524+n*32),line,font=e.font(23,not bool(re.search('[가-힣]',line))),fill='#e5fbe8')
 d.rectangle((0,908,1920,1080),fill='#071b26')
 for n,line in enumerate(e.wrap(note,25,1816)[:2]):d.text((48,916+n*32),line,font=e.font(25),fill='#f5cc78')
 d.rectangle((0,1072,int(1920*progress),1080),fill='#36c5b5')
 return im

e.frame=frame
if __name__=='__main__':e.build()
