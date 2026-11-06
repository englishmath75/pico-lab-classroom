"""PYLAB 360 trusted trace adapter, executed inside the browser's Pyodide Worker.
Only trusted fixtures execute this adapter under host CPython in unit tests.
"""
import builtins as _builtins
import io as _io
import json as _json
import sys as _sys
import traceback as _traceback
import types as _types
from time import perf_counter as _clock
from turtle import Turtle as _Turtle, _snapshot as _drawing_snapshot, _reset as _drawing_reset
from contextlib import redirect_stdout as _redirect_stdout, redirect_stderr as _redirect_stderr

_FILENAME = 'pylab_user_code.py'
_MAX_OUTPUT = 65536
_MAX_EVENTS = 250
_MAX_TRACE_BYTES = 2 * 1024 * 1024


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


def _run(code, stdin=None, trace=True):
    _drawing_reset()
    output, errors = _Output(), _Output()
    queue = iter(stdin or [])
    events, images = [], []
    limits = {'limited': False, 'bytes': 0}
    identities = {}  # keep references alive: Python id reuse must not merge unrelated objects
    serial = {'next': 1}
    timing = {'traceMs': 0.0}

    def read_input(prompt=''):
        output.write(str(prompt))
        try:
            return str(next(queue))
        except StopIteration:
            raise EOFError('입력값이 부족합니다. 입력 큐에 한 줄씩 값을 추가하고 다시 실행하세요.') from None

    env_builtins = dict(vars(_builtins))
    env_builtins['input'] = read_input
    env = {'__name__': '__main__', '__builtins__': env_builtins}

    def snapshot(frame, event, arg=None):
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
            if pandas is not None and t is pandas.DataFrame:
                identity = id(obj)
                if identity not in identities:
                    if len(identities) >= 256:
                        return {'type': 'limit', 'value': '객체 개수 제한'}
                    identities[identity] = (str(serial['next']), obj)
                    serial['next'] += 1
                oid = identities[identity][0]
                if oid not in objects:
                    node = {'type': 'DataFrame', 'items': []}
                    objects[oid] = node
                    if isinstance(obj.index, pandas.MultiIndex) or isinstance(obj.columns, pandas.MultiIndex):
                        node['table'] = {'unsupported': 'MultiIndex는 이번 실험실에서 지원하지 않습니다.'}
                    else:
                        def cell(v):
                            vt = type(v)
                            if v is None or v is pandas.NA or v is pandas.NaT:
                                return None
                            if vt in (bool, int, float, str):
                                if vt is float and (v != v or abs(v) == float('inf')):
                                    return None
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
                node = {'type': t.__name__, 'items': [], 'truncated': len(obj) > 32 or depth >= 4}
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
            if t is _Turtle:
                fields = object.__getattribute__(obj, '__dict__')
                x, y, angle = (fields.get(k) for k in ('x', 'y', 'angle'))
                if all(type(v) in (int, float) for v in (x,y,angle)):
                    return {'type': '펜', 'value': f"위치 ({x:.2f}, {y:.2f}) · 방향 {angle:.0f}° · " + ('내려짐' if fields.get('_down') is True else '들림')}
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
                    raise _BudgetExceeded('호출 스택 15개에 도달했습니다. 재귀 깊이를 줄여 주세요.')
            current = current.f_back
        entry = {
            'event': event,
            'line': frame.f_lineno if frame is not None else 0,
            'frames': [{'id': str(id(f)), 'name': f.f_code.co_name, 'line': f.f_lineno,
                        'locals': variables(f.f_locals)} for f in reversed(frames)],
            'globals': variables(env), 'objects': objects, 'stdout': output.getvalue(),
            'drawing': _drawing_snapshot(),
        }
        if event == 'return':
            entry['detail'] = value(arg)
        elif event == 'exception':
            entry['detail'] = {'type': arg[0].__name__, 'value': '예외 발생'}
        size = len(_json.dumps(entry, ensure_ascii=False).encode('utf-8'))
        if len(events) >= _MAX_EVENTS or limits['bytes'] + size > _MAX_TRACE_BYTES:
            raise _BudgetExceeded('여기까지 시각화: 최대 250 이벤트 또는 2 MiB 추적 예산에 도달했습니다.')
        limits['bytes'] += size
        events.append(entry)

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != _FILENAME:
            return None
        if event in ('line', 'call', 'return', 'exception'):
            started = _clock()
            try:
                snapshot(frame, event, arg)
            finally:
                timing['traceMs'] += (_clock() - started) * 1000
        return tracer

    error = None
    previous_trace = _sys.gettrace()
    try:
        with _redirect_stdout(output), _redirect_stderr(errors):
            compiled = compile(code, _FILENAME, 'exec')
            if trace:
                _sys.settrace(tracer)
            try:
                exec(compiled, env, env)
            finally:
                _sys.settrace(previous_trace)
            if trace:
                snapshot(None, 'final')
            # Matplotlib data is captured after execution; internal library lines are not traced.
            if 'matplotlib.pyplot' in _sys.modules:
                import base64
                import matplotlib.pyplot as plt
                for number in plt.get_fignums()[:3]:
                    image = _io.BytesIO()
                    plt.figure(number).savefig(image, format='png', dpi=90)
                    if image.tell() <= 2 * 1024 * 1024:
                        images.append('data:image/png;base64,' + base64.b64encode(image.getvalue()).decode('ascii'))
                plt.close('all')
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
            try:
                snapshot(None, 'final')
            except _BudgetExceeded:
                limits['limited'] = True
    finally:
        _sys.settrace(previous_trace)
    return {'stdout': output.getvalue(), 'stderr': errors.getvalue(), 'events': events,
            'error': error, 'limited': limits['limited'], 'images': images, 'drawing': _drawing_snapshot(), 'diagnostics': timing}


def run_json(request):
    data = _json.loads(request)
    result = _run(data['code'], data.get('stdin', []), data.get('trace', True))
    timing = result.pop('diagnostics')
    started = _clock()
    serialized = _json.dumps(result, ensure_ascii=False)
    timing['serializationMs'] = (_clock() - started) * 1000
    return serialized[:-1] + ', "diagnostics":' + _json.dumps(timing) + '}'
