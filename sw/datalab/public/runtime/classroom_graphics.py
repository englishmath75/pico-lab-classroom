"""Finite classroom graphics recorder. Coordinates are produced only by Python.
This is the documented subset for the four existing works, not desktop Tk/pygame.
"""
import math
frames=[]
current={'width':900,'height':650,'background':'#020205','commands':[]}
_limit=90
bounded=False
clock_seconds=0.0
trace_callback=None

def set_frame_limit(n):
    global _limit
    n=int(n)
    if not 1<=n<=180:raise ValueError('수업 애니메이션은 1~180프레임입니다.')
    _limit=n

def color(c):
    if isinstance(c,(tuple,list)):
        if len(c)==4:return 'rgba(%d,%d,%d,%s)'%(int(c[0]),int(c[1]),int(c[2]),max(0,min(255,c[3]))/255)
        return '#%02x%02x%02x'%tuple(map(int,c[:3]))
    return str(c)

def configure(w,h,bg):current.update(width=float(w),height=float(h),background=color(bg))
def clear(bg=None):
    current['commands']=[]
    if bg is not None:current['background']=color(bg)

def command(kind,coords,fill='',width=1,blend='source-over',stipple=''):
    if len(current['commands'])>=5000:raise ValueError('한 프레임의 도형 5,000개 한도입니다.')
    coords=[float(v) for v in coords]
    if any(not math.isfinite(v) or abs(v)>1000000 for v in coords):raise ValueError('도형 좌표 범위를 벗어났습니다.')
    current['commands'].append({'kind':kind,'coords':coords,'color':color(fill),'width':float(width),'blend':blend,'stipple':stipple})
def present():
    global bounded
    if len(frames)>=_limit:
        bounded=True;return False
    frames.append({**current,'clockSeconds':clock_seconds,'commands':[dict(c) for c in current['commands']]})
    if trace_callback is not None:trace_callback()
    return True

def _reset():
    global bounded,_limit,clock_seconds,trace_callback
    frames.clear();clear();bounded=False;_limit=90;clock_seconds=0.0
    trace_callback=None
