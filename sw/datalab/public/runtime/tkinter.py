"""Teaching subset: Canvas line/polygon and finite after callbacks, no DOM access."""
import classroom_graphics as _g
import time as _time
BOTH='both'
class Tk:
    def __init__(self):
        self.queue=[]
        _time.time=lambda:_g.clock_seconds
    def title(self,*args):pass
    def after(self,ms,callback):self.queue.append((max(0,float(ms))/1000,callback))
    def mainloop(self):
        while self.queue and len(_g.frames)<_g._limit:
            _g.present()
            if len(_g.frames)>=_g._limit:break
            delay,callback=self.queue.pop(0)
            _g.clock_seconds+=delay
            callback()
        _g.bounded=bool(self.queue)
class Canvas:
    def __init__(self,root,width,height,bg='white',**kwargs):_g.configure(width,height,bg)
    def pack(self,**kwargs):pass
    def delete(self,*args):_g.clear()
    def create_line(self,*coords,fill='black',width=1,**kwargs):
        if len(coords)==1:coords=coords[0]
        _g.command('line',coords,fill,width)
    def create_polygon(self,*coords,fill='',outline='',width=1,**kwargs):
        if len(coords)==1:coords=coords[0]
        if fill:_g.command('polygon',coords,fill,0,stipple=kwargs.get('stipple',''))
        if outline:_g.command('closed-line',coords,outline,width)
