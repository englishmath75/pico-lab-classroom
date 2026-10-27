from pathlib import Path
import json,subprocess,re,hashlib,wave
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'public/pandas-data-lab/videos/lesson02'
p=OUT/'lesson02.mp4'
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
v=next(x for x in probe['streams'] if x['codec_type']=='video');a=next(x for x in probe['streams'] if x['codec_type']=='audio');sub=next(x for x in probe['streams'] if x['codec_type']=='subtitle')
assert (v['width'],v['height'],v['codec_name'],a['codec_name'],sub['codec_name'])==(1920,1080,'h264','aac','mov_text')
assert abs(float(v['duration'])-float(a['duration']))<1/30+.01
ss=json.loads((OUT/'timeline.json').read_text())['scenes'];duration=sum(s['duration'] for s in ss)
assert abs(float(a['duration'])-duration)<.05
assert any('3.3333333333333335' in s['output'] for s in ss)
assert any(s['output']=='80.0' for s in ss)
assert any(s['original']==18 for s in ss)
assert all(s['speech'] for s in ss)
text=(OUT/'captions.vtt').read_text();assert text.startswith('WEBVTT\n')
def seconds(t):
 h,m,s=t.split(':');return 3600*int(h)+60*int(m)+float(s)
previous=-1;count=0
for start,end in re.findall(r'(\d\d:\d\d:\d\d\.\d\d\d) --> (\d\d:\d\d:\d\d\.\d\d\d)',text):
 x,y=seconds(start),seconds(end);assert x>=previous and x<y<=duration+.01;previous=y;count+=1
assert count>100
# Decode both the complete MP4 and deployed HLS rendition, including audio.
for video in [p,OUT/'index.m3u8']:
 subprocess.run(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(video),'-f','null','-'],check=True)
manifest=(OUT/'index.m3u8').read_text();segments=re.findall(r'^part-.*\.ts$',manifest,re.M)
assert segments and '#EXT-X-ENDLIST' in manifest
for s in segments:assert (OUT/s).is_file() and (OUT/s).stat().st_size>0
report={'video':v['codec_name'],'audio':a['codec_name'],'subtitles':sub['codec_name'],'size':[1920,1080],'duration':duration,'sceneCount':len(ss),'subtitleCues':count,'hlsSegments':len(segments),'fullDecode':'PASS','codeExampleVerification':'tests/pandas_video_pilot_check.py','visualMode':'labelled reconstruction','voice':'AI ko-KR-SunHiNeural, edge-tts 7.3.1','mp4Sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'browserPlayback':'pending deployment','humanFullContinuousReview':False}
(OUT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
