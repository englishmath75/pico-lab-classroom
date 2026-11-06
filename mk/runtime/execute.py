# Isolated runtime support: never shown as a student example.
import sys, io, json, traceback, types
_mk_output = io.StringIO()
_mk_trace = []
_mk_steps = 0
class _BoundedOutput(io.StringIO):
    def write(self, value):
        remaining = 80000 - self.tell()
        if remaining > 0: return super().write(value[:remaining])
        return len(value)
_mk_output = _BoundedOutput()
def _mk_tracer(frame, event, arg):
    global _mk_steps
    if frame.f_code.co_filename == '<student>' and event == 'line':
        _mk_steps += 1
        if _mk_steps > 1000000: raise RuntimeError('실행 단계가 너무 많습니다. 반복 조건을 확인하세요.')
        if len(_mk_trace) < 180:
            values=[]
            for key,value in frame.f_locals.items():
                if key.startswith('_') or isinstance(value,types.ModuleType): continue
                if isinstance(value,(str,int,float,bool,list)) or value is None:
                    values.append(key+' = '+repr(value)[:240])
                if len(values)>=12: break
            _mk_trace.append({'line':frame.f_lineno,'values':' | '.join(values)[:1800]})
    return _mk_tracer
_mk_oldout=sys.stdout
_mk_oldin=sys.stdin
sys.stdout=_mk_output
sys.stdin=io.StringIO(_mk_input)
_mk_error=''
try:
    sys.settrace(_mk_tracer)
    exec(compile(_mk_code,'<student>','exec'),{'__name__':'__main__'})
except BaseException:
    _mk_error=traceback.format_exc(limit=5)
finally:
    sys.settrace(None)
    sys.stdout=_mk_oldout
    sys.stdin=_mk_oldin
_mk_result=json.dumps({'output':_mk_output.getvalue(),'error':_mk_error,'trace':_mk_trace},ensure_ascii=False)
