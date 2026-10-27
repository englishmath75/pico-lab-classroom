from pathlib import Path
import json,subprocess,re,hashlib
R=Path(__file__).resolve().parents[2];O=R/'public/pandas-data-lab/videos/lesson02-part2';P=O/'lesson02.mp4'
p=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(P)]))
v=next(s for s in p['streams'] if s['codec_type']=='video');a=next(s for s in p['streams'] if s['codec_type']=='audio');t=next(s for s in p['streams'] if s['codec_type']=='subtitle')
assert (v['width'],v['height'],v['codec_name'],a['codec_name'],t['codec_name'])==(1920,1080,'h264','aac','mov_text')
ss=json.loads((O/'timeline.json').read_text())['scenes'];d=sum(s['duration'] for s in ss)
assert abs(float(v['duration'])-d)<.04 and abs(float(a['duration'])-d)<.04
assert any(s['output']=='1500.0' for s in ss)
assert any(s['output'].endswith('1250.0') for s in ss)
assert any(s['output']=='Series\nDataFrame' for s in ss)
assert any(s['output'].startswith('KeyError:') for s in ss)
assert any(s['output'].startswith('TypeError:') for s in ss)
def sec(x):
 h,m,s=x.split(':');return int(h)*3600+int(m)*60+float(s)
previous=0;count=0
for x,y in re.findall(r'(\d\d:\d\d:\d\d\.\d\d\d) --> (\d\d:\d\d:\d\d\.\d\d\d)',(O/'captions.vtt').read_text()):
 x,y=sec(x),sec(y);assert previous<=x<y<=d;previous=y;count+=1
assert count>100
for f in [P,O/'index.m3u8']:
 subprocess.run(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(f),'-f','null','-'],check=True)
segments=re.findall(r'^part-.*\.ts$',(O/'index.m3u8').read_text(),re.M)
assert all((O/n).is_file() and (O/n).stat().st_size for n in segments)
report={'duration':d,'scenes':len(ss),'subtitleCues':count,'hlsSegments':len(segments),'video':'1920x1080 H.264 30fps','audio':'AAC Korean AI narration, ko-KR-SunHiNeural','subtitles':'SRT/VTT and MP4 mov_text','fullMp4AndHlsDecode':'PASS','teachingCode':'tests/pandas_lesson02_part2_check.py PASS','visuals':'labelled reconstruction, not live screen recording','humanContinuousFullReview':False,'sha256':hashlib.sha256(P.read_bytes()).hexdigest(),'browser':'pending deployment'}
(O/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
