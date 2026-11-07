"""SW educational Turtle: Python computes all geometry; immutable snapshots replay it.
Tk event callbacks are not emulated. A finite Python loop is the animation timeline.
"""
import math
import re
_pens, _segments, _arcs = [], [], []
_history_segments, _history_arcs, _cleared = [], [], {}
_default = None
_order = 0
_screen = {'background':'white', 'world':[-330,-330,330,330], 'width':760,'height':760}
_COLORS = set('black white red green blue orange purple yellow cyan magenta navy teal gold gray grey pink lime coral violet brown silver indigo turquoise'.split())

def _number(value):
    value = float(value)
    if not math.isfinite(value) or abs(value) > 100000:
        raise ValueError('좌표·거리·각도는 유한한 ±100000 범위여야 합니다.')
    return value

def _color(value):
    if isinstance(value, (list, tuple)) and len(value)==3:
        factor=255 if _screen.get('colormode',1)==1 else 1
        values=[round(_number(x)*factor) for x in value]
        if any(x<0 or x>255 for x in values):raise ValueError('RGB 색 범위를 확인하세요.')
        return '#%02x%02x%02x'%tuple(values)
    if not isinstance(value,str) or not (value.lower() in _COLORS or re.fullmatch(r'#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?',value)):
        raise ValueError('지원 색 이름 또는 #RRGGBB 색상을 사용하세요.')
    return value.lower()

def _reset():
    global _default,_order
    _order=0
    _pens.clear();_segments.clear();_arcs.clear();_default=None
    _history_segments.clear();_history_arcs.clear();_cleared.clear()
    _screen.clear();_screen.update(background='white',world=[-330,-330,330,330],width=760,height=760)

def _snapshot(compact=False):
    result = {'pens':[dict(id=p._id,x=round(p.x,8),y=round(p.y,8),heading=round(p.angle,8),down=p._down,color=p._color,width=p._width,visible=p._visible,speed=p._speed,shape=p._shape) for p in _pens],
            'segments':[] if compact else [dict(s) for s in _segments], 'arcs':[] if compact else [dict(a) for a in _arcs],
            'background':_screen['background'],'world':list(_screen['world']),
            'screen':dict(_screen)}
    if compact:result.update(historyEnd=_order,clearBefore=dict(_cleared))
    return result

def _history():
    return {'segments':_history_segments,'arcs':_history_arcs}

def _next_order():
    global _order
    value=_order;_order+=1;return value

def _budget():
    if _order>=20000:raise ValueError('그림 기록 20,000개 한도입니다. 반복 횟수를 줄이세요. 결과가 완성되지 않았습니다.')

class Turtle:
    def __init__(self,shape='classic',visible=True):
        if len(_pens)>=32:raise ValueError('거북이는 최대 32개입니다.')
        self.x=self.y=self.angle=0.0
        self._down=True;self._color='black';self._width=1.0;self._visible=bool(visible);self._id=len(_pens)+1
        self._speed=3;self._shape=shape
        _pens.append(self)
    def goto(self,x,y=None):
        if y is None:x,y=x
        x,y=_number(x),_number(y)
        if self._down:
            _budget();_segments.append(dict(x1=self.x,y1=self.y,x2=x,y2=y,color=self._color,width=self._width,pen=self._id,order=_next_order()))
            _history_segments.append(dict(_segments[-1]))
        self.x,self.y=x,y
    setpos=setposition=goto
    def forward(self,distance):
        d=_number(distance);t=math.radians(self.angle)
        self.goto(self.x+d*math.cos(t),self.y+d*math.sin(t))
    fd=forward
    def backward(self,distance):self.forward(-_number(distance))
    bk=back=backward
    def left(self,angle):self.angle=(self.angle+_number(angle))%360
    lt=left
    def right(self,angle):self.left(-_number(angle))
    rt=right
    def setheading(self,angle):self.angle=_number(angle)%360
    seth=setheading
    def position(self):return self.x,self.y
    pos=position
    def xcor(self):return self.x
    def ycor(self):return self.y
    def heading(self):return self.angle
    def penup(self):self._down=False
    pu=up=penup
    def pendown(self):self._down=True
    pd=down=pendown
    def isdown(self):return self._down
    def home(self):self.goto(0,0);self.setheading(0)
    def pencolor(self,*color):
        if not color:return self._color
        self._color=_color(color[0] if len(color)==1 else color)
    color=pencolor
    def pensize(self,width=None):
        if width is None:return self._width
        width=_number(width)
        if not 0<width<=30:raise ValueError('선 굵기는 0 초과 30 이하입니다.')
        self._width=width
    width=pensize
    def clear(self):
        _cleared[self._id]=_order
        _segments[:]=[s for s in _segments if s['pen']!=self._id]
        _arcs[:]=[s for s in _arcs if s['pen']!=self._id]
    def reset(self):
        self.clear();self.x=self.y=self.angle=0.0;self._down=True;self._color='black';self._width=1.0;self._visible=True
        self._speed=3;self._shape='classic'
    def circle(self,radius,extent=None,steps=None):
        r=_number(radius);extent=360 if extent is None else _number(extent)
        if not r:return
        t=math.radians(self.angle);cx=self.x-r*math.sin(t);cy=self.y+r*math.cos(t)
        start=math.atan2(self.y-cy,self.x-cx);sweep=math.radians(extent)*(1 if r>=0 else -1)
        if steps is not None:
            n=int(steps)
            if not 1<=n<=20000:raise ValueError('steps는 1~20000입니다.')
            for i in range(1,n+1):self.goto(cx+abs(r)*math.cos(start+sweep*i/n),cy+abs(r)*math.sin(start+sweep*i/n))
        else:
            if self._down:
                _budget();_arcs.append(dict(cx=cx,cy=cy,r=abs(r),start=start,sweep=sweep,color=self._color,width=self._width,pen=self._id,order=_next_order()))
                _history_arcs.append(dict(_arcs[-1]))
            self.x=cx+abs(r)*math.cos(start+sweep);self.y=cy+abs(r)*math.sin(start+sweep)
        self.angle=(self.angle+math.degrees(sweep))%360
    def hideturtle(self):self._visible=False
    ht=hideturtle
    def showturtle(self):self._visible=True
    st=showturtle
    def isvisible(self):return self._visible
    def speed(self,value=None):
        if value is not None:
            value={'fastest':0,'fast':10,'normal':6,'slow':3,'slowest':1}.get(value,value)
            self._speed=round(value) if isinstance(value,(int,float)) and 0.5<value<10.5 else 0
        return self._speed
    def shape(self,value=None):
        if value is not None:
            if value not in ('classic','arrow','turtle','circle','square','triangle','blank'):raise ValueError('기본 거북이 모양을 사용하세요.')
            self._shape=value
        return self._shape
    def getturtle(self):return self
    def getscreen(self):return Screen()

class Screen:
    def bgcolor(self,*color):
        if not color:return _screen['background']
        _screen['background']=_color(color[0] if len(color)==1 else color)
    def setup(self,width=760,height=760,*args,**kwargs):_screen.update(width=_number(width),height=_number(height))
    def setworldcoordinates(self,llx,lly,urx,ury):
        v=list(map(_number,[llx,lly,urx,ury]))
        if v[0]>=v[2] or v[1]>=v[3]:raise ValueError('좌표계 최솟값은 최댓값보다 작아야 합니다.')
        _screen['world']=v
    def colormode(self,value=None):
        if value is None:return _screen.get('colormode',1)
        if value not in (1,255):raise ValueError('colormode는 1 또는 255입니다.')
        _screen['colormode']=value
    def tracer(self,n=None,delay=None):
        if n is not None:_screen['tracer']=max(0,int(n))
        if delay is not None:_screen['delay']=max(0,int(delay))
        return _screen.get('tracer',1)
    def update(self):_screen.update(updates=_screen.get('updates',0)+1,displayThrough=_order)
    def title(self,title):_screen['title']=str(title)[:200]
    def exitonclick(self):done()
    def mainloop(self):done()
    def clearscreen(self):
        for p in _pens:p.reset()
        _screen.clear();_screen.update(background='white',world=[-330,-330,330,330],width=760,height=760)

def _pen():
    global _default
    if _default is None:_default=Turtle()
    return _default

def _delegate(name):
    def method(*args,**kwargs):return getattr(_pen(),name)(*args,**kwargs)
    return method
for _name in ('forward fd backward bk back left lt right rt goto setpos setposition penup pu up pendown pd down position pos heading setheading seth pencolor color pensize width home clear reset speed circle hideturtle ht showturtle st isvisible isdown xcor ycor shape').split():globals()[_name]=_delegate(_name)
for _name in ('bgcolor setup setworldcoordinates colormode tracer update title clearscreen').split():globals()[_name]=getattr(Screen(),_name)
def done():_screen['programComplete']=True
mainloop=exitonclick=done
