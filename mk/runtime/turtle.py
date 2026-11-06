"""MK browser Turtle compatibility module. System implementation, not student curriculum."""
import math
_commands = []
_limit = 24000

def _emit(command):
    if len(_commands) >= _limit:
        raise RuntimeError('그리기 명령이 24,000개를 넘었습니다. 반복 횟수를 줄이세요.')
    _commands.append(command)

class Turtle:
    def __init__(self):
        self.x = self.y = self.angle = 0.0
        self.ink = '#282642'
        self.width = 2.0
        self.down = True
    def goto(self, x, y=None):
        if y is None: x, y = x
        x, y = float(x), float(y)
        if not math.isfinite(x+y) or abs(x)>100000 or abs(y)>100000:
            raise ValueError('좌표는 -100000~100000의 유한수여야 합니다.')
        if self.down: _emit(['line',self.x,self.y,x,y,self.ink,self.width])
        self.x, self.y = x, y
    def forward(self, distance):
        angle = math.radians(self.angle)
        self.goto(self.x+float(distance)*math.cos(angle), self.y+float(distance)*math.sin(angle))
    def backward(self, distance): self.forward(-distance)
    def left(self, angle): self.angle = (self.angle + float(angle)) % 360
    def right(self, angle): self.left(-angle)
    def setheading(self, angle): self.angle=float(angle)%360
    def heading(self): return self.angle
    def position(self): return (self.x,self.y)
    def xcor(self): return self.x
    def ycor(self): return self.y
    def penup(self): self.down=False
    def pendown(self): self.down=True
    def pencolor(self, color=None):
        if color is not None: self.ink=str(color)[:40]
        return self.ink
    def color(self, color=None, *unused): return self.pencolor(color)
    def pensize(self, width=None):
        if width is not None: self.width=max(0.1,min(40,float(width)))
        return self.width
    def speed(self, value=None): pass
    def hideturtle(self): pass
    def showturtle(self): pass
    def shape(self, name): pass
    def circle(self, radius, extent=360, steps=None):
        radius=float(radius);extent=float(extent)
        count=int(steps) if steps else max(8,int(abs(extent)/5))
        if count<1 or count>7200: raise ValueError('원 분할 수를 1~7200으로 정하세요.')
        angle=math.radians(self.angle)
        cx=self.x-radius*math.sin(angle);cy=self.y+radius*math.cos(angle)
        sx=self.x-cx;sy=self.y-cy
        sign=1 if radius>=0 else -1
        for step in range(1,count+1):
            turn=math.radians(extent*step/count*sign)
            self.goto(cx+sx*math.cos(turn)-sy*math.sin(turn),cy+sx*math.sin(turn)+sy*math.cos(turn))
        self.left(extent*sign)
    def dot(self, size=8, color=None): _emit(['dot',self.x,self.y,max(1,min(100,float(size))),str(color or self.ink)[:40]])
    def clear(self): _commands.clear()
    def reset(self): self.clear();self.__init__()
    def home(self): self.goto(0,0);self.setheading(0)
    fd=forward;bk=backward;back=backward;lt=left;rt=right;up=penup;pu=penup;pd=pendown;down=pendown;setpos=goto;setposition=goto;seth=setheading;width=pensize

class _Screen:
    def bgcolor(self,color): _emit(['background',str(color)[:40]])
    def setup(self,*args,**kwargs): pass
    def title(self,*args): pass
    def tracer(self,*args): pass
    def update(self): pass
    def exitonclick(self): pass

def Screen(): return _Screen()
def bgcolor(color): Screen().bgcolor(color)
def done(): pass
def mainloop(): pass
def exitonclick(): pass
def update(): pass
def tracer(*args): pass
_default=Turtle()
for _name in ['goto','forward','backward','left','right','setheading','heading','position','xcor','ycor','penup','pendown','pencolor','color','pensize','speed','hideturtle','showturtle','shape','circle','dot','clear','reset','home','fd','bk','back','lt','rt','up','pu','pd','down','setpos','setposition','seth','width']:
    globals()[_name]=getattr(_default,_name)
