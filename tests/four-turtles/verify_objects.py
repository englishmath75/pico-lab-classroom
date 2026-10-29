"""Execute original and object-focused answer with real Tk; compare all drawing commands."""
import pathlib, turtle, math, ast
ROOT=pathlib.Path(__file__).resolve().parents[2]
BASE=ROOT/'public/pandas-data-lab'
OUT=ROOT/'test-results/four-turtles'
OUT.mkdir(parents=True,exist_ok=True)
real_screen=turtle.Screen
real_goto=turtle.RawTurtle.goto
ns={};events=[]
def screen():
    s=real_screen()
    s.tracer(0) # Verification only: suppress GUI pacing, retain real Tk canvas and coordinates.
    s.setup(760,760)
    return s

def goto(self,x,y=None):
    if y is None:x,y=x
    events.append((float(x),float(y),self.pencolor(),self.isdown(),id(self)))
    return real_goto(self,x,y)

def done():
    ns['screen'].update()

turtle.Screen=screen;turtle.RawTurtle.goto=goto;turtle.done=done
try:
    original=(BASE/'math-graph-code/math_turtle_original.py').read_text()
    revised=(BASE/'downloads/four_turtles_objects.py').read_text()
    def arithmetic(code):
        return [ast.dump(n,include_attributes=False) for n in ast.walk(ast.parse(code)) if isinstance(n,ast.BinOp)]
    assert arithmetic(original)==arithmetic(revised),'Original arithmetic changed'
    exec(compile(original,'original.py','exec'),ns)
    before=list(events)
    assert len(ns['screen'].turtles())==1
    ns['screen'].clearscreen()
    ns={};events=[]
    exec(compile(revised,'objects.py','exec'),ns)
    pens=[ns[f'pen{i}'] for i in range(1,5)]
    assert len(set(map(id,pens)))==4
    assert len(ns['screen'].turtles())==4
    assert [p.pencolor() for p in pens]==['cyan','magenta','yellow','lime']
    assert all(p.speed()==0 and p.pensize()==2 and not p.isvisible() for p in pens)
    assert len(events)==len(before)==1249 # four axis moves and 1245 graph moves
    for a,b in zip(before,events):
        assert a[:4]==b[:4],(a,b) # exact same coordinates, colors, and pre-move pen state
    for p,count in zip(pens,[379,210,299,361]):
        assert sum(event[4]==id(p) for event in events)==count
    canvas=ns['screen'].getcanvas()
    bg=canvas.create_rectangle(-5000,-5000,5000,5000,fill='black',outline='black');canvas.tag_lower(bg)
    canvas.postscript(file=str(OUT/'objects-turtle.ps'),colormode='color',x=-330,y=-330,width=660,height=660,pagewidth='760p',pageheight='760p')
    print('PASS: original and revised programs executed with real Tk; 1249 coordinates/colors/pen states match, including white axes.')
    print('PASS: four independent objects, four correct colors, speed/visibility/width settings, unchanged arithmetic.')
finally:
    if turtle.Turtle._screen is not None:turtle.bye()
