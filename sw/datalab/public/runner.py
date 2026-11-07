"""PYLAB 360 trusted trace adapter, executed inside the browser's Pyodide Worker.
Only trusted fixtures execute this adapter under host CPython in unit tests.
"""
import builtins as _builtins
import classroom_graphics as _graphics
import io as _io
import os as _os
import base64 as _base64
import json as _json
import sys as _sys
import traceback as _traceback
import types as _types
import hashlib as _hashlib
import ast as _ast
from time import perf_counter as _clock
from turtle import Turtle as _Turtle, _snapshot as _drawing_snapshot, _reset as _drawing_reset, _history as _drawing_history
from contextlib import redirect_stdout as _redirect_stdout, redirect_stderr as _redirect_stderr

_FILENAME = 'pylab_user_code.py'
_MAX_OUTPUT = 65536
_MAX_EVENTS = 20000
_MAX_TRACE_BYTES = 64 * 1024 * 1024


class _BudgetExceeded(Exception):
    pass


class _Output(_io.StringIO):
    def __init__(self):
        super().__init__()
        self.size = 0
        self.limited = False

    def write(self, text):
        encoded = text.encode('utf-8', errors='replace')
        remaining = _MAX_OUTPUT - self.size
        if len(encoded) > remaining:
            super().write(encoded[:remaining].decode('utf-8', errors='ignore'))
            self.size = _MAX_OUTPUT
            self.limited = True
            raise _BudgetExceeded('출력량 64 KiB에 도달했습니다. 반복 횟수나 출력 내용을 줄여 주세요.')
        self.size += len(encoded)
        return super().write(text)


def _run(code, stdin=None, trace=True, context=None):
    _drawing_reset()
    _graphics._reset()
    def exportable_files():
        out = {}
        for name in sorted(_os.listdir('.')):
            if name.endswith(('.csv','.txt','.json','.png','.svg')) and _os.path.isfile(name) and _os.path.getsize(name)<=2*1024*1024:
                with open(name,'rb') as handle:out[name]=handle.read()
        return out
    initial_files = {name:_hashlib.sha256(data).digest() for name,data in exportable_files().items()}
    output, errors = _Output(), _Output()
    queue = iter(stdin or [])
    events, images = [], []
    visible_images = {}
    last_location = {'line': 0}
    trace_limit = {'reached': False, 'reason': ''}
    limits = {'limited': False, 'bytes': 0}
    identities = {}  # keep references alive: Python id reuse must not merge unrelated objects
    serial = {'next': 1}
    timing = {'traceMs': 0.0}
    animation_trace = trace and 'import classroom_graphics' in code
    statement_spans = {}

    def read_input(prompt=''):
        output.write(str(prompt))
        try:
            return str(next(queue))
        except StopIteration:
            raise EOFError('입력값이 부족합니다. 입력 큐에 한 줄씩 값을 추가하고 다시 실행하세요.') from None

    env_builtins = dict(vars(_builtins))
    env_builtins['input'] = read_input
    env = {'__name__': '__main__', '__file__': _os.path.abspath(_FILENAME), '__builtins__': env_builtins}

    if type(context) is dict and type(context.get('COURSE_CSV')) is str:
        env['COURSE_CSV'] = context['COURSE_CSV']

    def snapshot(frame, event, arg=None, executed_line=0, record=True):
        if record and trace_limit['reached']:
            return
        objects = {}
        count = {'values': 0}

        def value(obj, depth=0):
            count['values'] += 1
            if count['values'] > 500:
                return {'type': 'limit', 'value': '값 개수 제한'}
            t = type(obj)
            if obj is None or t is bool:
                return obj
            if t is int:
                if obj.bit_length() > 1024:
                    return {'type': 'int', 'value': '큰 정수 (1024비트 초과)'}
                if abs(obj) > 9007199254740991:
                    return {'type': 'int', 'value': str(obj)}
                return obj
            if t is float:
                if obj != obj or obj in (float('inf'), -float('inf')):
                    return {'type': 'float', 'value': str(obj)}
                return obj
            if t is str:
                return obj[:256] + ('…' if len(obj) > 256 else '')
            pandas = _sys.modules.get('pandas')
            if pandas is not None and t in (pandas.DataFrame,pandas.Series):
                identity = id(obj)
                if identity not in identities:
                    if len(identities) >= 256:
                        return {'type': 'limit', 'value': '객체 개수 제한'}
                    identities[identity] = (str(serial['next']), obj)
                    serial['next'] += 1
                oid = identities[identity][0]
                if oid not in objects:
                    node = {'type': t.__name__, 'items': []}
                    objects[oid] = node
                    if t is pandas.Series:
                        obj = obj.to_frame(name=obj.name if obj.name is not None else 'value')
                    def cell(v):
                        vt = type(v)
                        if v is None or v is pandas.NA or v is pandas.NaT:
                            return None
                        if vt is tuple:
                            return '('+', '.join(str(cell(x)) for x in v[:8])+')'
                        if vt is pandas.Timestamp:return v.isoformat()[:256]
                        if vt in (bool, int, float, str):
                            if vt is float and v != v:return None
                            if vt is float and abs(v)==float('inf'):return str(v)
                            if vt is int and abs(v) > 9007199254740991:
                                return str(v)[:256]
                            return v[:256] if vt is str else v
                        np = _sys.modules.get('numpy')
                        if np is not None and vt in (np.int8,np.int16,np.int32,np.int64,np.uint8,np.uint16,np.uint32,np.uint64,np.float32,np.float64,np.bool_):
                            return cell(v.item())
                        return '[지원하지 않는 셀]'
                    rows, cols = obj.shape
                    node['table'] = {'shape': [rows, cols], 'index': [cell(v) for v in obj.index[:32]],
                        'columns': [cell(v) for v in obj.columns[:12]],
                        'dtypes': [str(v)[:80] for v in obj.dtypes.iloc[:12]],
                        'rows': [[cell(obj.iat[i,j]) for j in range(min(cols,12))] for i in range(min(rows,32))],
                        'truncated': rows > 32 or cols > 12}
                return {'ref': oid}
            np = _sys.modules.get('numpy')
            if np is not None and t is np.ndarray:
                identity=id(obj)
                if identity not in identities:
                    if len(identities)>=256:return {'type':'limit','value':'객체 개수 제한'}
                    identities[identity]=(str(serial['next']),obj);serial['next']+=1
                oid=identities[identity][0]
                if oid not in objects:
                    flat=obj.ravel()
                    objects[oid]={'type':'ndarray '+str(obj.shape),'size':int(obj.size),'items':[],'truncated':obj.size>32}
                    for element in flat[:32]:
                        if type(element) in (np.int8,np.int16,np.int32,np.int64,np.uint8,np.uint16,np.uint32,np.uint64,np.float32,np.float64,np.bool_,np.str_):element=element.item()
                        objects[oid]['items'].append(value(element,depth+1))
                return {'ref':oid}
            if t in (list, tuple, dict, set, frozenset):
                identity = id(obj)
                if identity not in identities:
                    if len(identities) >= 256:
                        return {'type': 'limit', 'value': '객체 개수 제한'}
                    identities[identity] = (str(serial['next']), obj)
                    serial['next'] += 1
                oid = identities[identity][0]
                if oid in objects:
                    return {'ref': oid}
                node = {'type': t.__name__, 'items': [], 'size': len(obj), 'truncated': len(obj) > 32 or depth >= 4}
                objects[oid] = node
                if depth < 4:
                    if t is dict:
                        for index, (key, item) in enumerate(obj.items()):
                            if index >= 32:
                                break
                            node['items'].append([value(key, depth + 1), value(item, depth + 1)])
                    else:
                        for index, item in enumerate(obj):
                            if index >= 32:
                                break
                            node['items'].append(value(item, depth + 1))
                return {'ref': oid}
            if t is _types.ModuleType:
                name = vars(obj).get('__name__', '')
                return {'type': '도구', 'value': (name[:80] if type(name) is str else 'Python') + ' 모듈'}
            if t is _types.FunctionType:
                return {'type': '함수', 'value': obj.__name__[:80]}
            # Only the interpreter's instance-dictionary descriptor is read.
            # A student's property named __dict__ or custom __getattribute__ is never called.
            attrs = None
            for cls in type.__getattribute__(t, '__mro__'):
                descriptor = type.__getattribute__(cls, '__dict__').get('__dict__')
                if descriptor is not None:
                    if type(descriptor) is _types.GetSetDescriptorType:
                        try: attrs = descriptor.__get__(obj,t)
                        except (TypeError, AttributeError): pass
                    break
            if type(attrs) is dict and depth < 4:
                identity=id(obj)
                if identity not in identities:
                    if len(identities)>=256:return {'type':'limit','value':'객체 개수 제한'}
                    identities[identity]=(str(serial['next']),obj);serial['next']+=1
                oid=identities[identity][0]
                if oid not in objects:
                    node={'type':t.__name__,'items':[],'size':len(attrs),'truncated':len(attrs)>32}
                    objects[oid]=node
                    for key,item in list(attrs.items())[:32]:node['items'].append([value(key,depth+1),value(item,depth+1)])
                return {'ref':oid}
            # No arbitrary repr/__str__/iteration/property calls on user-defined objects.
            return {'type': t.__name__[:80], 'value': '세부 시각화 미지원'}

        scopes = {}
        def variables(scope):
            # Inspect identical locals/globals once per event, never across lines.
            identity = id(scope)
            if identity in scopes:
                return scopes[identity]
            result = {}
            scopes[identity] = result
            for name, item in scope.items():
                if name.startswith('__'):
                    continue
                if len(result) >= 40:
                    result['…'] = {'type': 'limit', 'value': '변수 40개까지 표시'}
                    break
                result[name[:100]] = value(item)
            return result

        frames = []
        current = frame
        while current is not None:
            if current.f_code.co_filename == _FILENAME:
                frames.append(current)
                if len(frames) > 15:
                    trace_limit.update(reached=True, reason='호출 스택 15개 기록 한도')
                    return
            current = current.f_back
        entry = {
            'event': event,
            'executedLine': executed_line,
            'statementSpan': statement_spans.get(executed_line),
            'nextLine': frame.f_lineno if frame is not None and event == 'line' else 0,
            'imageIds': list(visible_images.values()),
            'graphicFrame':len(_graphics.frames)-1,
            'line': frame.f_lineno if frame is not None else 0,
            'frames': [{'id': str(id(f)), 'name': f.f_code.co_name, 'line': f.f_lineno,
                        'locals': variables(f.f_locals)} for f in reversed(frames)],
            'globals': variables(env), 'objects': objects, 'stdout': output.getvalue(),
            'drawing': _drawing_snapshot(compact=record),
        }
        if event == 'return':
            entry['detail'] = value(arg)
        elif event == 'exception':
            entry['detail'] = {'type': arg[0].__name__, 'value': '예외 발생'}
        size = len(_json.dumps(entry, ensure_ascii=False).encode('utf-8'))
        if record and (len(events) >= _MAX_EVENTS or limits['bytes'] + size > _MAX_TRACE_BYTES):
            trace_limit.update(reached=True, reason='단계 기록 20,000개 또는 64 MiB 한도 · 전체 실행은 계속됩니다.')
            return
        if record:
            limits['bytes'] += size
            events.append(entry)
        return entry

    pending_lines = {}
    exceptional = set()
    def tracer(frame, event, arg):
        if frame.f_code.co_filename != _FILENAME:
            return None
        if trace_limit['reached']:
            return None
        if event in ('line', 'call', 'return', 'exception'):
            started = _clock()
            try:
                fid=id(frame)
                previous=pending_lines.get(fid,0)
                completed=previous if event in ('line','return') and fid not in exceptional else 0
                if event=='exception':exceptional.add(fid);pending_lines.pop(fid,None)
                if event=='line':exceptional.discard(fid);pending_lines[fid]=frame.f_lineno
                if event=='return':pending_lines.pop(fid,None);exceptional.discard(fid)
                if completed:last_location['line']=completed
                snapshot(frame,event,arg,completed)
            finally:
                timing['traceMs'] += (_clock() - started) * 1000
        return tracer

    # Capture real Matplotlib show calls. Images live once in an immutable pool;
    # each trace event contains only the image versions visible at that instant.
    original_show = None
    plt = None
    def capture_figures(*args, **kwargs):
        import base64
        import hashlib
        for number in plt.get_fignums():
            image = _io.BytesIO()
            plt.figure(number).savefig(image, format='png', dpi=90)
            if image.tell() > 2 * 1024 * 1024:
                raise _BudgetExceeded('그래프 파일이 2 MiB를 넘었습니다. 크기를 줄여 주세요.')
            uri = 'data:image/png;base64,' + base64.b64encode(image.getvalue()).decode('ascii')
            if uri not in images:
                if sum(map(len, images)) + len(uri) > 12 * 1024 * 1024:
                    raise _BudgetExceeded('그래프 기록 용량에 도달했습니다. Figure 또는 크기를 줄여 주세요.')
                images.append(uri)
            visible_images[number] = images.index(uri)

    error = None
    previous_trace = _sys.gettrace()
    def capture_animation_frame():
        frame=_sys._getframe().f_back
        while frame and frame.f_code.co_filename!=_FILENAME:frame=frame.f_back
        if frame is not None:
            last_location['line']=frame.f_lineno
            snapshot(frame,'frame',executed_line=frame.f_lineno)
    try:
        if 'matplotlib.pyplot' in _sys.modules:
            import matplotlib.pyplot as plt
            plt.close('all')
            original_show = plt.show
            plt.show = capture_figures
        with _redirect_stdout(output), _redirect_stderr(errors):
            syntax = _ast.parse(code, _FILENAME, 'exec')
            # A multiline assignment is one statement, even when CPython visits
            # several expression lines before assigning its final value.
            for node in _ast.walk(syntax):
                if isinstance(node,_ast.stmt) and not hasattr(node,'body'):
                    start,end=node.lineno,getattr(node,'end_lineno',node.lineno)
                    for row in range(start,end+1):
                        old=statement_spans.get(row)
                        if old is None or end-start<old[1]-old[0]:statement_spans[row]=[start,end]
            compiled = compile(syntax, _FILENAME, 'exec')
            if trace:
                snapshot(None, 'initial')
                if animation_trace:_graphics.trace_callback=capture_animation_frame
                else:_sys.settrace(tracer)
            try:
                exec(compiled, env, env)
            finally:
                _sys.settrace(previous_trace)
            # Interactive notebook convention: any still-open Figure is also
            # displayed at successful program completion, never at step zero.
            if plt is not None:
                capture_figures()
            if trace:
                snapshot(None, 'final', executed_line=last_location['line'])
    except BaseException as exc:
        _sys.settrace(previous_trace)
        limits['limited'] = isinstance(exc, _BudgetExceeded) or output.limited or errors.limited
        tb = exc.__traceback__
        line = exc.lineno if isinstance(exc, SyntaxError) else None
        while tb:
            if tb.tb_frame.f_code.co_filename == _FILENAME:
                line = tb.tb_lineno
            tb = tb.tb_next
        message = str(exc)[:2000]
        error = {'name': type(exc).__name__, 'message': message, 'line': line,
                 'traceback': ''.join(_traceback.format_exception(type(exc), exc, exc.__traceback__))[-8000:]}
        if trace and not limits['limited']:
            snapshot(None, 'final', executed_line=last_location['line'])
    finally:
        _sys.settrace(previous_trace)
        _graphics.trace_callback=None
        if plt is not None:
            plt.show = original_show
            plt.close('all')
    final_state = snapshot(None,'final',executed_line=last_location['line'],record=False)
    files = []
    for name,data in exportable_files().items():
        if initial_files.get(name)!=_hashlib.sha256(data).digest():
            files.append({'name':name,'base64':_base64.b64encode(data).decode('ascii')})
    return {'traceKind':'animation-frame' if animation_trace else 'statement','finalState':final_state,'graphicFrames':_graphics.frames, 'animationBounded':_graphics.bounded, 'files':files, 'stdout': output.getvalue(), 'stderr': errors.getvalue(), 'events': events,
            'error': error, 'limited': limits['limited'], 'traceLimited':trace_limit['reached'],
            'traceLimitReason':trace_limit['reason'],
            'status':'error' if error else 'completed',
            'images': images, 'finalImageIds':list(visible_images.values()),
            'drawing': _drawing_snapshot(), 'drawingHistory':_drawing_history(), 'diagnostics': timing}


def run_json(request):
    data = _json.loads(request)
    result = _run(data['code'], data.get('stdin', []), data.get('trace', True), data.get('context'))
    timing = result.pop('diagnostics')
    started = _clock()
    serialized = _json.dumps(result, ensure_ascii=False)
    timing['serializationMs'] = (_clock() - started) * 1000
    return serialized[:-1] + ', "diagnostics":' + _json.dumps(timing) + '}'
