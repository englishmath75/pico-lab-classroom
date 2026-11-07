"""Teaching subset for zero02.py: prerecorded center click and finite 90 frames.
No mouse claim: the preset classroom input is a click at the canvas center.
"""
import types
import classroom_graphics as _g
SRCALPHA=1;BLEND_ADD=2;QUIT=3;MOUSEBUTTONDOWN=4;MOUSEMOTION=5
class Surface:
    def __init__(self,size,flags=0):self.size=size;self.circles=[]
    def fill(self,c):_g.clear(c)
    def blit(self,s,pos,special_flags=0):
        for c,p,r in s.circles:_g.command('circle',[p[0]+pos[0],p[1]+pos[1],r],c,0,'lighter' if special_flags==BLEND_ADD else 'source-over')
class Display:
    def set_mode(self,size):_g.configure(*size,'#0a0a12');return Surface(size)
    def set_caption(self,*args):pass
    def flip(self):_g.present()
class Clock:
    def tick(self,fps=60):
        ms=1000/max(1,float(fps));_g.clock_seconds+=ms/1000;return round(ms)
class Events:
    def get(self):
        if not _g.frames:return [types.SimpleNamespace(type=MOUSEBUTTONDOWN)]
        if len(_g.frames)>=_g._limit-1:
            _g.bounded=True;return [types.SimpleNamespace(type=QUIT)]
        return []
class Draw:
    def circle(self,s,c,p,r):s.circles.append((c,p,r))
display=Display();event=Events();draw=Draw();time=types.SimpleNamespace(Clock=Clock);mouse=types.SimpleNamespace(get_pos=lambda:(_g.current['width']/2,_g.current['height']/2))
def init():pass
def quit():pass
