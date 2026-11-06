"""Bounded educational turtle movement recorded for STEP VISION SVG replay.
No Tk, Matplotlib, network, GUI event loop, or arbitrary callback execution.
"""
import math
import re
_pens = []
_segments = []
_COLORS = {'black','white','red','green','blue','orange','purple','yellow','cyan','magenta','navy','teal','gold','gray','pink'}

def _number(value):
    value = float(value)
    if not math.isfinite(value) or abs(value) > 100000:
        raise ValueError('좌표·거리·각도는 유한한 ±100000 범위여야 합니다.')
    return value

def _color(value):
    if not isinstance(value, str) or not (value in _COLORS or re.fullmatch(r'#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?', value)):
        raise ValueError('색 이름 또는 #RRGGBB 색상을 사용하세요.')
    return value

def _reset():
    _pens.clear()
    _segments.clear()

def _snapshot():
    return {'pens': [dict(id=p._id, x=round(p.x,8), y=round(p.y,8), heading=round(p.angle,8), down=p._down, color=p._color, width=p._width) for p in _pens],
            'segments': [dict(s) for s in _segments]}

class Turtle:
    def __init__(self):
        if len(_pens) >= 16: raise ValueError('펜은 최대 16개까지 만들 수 있습니다.')
        self.x, self.y, self.angle, self._down = 0.0, 0.0, 0.0, True
        self._color, self._width, self._id = '#147d92', 2.0, len(_pens)+1
        _pens.append(self)
    def goto(self, x, y=None):
        if y is None: x, y = x
        x, y = _number(x), _number(y)
        if self._down:
            if len(_segments) >= 512: raise ValueError('선은 최대 512개까지 그릴 수 있습니다.')
            _segments.append(dict(x1=self.x,y1=self.y,x2=x,y2=y,color=self._color,width=self._width,pen=self._id))
        self.x, self.y = x, y
    setpos = setposition = goto
    def forward(self, distance):
        distance = _number(distance)
        self.goto(self.x + distance*math.cos(math.radians(self.angle)), self.y + distance*math.sin(math.radians(self.angle)))
    fd = forward
    def backward(self, distance): self.forward(-_number(distance))
    bk = back = backward
    def left(self, angle): self.angle = (self.angle + _number(angle)) % 360
    lt = left
    def right(self, angle): self.left(-_number(angle))
    rt = right
    def setheading(self, angle): self.angle = _number(angle) % 360
    seth = setheading
    def position(self): return self.x, self.y
    pos = position
    def xcor(self): return self.x
    def ycor(self): return self.y
    def heading(self): return self.angle
    def penup(self): self._down = False
    pu = up = penup
    def pendown(self): self._down = True
    pd = down = pendown
    def isdown(self): return self._down
    def home(self): self.goto(0, 0); self.setheading(0)
    def pencolor(self, color=None):
        if color is None: return self._color
        self._color = _color(color)
    color = pencolor
    def pensize(self, width=None):
        if width is None: return self._width
        width = _number(width)
        if not 0 < width <= 30: raise ValueError('선 굵기는 0 초과 30 이하여야 합니다.')
        self._width = width
    width = pensize
    def clear(self): _segments[:] = [s for s in _segments if s['pen'] != self._id]
    def reset(self):
        self.clear(); self.x = self.y = self.angle = 0.0
        self._down, self._color, self._width = True, '#147d92', 2.0
    def speed(self, value=None):
        # Playback speed belongs to STEP VISION, not Python wall-clock delays.
        return 0

_default = None
def _pen():
    global _default
    if _default is None or _default not in _pens: _default = Turtle()
    return _default

def forward(distance): return _pen().forward(distance)
fd = forward
def backward(distance): return _pen().backward(distance)
bk = back = backward
def left(angle): return _pen().left(angle)
lt = left
def right(angle): return _pen().right(angle)
rt = right
def goto(x,y=None): return _pen().goto(x,y)
setpos = setposition = goto
def penup(): return _pen().penup()
pu = up = penup
def pendown(): return _pen().pendown()
pd = down = pendown
def position(): return _pen().position()
pos = position
def heading(): return _pen().heading()
def setheading(angle): return _pen().setheading(angle)
seth = setheading
def pencolor(color=None): return _pen().pencolor(color)
color = pencolor
def pensize(width=None): return _pen().pensize(width)
width = pensize
def home(): return _pen().home()
def clear(): return _pen().clear()
def speed(value=None): return _pen().speed(value)
def done(): pass
mainloop = done
