from pathlib import Path
import json, subprocess, math, hashlib

ROOT = Path(__file__).resolve().parents[1]
TOOLS = json.loads((ROOT.parent/'EP00_ELECTRICITY_FOUNDATION/production/tools.json').read_text(encoding='utf-8'))
timings = json.loads((ROOT/'part1-timings.json').read_text(encoding='utf-8'))
frames = math.ceil(timings['audioDuration']*30)
slides = timings['slides']
lines = ['ffconcat version 1.0']
for i, s in enumerate(slides):
    start = round(s['start']*30)
    end = round(slides[i+1]['start']*30) if i+1<len(slides) else frames
    s['startFrame'], s['endFrameExclusive'] = start, end
    lines += [f"file '../assets/slides/P{s['page']:02d}.png'", 'option framerate 30', f"duration {(end-start)/30:.9f}"]
lines += [f"file '../assets/slides/P{slides[-1]['page']:02d}.png'", 'option framerate 30']
(ROOT/'production/slides.ffconcat').write_text('\n'.join(lines)+'\n',encoding='utf-8')
(ROOT/'part1-timings.json').write_text(json.dumps(timings,ensure_ascii=False,indent=2),encoding='utf-8')
out = ROOT/'ARDUINO_PART1_기본이론_FINAL.mp4'
args = [TOOLS['ffmpeg'],'-hide_banner','-y','-f','concat','-safe','0','-i',str(ROOT/'production/slides.ffconcat'),'-i',str(ROOT/'assets/audio/PART1_MASTER.m4a'),'-map','0:v:0','-map','1:a:0','-vf','fps=30,setsar=1','-frames:v',str(frames),'-c:v','libx264','-preset','fast','-tune','stillimage','-crf','18','-pix_fmt','yuv420p','-threads','8','-c:a','copy','-movflags','+faststart',str(out)]
with (ROOT/'production/render.log').open('w',encoding='utf-8') as log:
    subprocess.run(args,stdout=log,stderr=log,check=True)
print('RENDER_COMPLETE',str(out),out.stat().st_size,flush=True)
