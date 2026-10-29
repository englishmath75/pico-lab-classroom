import json,math,pathlib,runpy,sys,turtle
root=pathlib.Path(__file__).resolve().parents[2]
out=root/'test-results'/'four-turtles'
out.mkdir(parents=True,exist_ok=True)
source=root/'public/pandas-data-lab/downloads/four_turtles.py'
code=source.read_text();compile(code,str(source),'exec')
ns={};events=[];snapshots=[];updates=[]
original_goto=turtle.RawTurtle.goto
original_update=turtle.TurtleScreen.update
original_done=turtle.done

def goto(self,x,y=None):
 if y is None:x,y=x
 if 'I' in ns:
  index=next((j for j in range(1,5) if ns.get('pen'+str(j)) is self),None)
  events.append({'I':ns['I'],'pen':index,'X':float(x),'Y':float(y),'down':self.isdown(),'color':self.pencolor()})
 return original_goto(self,x,y)

def update(self):
 result=original_update(self)
 if 'I' in ns:
  updates.append(ns['I'])
  snapshots.append({'I':ns['I'],'pens':[{'X':float(ns['pen'+str(j)].xcor()),'Y':float(ns['pen'+str(j)].ycor()),'down':ns['pen'+str(j)].isdown()} for j in range(1,5)]})
 return result

def done():
 S=ns['S'];original_update(S)
 canvas=S.getcanvas();w=canvas.winfo_width();h=canvas.winfo_height()
 box=canvas.bbox('all');bg=canvas.create_rectangle(-5000,-5000,5000,5000,fill='black',outline='black');canvas.tag_lower(bg)
 canvas.postscript(file=str(out/'actual-turtle.ps'),colormode='color',x=-330*S.xscale,y=-330*S.yscale,width=660*S.xscale,height=660*S.yscale,pagewidth='760p',pageheight='760p')
 print('Tk graphics rendered:',w,h,'world scale',S.xscale,S.yscale,'canvas items',len(canvas.find_all()))

turtle.RawTurtle.goto=goto;turtle.TurtleScreen.update=update;turtle.done=done
try:
 exec(compile(code,str(source),'exec'),ns)
 assert len({id(ns['pen'+str(j)]) for j in range(1,5)})==4
 assert [ns['pen'+str(j)].pencolor() for j in range(1,5)]==['cyan','magenta','yellow','lime']
 assert updates==list(range(401)),updates
 for j,count in enumerate([375,210,299,361],1):
  pen_events=[x for x in events if x['pen']==j]
  assert len(pen_events)==count,(j,len(pen_events))
  assert sum(x['down'] for x in pen_events)==count-1
  assert not pen_events[0]['down']
  print('pen',j,'goto',len(pen_events),'segments',sum(x['down'] for x in pen_events),'first',pen_events[0],'last',pen_events[-1])
 for event in events:
  if event['pen']==4: assert math.isclose(event['X']**2+event['Y']**2,10000,abs_tol=1e-8)
 (out/'turtle-trace.json').write_text(json.dumps({'events':events,'frames':snapshots,'updates':updates}))
 print('PASS: real Tk/Turtle, 4 independent objects, colors, 401 refreshes, all moves and pen states.')
finally:
 if turtle.Turtle._screen is not None: turtle.bye()
