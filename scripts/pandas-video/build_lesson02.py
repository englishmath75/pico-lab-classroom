"""Pandas teaching animation. Reuses Arduino render.py's ffconcat/frame-aligned FFmpeg assembly.
Reconstructed UI is explicitly labelled; output is captured from real pandas execution.
"""
from pathlib import Path
import asyncio,contextlib,io,json,math,re,subprocess,textwrap,hashlib,wave
from PIL import Image,ImageDraw,ImageFont
import edge_tts,edge_tts.communicate

ROOT=Path(__file__).resolve().parents[2]
SITE=ROOT/'public/pandas-data-lab'
WORK=ROOT.parent/'production/lesson02'
OUT=SITE/'videos/lesson02'
WORK.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
FONT='/root/.local/share/fonts/NotoSansCJKkr-Regular.otf'
MONO='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
VOICE='ko-KR-SunHiNeural'
# Use the installed system trust store; TLS certificate verification remains enabled.
edge_tts.communicate._SSL_CTX.load_verify_locations('/etc/ssl/certs/ca-certificates.crt')

def probe(path):return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)]))
def duration(path):return float(probe(path)['format']['duration'])
def execute(code):
 out=io.StringIO()
 with contextlib.redirect_stdout(out):
  try:exec(compile(code,'lesson02.py','exec'),{})
  except Exception as e:print(type(e).__name__+': '+str(e))
 return out.getvalue().rstrip()
BOOKS=(SITE/'downloads/video_lesson02_books.py').read_text()
SCORES=(SITE/'downloads/video_lesson02_scores.py').read_text()
sections=re.split(r'(?m)^## 장면 ',(ROOT/'docs/video-production/lesson02-script.md').read_text())[1:]
scenes=[]
for block in sections:
 n=int(block.split(' · ')[0]);title=block.split('\n')[0].split(' · ')[-1]
 for j,line in enumerate(re.findall(r'(?m)^(?:정답 )?음성: “(.+?)”',block)):
  scenes.append({'original':n,'title':title if j==0 else '확인 문제 해설','speech':line,'pause':15 if n in [6,9,11] or (n==14 and j==0) else 2})
# Explicitly present limitations and the distinction between reconstructed screen and captured output.
scenes.insert(0,{'original':0,'title':'수업 화면 안내','speech':'이 영상의 코드 입력과 편집기 화면은 학습을 위한 재현 장면입니다. 실제 웹브라우저나 비주얼 스튜디오 코드의 연속 화면 녹화가 아닙니다. 화면의 실행 결과는 영상 제작 과정에서 실제 파이썬과 판다스로 실행해 확인했습니다. 한국어 해설은 기본 합성 음성이며 선생님의 목소리를 복제하지 않았습니다. 영상을 멈추고 기존 수업 웹앱에서 같은 코드를 직접 실행하세요.','pause':2})
vs=[
('같은 코드를 VS Code에서 실행하기','이제 같은 코드를 비주얼 스튜디오 코드에서도 실행하는 방법을 살펴보겠습니다. 이 장면은 사용 순서를 재현한 안내 화면입니다. 실제 비주얼 스튜디오 코드에서 촬영한 화면이 아닙니다. 학교 컴퓨터에 파이썬과 확장 기능이 준비되어 있는지 먼저 선생님과 확인하세요. 웹 실습에서 파이썬 파일 저장을 누르면 현재 입력한 코드를 파일로 내려받습니다. 독서량 코드는 lesson02_books 점 파이로 구분해서 저장하겠습니다.'),
('폴더와 Python 환경 확인','비주얼 스튜디오 코드에서 파일, 폴더 열기를 선택하고 수업 폴더를 엽니다. 저장한 파이썬 파일을 열어 첫 줄부터 마지막 줄까지 코드가 같은지 확인합니다. 파이썬 인터프리터 선택에서 수업용 파이썬을 고릅니다. pandas가 없다는 오류가 나면 터미널에서 화면의 설치 명령을 실행합니다. 설치 권한이 필요한 학교 컴퓨터에서는 선생님께 문의하세요. CSV 파일은 오늘의 직접 생성 코드에는 필요하지 않습니다.'),
('터미널 출력 비교','터미널에서 파이썬, 파일 이름을 입력해 실행합니다. 독서량 파일의 표와 평균은 웹 실습에서 본 결과와 같아야 합니다. 점수 파일에서는 평균 80 점 영을 확인합니다. 명령이 인식되지 않거나 파일을 찾지 못하면 인터프리터와 현재 폴더, 파일 이름을 확인하세요. 영상의 터미널 결과는 실제 파이썬 실행값을 바탕으로 재현했으며, 이 환경에서 비주얼 스튜디오 코드 자체를 실행한 것은 아닙니다. 두 환경에서 실행하는 원리는 같습니다.')]
idx=next(i for i,s in enumerate(scenes) if s['original']==14)
for title,speech in reversed(vs):scenes.insert(idx,{'original':18,'title':title,'speech':speech,'pause':6})
# Replace interaction descriptions that would falsely imply a live recording.
for s in scenes:
 s['speech']=s['speech'].replace('화면의 차시별 실습에서 2차시를 엽니다.','여러분의 웹앱에서 차시별 실습의 2차시를 엽니다.')
 s['speech']=s['speech'].replace('이것은 df에서','이것은 디에프에서')

def visual(s):
 n=s['original']; code=BOOKS;output='';note='행 3개 · 열 2개 · 인덱스 0, 1, 2'
 if n==3:code='import pandas as pd';note='pd는 pandas의 별칭';output=execute(code)
 if n==4:code='import pandas as pd\n\ndata = {\n    \'name\': [\'A\', \'B\', \'C\'],\n    \'books\': [3, 5, 2]\n}';note='열 이름 : 같은 길이의 값 목록'
 if n in [5,6]:code=BOOKS.rsplit("print(df['books'].mean())",1)[0];output=execute(code)
 if n==7:code=BOOKS.replace("print(df['books'].mean())","print(df['books'])");output=execute(code);note="df['books'] → 한 열의 Series"
 if n==8:output=execute(code);note='(3 + 5 + 2) / 3 = 3.333…'
 if n==9:code=BOOKS.replace('[3, 5, 2]','[3, 5, 4]');output=execute(code);note='값 수정: 2 → 4 / 평균: 4.0'
 if n in [10,11,12]:code=SCORES;output=execute(code);note='점수 3행 · 1열 / 평균 80.0'
 if n==11:code=SCORES.replace('[70, 80, 90]','[70, 80, 100]');output=execute(code);note='90 → 100 / 평균 83.333…'
 if n==12:code=SCORES.replace("['score'].mean()","['Score'].mean()");output=execute(code);note='열 이름은 대소문자를 구별합니다.'
 if n==13:code='name,books\nA,3\nB,5\nC,2';output='CSV 구조 확인\n데이터 3행 · 2열\n\n이 차시 코드는 표를 직접 생성합니다.\nCSV 읽기는 다음 차시에서 배웁니다.';note='확장 자료: video_lesson02_books.csv'
 if n==18:code=BOOKS;output='$ python -m pip install pandas\n$ python lesson02_books.py\n'+execute(BOOKS)+'\n\n$ python lesson02_scores.py\n'+execute(SCORES);note='VS Code 사용 순서 재현 / 실행값은 실제 Python 검증'
 if n==14:
  code="질문 1  독서량 표의 df.shape는?\n\n질문 2  books 열의 평균 명령은?\n\n질문 3  인덱스만 바꾸면 평균은?"
  output='먼저 예측하세요.\n영상을 일시정지하세요.'
  if s['title']=='확인 문제 해설':output="① (3, 2)\n② df['books'].mean()\n③ 평균과 표 크기는 그대로"
  note='정답을 보기 전에 이유까지 설명하기'
 if n==15:code="df['price']\n\n(1000 + 1500 + 2000) / 3";output='Series\n\n1500.0';note='기존 차시 확인 문제와 연결'
 if n==16:code='실행 결과 해석 → 오류 해결 기록\n\n현재 코드 → .py 저장\n\n학습 기록 → JSON 백업';output='브라우저 저장과 파일 저장은 다릅니다.\n자동으로 선생님께 제출되지 않습니다.';note='개인정보 없이 개념과 오류 원인 기록'
 if n in [0,1,2,17]:output=execute(BOOKS)
 return code,output,note

async def synth(i,s,sem):
 async with sem:
  mp3=WORK/f'audio-{i:02}.mp3';meta=WORK/f'audio-{i:02}.json'
  if mp3.exists() and meta.exists():return
  events=[]
  communicate=edge_tts.Communicate(s['speech'],VOICE,rate='-8%',boundary='WordBoundary',connect_timeout=15,receive_timeout=60)
  with mp3.open('wb') as f:
   async for chunk in communicate.stream():
    if chunk['type']=='audio':f.write(chunk['data'])
    elif chunk['type']=='WordBoundary':events.append({k:chunk[k] for k in ['offset','duration','text']})
  meta.write_text(json.dumps(events,ensure_ascii=False));print('VOICE',i,round(duration(mp3),2),flush=True)
async def voices():
 sem=asyncio.Semaphore(3)
 await asyncio.gather(*(synth(i,s,sem) for i,s in enumerate(scenes)))

FONTS={}
def font(size,mono=False):
 key=(size,mono)
 if key not in FONTS:FONTS[key]=ImageFont.truetype(MONO if mono else FONT,size)
 return FONTS[key]
def wrap(text,size,width,mono=False):
 f=font(size,mono);rows=[]
 for para in text.split('\n'):
  row=''
  for c in para:
   if f.getlength(row+c)>width:rows.append(row);row=c
   else:row+=c
  rows.append(row)
 return rows

def frame(s,idx,total,code,output,note,shown,active,progress):
 if s['original']==12 and progress>.35:
  code=SCORES.replace('DataFrame','Dataframe') if progress<.65 else SCORES.replace('.mean()','.mean')
  output=execute(code)
 im=Image.new('RGB',(1920,1080),'#f1f6fa');d=ImageDraw.Draw(im)
 d.rectangle((0,0,1920,128),fill='#102c3c');d.text((52,22),'2차시 · 처음 배우는 Pandas와 DataFrame',font=font(43),fill='white')
 d.text((54,82),'소프트웨어와 생활 · 3단원',font=font(24),fill='#9cded7')
 d.text((1220,84),'학습용 재현 장면 · 실제 녹화 아님',font=font(25),fill='#ffd580')
 d.text((52,151),f'{idx+1:02d} / {total:02d}   '+s['title'],font=font(32),fill='#173c4d')
 d.rounded_rectangle((42,210,1216,875),radius=16,fill='#102633')
 d.text((66,227),'코드 입력 재현' if s['original']!=13 else '가상 CSV 구조',font=font(24),fill='#9cded7')
 lines=code.splitlines();y=280
 for n,line in enumerate(lines[:16]):
  if n==active:d.rounded_rectangle((59,y-2,1200,y+37),radius=5,fill='#285367')
  d.text((68,y),f'{n+1:2d}',font=font(25,True),fill='#7998a9')
  txt=line if n<shown else ''
  # Text containing Korean uses the Korean font; Python code uses a monospaced font.
  d.text((126,y),txt,font=font(29,not bool(re.search('[가-힣]',txt))),fill='#edf7f8')
  y+=35
 if s['original']==18:d.text((67,842),'수업 폴더 → 파일 열기 → 인터프리터 → 터미널 실행',font=font(23),fill='#9cded7')
 d.rounded_rectangle((1240,210,1877,470),radius=16,fill='white',outline='#d6e2e9',width=2)
 d.text((1265,225),'표의 구조',font=font(26),fill='#173c4d')
 vals=[['인덱스','name','books'],['0','A','3'],['1','B','5'],['2','C','4' if s['original']==9 else '2']]
 if s['original'] in [10,11,12]:vals=[['인덱스','score'],['0','70'],['1','80'],['2','100' if s['original']==11 else '90']]
 for r,row in enumerate(vals):
  for c,v in enumerate(row):
   width=582//len(row);x=1260+c*width;y2=272+r*44
   d.rectangle((x,y2,x+width-9,y2+41),fill='#e5f4f1' if r==0 else '#f3f7fa')
   d.text((x+12,y2+4),v,font=font(24),fill='#123b46')
 d.rounded_rectangle((1240,487,1877,875),radius=16,fill='#102633');d.text((1263,500),'Python 실제 실행값 · 재현 표시',font=font(24),fill='#9cded7')
 y=550
 result=output if progress>.48 or s['original'] in [0,1,2,13,14,15,16,17,18] else '실행 전에 결과를 예측하세요.'
 for line in wrap(result,24,584):
  if y>844:break
  d.text((1264,y),line,font=font(24,not bool(re.search('[가-힣]',line))),fill='#e5fbe8');y+=32
 d.rectangle((0,900,1920,1080),fill='#071b26')
 d.text((48,910),note,font=font(26),fill='#f5cc78')
 d.rectangle((0,1072,int(1920*progress),1080),fill='#36c5b5')
 return im

def timestamp(t,comma=False):
 ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);sec,ms=divmod(ms,1000)
 return f'{h:02}:{m:02}:{sec:02}{"," if comma else "."}{ms:03}'

def build():
 asyncio.run(voices());timeline=[];cues=[];concat=['ffconcat version 1.0'];audio=[];clock=0
 for i,s in enumerate(scenes):
  mp3=WORK/f'audio-{i:02}.mp3';length=duration(mp3);span=math.ceil((length+s['pause'])*30)/30
  s.update(start=clock,duration=span,audioDuration=length)
  code,out,note=visual(s);s.update(code=code,output=out,note=note)
  # Reuse Arduino FFmpeg ffconcat, integer-frame scene boundaries and independent audio assembly.
  events=json.loads((WORK/f'audio-{i:02}.json').read_text());group=[]
  for event in events:
   group.append(event)
   if len(' '.join(e['text'] for e in group))>=35 or event is events[-1]:
    a=clock+group[0]['offset']/1e7;b=clock+(group[-1]['offset']+group[-1]['duration'])/1e7
    cues.append((a,min(clock+length,b),' '.join(e['text'] for e in group)));group=[]
  # Add an explicit practice cue during the silent work interval.
  if s['pause']>=6:cues.append((clock+length,clock+span,'일시정지하고 직접 실습하세요. 완료한 뒤 재생합니다.'))
  frames=max(8,min(36,len(code.splitlines())*3));pieces=[]
  for k in range(frames):
   t=k/frames;shown=min(len(code.splitlines()),max(1,int(t*len(code.splitlines())*2.3)+1));active=min(len(code.splitlines())-1,max(0,shown-1))
   path=WORK/f'frame-{i:02}-{k:02}.png';frame(s,i,len(scenes),code,out,note,shown,active,t).save(path)
   concat += [f"file '{path.as_posix()}'",'option framerate 30',f'duration {span/frames:.9f}']
  timeline.append(s);clock+=span
 concat += [concat[-3],'option framerate 30']
 (WORK/'scenes.ffconcat').write_text('\n'.join(concat)+'\n');(WORK/'audio.ffconcat').write_text('\n'.join(audio)+'\n')
 (OUT/'timeline.json').write_text(json.dumps({'voice':VOICE,'aiGeneratedVoice':True,'visualMode':'reconstruction','scenes':timeline},ensure_ascii=False,indent=2)+'\n')
 vtt='WEBVTT\n\n'+'\n\n'.join(timestamp(a)+' --> '+timestamp(b)+'\n'+text for a,b,text in cues)+'\n'
 (OUT/'captions.vtt').write_text(vtt)
 srt='\n\n'.join(str(i+1)+'\n'+timestamp(a,True)+' --> '+timestamp(b,True)+'\n'+text for i,(a,b,text) in enumerate(cues))+'\n';(OUT/'captions.srt').write_text(srt)
 # Burn accurate, audio-derived Korean subtitles in the dedicated bottom band as well as provide VTT.
 ass='[Script Info]\nPlayResX: 1920\nPlayResY: 1080\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\nStyle: Default,Noto Sans CJK KR,34,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,1,0,2,60,60,32,1\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n'
 def ass_time(t):
  h=int(t//3600);m=int(t//60)%60;sec=t%60;return f'{h}:{m:02}:{sec:05.2f}'
 for a,b,text in cues:
  rows=wrap(text,34,1770);ass+=f'Dialogue: 0,{ass_time(a)},{ass_time(b)},Default,,0,0,0,,'+'\\N'.join(rows)+'\n'
 (WORK/'captions.ass').write_text(ass)
 with wave.open(str(WORK/'narration.wav'),'wb') as master:
  master.setnchannels(1);master.setsampwidth(2);master.setframerate(48000)
  for i,s in enumerate(timeline):
   raw=subprocess.check_output(['ffmpeg','-nostdin','-v','error','-i',str(WORK/f'audio-{i:02}.mp3'),'-f','s16le','-ac','1','-ar','48000','pipe:1'])
   count=round(s['duration']*48000)*2
   assert len(raw)<=count
   master.writeframes(raw+b'\0'*(count-len(raw)))
 with wave.open(str(WORK/'narration.wav')) as master:assert abs(master.getnframes()/48000-clock)<.001
 args=['ffmpeg','-nostdin','-hide_banner','-y','-f','concat','-safe','0','-i',str(WORK/'scenes.ffconcat'),'-i',str(WORK/'narration.wav'),'-i',str(OUT/'captions.srt'),'-map','0:v:0','-map','1:a:0','-map','2:s:0','-vf','fps=30,setsar=1','-t',str(clock),'-c:v','libx264','-preset','ultrafast','-crf','25','-pix_fmt','yuv420p','-threads','4','-c:a','aac','-b:a','96k','-c:s','mov_text','-metadata:s:s:0','language=kor','-movflags','+faststart',str(OUT/'lesson02.mp4')]
 with (WORK/'render.log').open('w') as log:subprocess.run(args,stdout=log,stderr=log,check=True)
 subprocess.run(['ffmpeg','-nostdin','-v','error','-y','-i',str(OUT/'lesson02.mp4'),'-map','0:v:0','-map','0:a:0','-c','copy','-hls_time','20','-hls_playlist_type','vod','-hls_segment_filename',str(OUT/'part-%03d.ts'),str(OUT/'index.m3u8')],check=True)
 subprocess.run(['ffmpeg','-nostdin','-v','error','-y','-ss','40','-i',str(OUT/'lesson02.mp4'),'-frames:v','1','-update','1',str(OUT/'poster.jpg')],check=True)
 print('DONE',clock,OUT/'lesson02.mp4',flush=True)
if __name__=='__main__':build()
