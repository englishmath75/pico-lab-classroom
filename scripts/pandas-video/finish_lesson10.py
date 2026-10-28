"""Reassemble checked cached scenes, rejecting damaged frames or voice boundaries."""
import json,asyncio,math,wave,subprocess
from PIL import Image
import build_lesson10 as part
e=part.e
async def checked_voices():
 sem=asyncio.Semaphore(1)
 for i,scene in enumerate(e.scenes):
  print('VOICE CHECK',i,flush=True)
  await e.synth(i,scene,sem)
asyncio.run(checked_voices())
clock=0;ss=[];cues=[];concat=['ffconcat version 1.0']
for i,s in enumerate(e.scenes):
 p=e.WORK/f'audio-{i:02}.mp3';events=json.loads((e.WORK/f'audio-{i:02}.json').read_text());length=e.duration(p)
 assert max((x['offset']+x['duration'])/1e7 for x in events)<=length+.05
 span=math.ceil((length+s['pause'])*30)/30;s.update(start=clock,duration=span,audioDuration=length)
 code,out,note=e.visual(s);s.update(code=code,output=out,note=note);group=[]
 for event in events:
  group.append(event)
  if len(' '.join(x['text'] for x in group))>=35 or event is events[-1]:
   a=clock+group[0]['offset']/1e7;b=clock+min(length,(group[-1]['offset']+group[-1]['duration'])/1e7);assert a<b;cues.append((a,b,' '.join(x['text'] for x in group)));group=[]
 if s['pause']>=6:cues.append((clock+length,clock+span,'일시정지하고 직접 실습하세요. 완료한 뒤 재생합니다.'))
 frames=max(8,min(36,len(code.splitlines())*3))
 for k in range(frames):
  path=e.WORK/f'frame-{i:02}-{k:02}.png'
  try:
   with Image.open(path) as im:im.verify()
   with Image.open(path) as im:im.load()
  except Exception:
   t=k/frames;shown=min(len(code.splitlines()),max(1,int(t*len(code.splitlines())*2.3)+1));active=min(len(code.splitlines())-1,max(0,shown-1));image=e.frame(s,i,len(e.scenes),code,out,note,shown,active,t)
   for attempt in range(5):
    image.save(path)
    try:
     with Image.open(path) as im:im.verify()
     with Image.open(path) as im:im.load()
     break
    except Exception:
     if attempt==4:raise
   print('REPAIRED',path.name,flush=True)
  concat += [f"file '{path.as_posix()}'",'option framerate 30',f'duration {span/frames:.9f}']
 ss.append(s);clock+=span
concat += [concat[-3],'option framerate 30'];(e.WORK/'checked.ffconcat').write_text('\n'.join(concat)+'\n')
(e.OUT/'timeline.json').write_text(json.dumps({'voice':e.VOICE,'aiGeneratedVoice':True,'visualMode':'code animation and instructional reconstruction','scenes':ss},ensure_ascii=False,indent=2)+'\n')
(e.OUT/'captions.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(e.timestamp(a)+' --> '+e.timestamp(b)+'\n'+t for a,b,t in cues)+'\n')
(e.OUT/'captions.srt').write_text('\n\n'.join(str(i+1)+'\n'+e.timestamp(a,True)+' --> '+e.timestamp(b,True)+'\n'+t for i,(a,b,t) in enumerate(cues))+'\n')
wav=e.WORK/'checked-narration.wav'
with wave.open(str(wav),'wb') as m:
 m.setnchannels(1);m.setsampwidth(2);m.setframerate(48000)
 for i,s in enumerate(ss):
  raw=subprocess.check_output(['ffmpeg','-nostdin','-v','error','-i',str(e.WORK/f'audio-{i:02}.mp3'),'-f','s16le','-ac','1','-ar','48000','pipe:1']);size=round(s['duration']*48000)*2;assert len(raw)<=size;m.writeframes(raw+b'\0'*(size-len(raw)))
assert wav.stat().st_size==round(clock*48000)*2+44
# A second full read catches any damaged intermediate image before FFmpeg consumes it.
for i,s in enumerate(ss):
 code,out,note=s['code'],s['output'],s['note'];frames=max(8,min(36,len(code.splitlines())*3))
 for k in range(frames):
  path=e.WORK/f'frame-{i:02}-{k:02}.png'
  try:
   with Image.open(path) as im:im.verify()
   with Image.open(path) as im:im.load()
  except Exception:
   t=k/frames;shown=min(len(code.splitlines()),max(1,int(t*len(code.splitlines())*2.3)+1));active=min(len(code.splitlines())-1,max(0,shown-1));im=e.frame(s,i,len(ss),code,out,note,shown,active,t)
   for attempt in range(5):
    im.save(path)
    try:
     with Image.open(path) as check:check.verify()
     with Image.open(path) as check:check.load()
     break
    except Exception:
     if attempt==4:raise
   print('FRAME RECHECK',path.name,flush=True)
args=['ffmpeg','-nostdin','-v','error','-xerror','-y','-f','concat','-safe','0','-i',str(e.WORK/'checked.ffconcat'),'-i',str(wav),'-i',str(e.OUT/'captions.srt'),'-map','0:v:0','-map','1:a:0','-map','2:s:0','-vf','fps=30,setsar=1','-t',str(clock),'-c:v','libx264','-preset','ultrafast','-crf','25','-pix_fmt','yuv420p','-threads','4','-c:a','aac','-b:a','96k','-c:s','mov_text','-metadata:s:s:0','language=kor','-movflags','+faststart',str(e.OUT/'lesson02.mp4')]
subprocess.run(args,check=True)
probe=e.probe(e.OUT/'lesson02.mp4');assert all(abs(float(x['duration'])-clock)<.05 for x in probe['streams'] if x['codec_type'] in ['video','audio'])
subprocess.run(['ffmpeg','-nostdin','-v','error','-y','-i',str(e.OUT/'lesson02.mp4'),'-map','0:v:0','-map','0:a:0','-c','copy','-hls_time','20','-hls_playlist_type','vod','-hls_segment_filename',str(e.OUT/'part-lesson-only-%03d.ts'),str(e.OUT/'index.m3u8')],check=True)
subprocess.run(['ffmpeg','-nostdin','-v','error','-y','-ss','40','-i',str(e.OUT/'lesson02.mp4'),'-frames:v','1','-update','1',str(e.OUT/'poster.jpg')],check=True)
print('COMPLETE',clock,flush=True)
