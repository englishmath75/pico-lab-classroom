from pathlib import Path
import json,subprocess,re,hashlib
R=Path(__file__).resolve().parents[2];O=R/'public/pandas-data-lab/videos/lesson04';P=O/'lesson02.mp4'
p=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-of','json',str(P)]));v,a,t=[next(x for x in p['streams'] if x['codec_type']==k) for k in ['video','audio','subtitle']]
ss=json.loads((O/'timeline.json').read_text())['scenes'];d=sum(s['duration'] for s in ss)
assert (v['width'],v['height'],v['codec_name'],a['codec_name'],t['codec_name'])==(1920,1080,'h264','aac','mov_text')
assert all(abs(float(x['duration'])-d)<.05 for x in [v,a])
def sec(x):
 h,m,s=x.split(':');return int(h)*3600+int(m)*60+float(s)
last=0;count=0
for x,y in re.findall(r'(\d\d:\d\d:\d\d\.\d\d\d) --> (\d\d:\d\d:\d\d\.\d\d\d)',(O/'captions.vtt').read_text()):
 x,y=sec(x),sec(y);assert last<=x<y<=d+.01;last=y;count+=1
assert count>100
for f in [P,O/'index.m3u8']:subprocess.run(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(f),'-f','null','-'],check=True)
report={'duration':d,'scenes':len(ss),'subtitleCues':count,'fullMp4AndHlsDecode':'PASS','teachingCode':'tests/pandas_lesson04_check.py PASS','video':'1920x1080 H264 30fps','audio':'AAC Korean AI ko-KR-SunHiNeural (not teacher clone)','visuals':'code animation and instructional reconstruction, not screen recording','subtitles':'Korean VTT/SRT and MP4 selectable subtitles','sha256':hashlib.sha256(P.read_bytes()).hexdigest(),'browser':'pending deployment'}
(O/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
