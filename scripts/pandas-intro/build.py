"""Build the original first-lesson text and independently runnable examples."""
from pathlib import Path
import html, json, io, contextlib
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/pandas-data-lab'
examples=[]
base='import pandas as pd\n\nidx = ["월", "화", "수", "목", "금"]\ns = pd.Series([10, 20, 30, 40, 50], index=idx)\n'
def ex(title, code, note='', common=True):
    code=(base+'\n'+code if common else code).strip()+'\n'
    capture=io.StringIO()
    with contextlib.redirect_stdout(capture): exec(compile(code,title,'exec'),{})
    output=capture.getvalue().rstrip()
    n=len(examples)+1
    examples.append(dict(id=n,title=title,code=code,output=output))
    return f'''<article class="example" id="example-{n}"><h3><span>실습 {n:02}</span> {title}</h3><p>{note}</p><div class="lab-grid"><div><label for="code-{n}">직접 수정하는 Python 코드</label><textarea id="code-{n}" spellcheck="false" rows="{min(18,len(code.splitlines())+1)}">{html.escape(code)}</textarea><div class="tools"><button data-run="{n}">▶ 실행</button><button data-copy="{n}" class="light">복사</button><button data-download="{n}" class="light">.py 저장</button><button data-reset="{n}" class="light">예제 복원</button></div></div><div><label for="output-{n}">실제 실행 결과</label><pre id="output-{n}" class="output" aria-live="polite">실행 버튼을 누르면 결과가 나타납니다.</pre><details><summary>예상 출력 · 먼저 예측하고 펼치세요</summary><pre class="expected">{html.escape(output)}</pre></details></div></div></article>'''
sections=[]
def section(id,title,body): sections.append((id,title,body))
def table(head,rows): return '<div class="table-scroll"><table><thead><tr>'+''.join('<th>'+v+'</th>' for v in head)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+v+'</td>' for v in row)+'</tr>' for row in rows)+'</tbody></table></div>'
section('why','01. 엑셀이 있는데 왜 판다스를 배울까요?', '''<p>친구들의 일주일 독서 시간을 정리한다고 생각해 보세요. 엑셀은 셀을 클릭하여 입력하고 바로 표를 확인하기 좋습니다. 판다스는 같은 정리·계산 과정을 코드로 기록하고, 다음 주 자료에도 다시 적용하기 좋습니다. 둘은 목적에 따라 함께 사용할 수 있습니다.</p>'''+table(['비교','Excel','pandas'],[
['기본 모습','행·열로 된 워크시트, 셀에 값·수식 입력','Series·DataFrame 객체를 코드로 다룸'],['전체 값에 5 더하기','B2에 =A2+5를 넣고 아래로 채우기','s + 5'],['일부분 선택','셀 범위 A2:A4 선택','s.iloc[0:3] 또는 이름표로 .loc'],['조건에 맞는 자료','필터 기능','s[s >= 30]'],['같은 분석 반복','수식·Power Query·매크로 등으로 자동화 가능','코드를 다시 실행하여 같은 절차 재현'],['대용량 처리','워크시트 한 장에는 행·열 한도가 있음','고정된 워크시트 행 한도 대신 메모리·연산 비용의 제약'],['속도','수식 수·재계산·서식·하드웨어에 영향받음','자료형·연산 방식·메모리 사용량에 영향받음']])+'''<h3>행과 열, 그리고 2의 거듭제곱</h3><p><b>행(row)</b>은 가로 한 줄이며 위에서 아래로 쌓입니다. <b>열(column)</b>은 세로 한 줄이며 왼쪽에서 오른쪽으로 늘어납니다.</p>'''+table(['워크시트','행 수 · 세로로 쌓인 가로줄','열 수 · 가로로 나열된 세로줄'],[['Excel 2003 이전 .xls','65,536 = 2¹⁶','256 = 2⁸'],['Excel 2007 이후 .xlsx','1,048,576 = 2²⁰','16,384 = 2¹⁴']])+'''<p class="note">2¹⁰ = 1,024, 2¹⁵ = 32,768, 2¹⁶ = 65,536입니다. 최신 엑셀의 <b>워크시트</b> 한도를 말하는 것입니다.</p>'''+'')
section('history','02. NumPy와 pandas는 왜 탄생했을까요?', '''<div class="history"><article><b>2005 · NumPy</b><p>Travis Oliphant가 이전 수치 계산 도구들의 흐름을 통합하며 NumPy를 개발했습니다. 숫자를 배열로 다루고 과학·수학 계산을 효율적으로 수행하기 위한 기반입니다.</p></article><article><b>2008 · pandas</b><p>Wes McKinney가 AQR에서 데이터 분석 도구를 개발하기 시작했습니다. 이름표가 있는 표, 날짜, 빠진 값, 서로 다른 자료의 결합처럼 실제 분석의 불편을 해결하는 방향으로 발전했습니다.</p></article></div><p>1학기에 배운 NumPy의 <code>ndarray</code>는 배열 계산의 기반입니다. pandas의 <code>Series</code>는 값에 인덱스 이름표를 붙이고, <code>DataFrame</code>은 행·열이 있는 표를 제공합니다. pandas는 NumPy를 중요한 기반으로 활용하지만, 모든 열이 항상 하나의 NumPy 배열이라는 뜻은 아닙니다. 자료형에 따라 다른 배열 구현도 사용할 수 있습니다.</p><h3>벡터 연산: 코드 한 줄이 CPU 명령 한 번은 아닙니다</h3><p><code>s + 5</code>는 “이 Series의 각 값에 5를 더하라”는 뜻입니다. 내부적으로도 값을 읽고 계산하고 결과를 저장합니다. 파이썬에서 값마다 반복문을 해석하는 부담을 줄이고, 자료형에 맞는 최적화된 내부 연산을 이용할 수 있어서 효율적입니다.</p><p>기본적인 숫자 배열은 같은 크기의 값들을 규칙적인 메모리 배치로 다룰 수 있습니다. 예를 들어 64비트 정수 10,000개는 값 데이터만 약 80,000바이트가 필요합니다. 10,000개가 메모리의 한 칸에 들어가는 것이 아니라 여러 저장 공간을 차지합니다. CPU가 일부 값을 묶어서 처리할 수 있어도, 배열 전체를 무조건 한 명령으로 계산하는 것은 아닙니다.</p><p class="note"><b>오버헤드</b>는 실제 덧셈 외에 타입 확인, 반복 제어, 객체 접근 등 준비·관리 과정에 드는 비용입니다. pandas가 이 비용을 모두 없애거나, 언제나 Excel보다 빠른 것은 아닙니다.</p>'''+ex('리스트 반복문과 Series 전체 연산','''import pandas as pd

data = [10, 20, 30, 40, 50]
result = []
for value in data:
    result.append(value + 5)
print(result)

s = pd.Series(data)
print((s + 5).tolist())
print(data + [5])  # 리스트의 + 는 연결''','같은 결과를 만드는 두 방식입니다. 리스트에 [5]를 더하면 각 값에 더하지 않고 맨 뒤에 항목을 붙입니다.',False))
section('setup','03. 설치, import, 별명 pd', '''<p><b>설치</b>는 도구를 컴퓨터에 준비하는 일이고, <b>import</b>는 현재 프로그램에서 그 도구를 불러오는 일입니다. 이 사이트에서는 실행 환경을 제공합니다. VS Code에서 pandas가 없는 경우에만 선택한 Python 환경의 터미널에서 아래 명령을 실행합니다.</p><pre class="terminal">python -m pip install pandas</pre><p>위 명령은 Python 코드 창에 넣지 않습니다. 설치 후 Python 파일에서는 <code>import pandas as pd</code>를 사용합니다. <code>as pd</code>는 짧은 별명을 붙이는 문법입니다. <code>pd</code>는 관례이며 특별한 예약어는 아닙니다.</p>'''+ex('첫 Series와 자동 인덱스','''import pandas as pd

s = pd.Series([10, 20, 30])
print(s)
print(s.ndim)
print(s.shape)''','Series의 S는 대문자입니다. 인덱스를 생략하면 0, 1, 2처럼 자동으로 붙습니다. dtype은 값의 자료형, ndim은 차원 수입니다.',False)+'''<p class="note">Jupyter에서는 마지막 줄에 <code>s</code>만 써도 표시할 수 있지만, 일반 .py 파일과 이 페이지에서는 <code>print(s)</code>를 사용합니다. 출력 공백과 배열·문자열 dtype 표기는 pandas 버전에 따라 조금 다를 수 있습니다.</p>''')
section('create','04. 리스트·튜플·딕셔너리로 각각 만들기', ''+ex('세 자료형 → 같은 Series','''import pandas as pd

idx = ["월", "화", "수", "목", "금"]
data1 = [10, 20, 30, 40, 50]
data2 = (10, 20, 30, 40, 50)
data3 = {"월": 10, "화": 20, "수": 30, "목": 40, "금": 50}

s1 = pd.Series(data1, index=idx)
s2 = pd.Series(data2, index=idx)
s3 = pd.Series(data3)
print(s1)
print(s2)
print(s3)
print(s1.equals(s2), s2.equals(s3))''','리스트는 [], 튜플은 (), 딕셔너리는 {키: 값}입니다. 딕셔너리의 키는 자동으로 인덱스가 됩니다. 리스트·튜플은 값 개수와 index 개수가 같아야 합니다.',False)+ex('딕셔너리 + index는 이름을 맞춥니다','''import pandas as pd

data = {"월": 10, "화": 20, "수": 30}
s = pd.Series(data, index=["수", "월", "토"])
print(s)
print(s.isna())''','값을 순서대로 다시 붙이는 것이 아닙니다. 지정한 키를 찾아 그 순서대로 놓습니다. 없는 토요일 값은 NaN(결측값)입니다. 0과는 다릅니다.',False)+ex('하나의 값으로 채우기 · 문자열 Series','''import pandas as pd

print(pd.Series(0, index=["월", "화", "수"]))
print(pd.Series(["정보", "수학", "영어"], index=["1교시", "2교시", "3교시"]))''','스칼라 값 0은 각 이름표에 반복해서 들어갑니다. Series는 숫자뿐 아니라 문자열도 담을 수 있습니다.',False))
ident,title,body=sections[-1]
body += ex('NumPy 배열에서 Series 만들기 · 선택 복습', '\n'.join(['import pandas as pd','import numpy as np','', 'data = np.arange(10, 60, 10)','s = pd.Series(data, index=["월", "화", "수", "목", "금"])','print(data)','print(s)']), '1학기 NumPy를 연결하는 선택 예제입니다. arange(10, 60, 10)은 10부터 60 직전까지 10씩 증가합니다. 나머지 기본 예제는 pandas만 import하면 됩니다.', False)
sections[-1]=(ident,title,body)
section('structure','05. 행 위치·인덱스·값을 구별하기', table(['행 위치 · iloc','인덱스 이름표 · loc','독서 시간(분)'],[[str(i),d,str((i+1)*10)] for i,d in enumerate(['월','화','수','목','금'])])+'''<p>왼쪽 위치는 현재 나열된 순서입니다. 가운데 인덱스는 사용자가 붙인 이름표입니다. 출력에서 이름표와 값이 두 열처럼 보여도 Series는 <b>하나의 값 축을 가진 1차원 자료구조</b>입니다. 인덱스는 두 번째 데이터 열이 아닙니다.</p>'''+ex('index · values · array · dtype · size','''print(s.index)
print(s.values)
print(s.array.tolist())
print(s.to_numpy())
print(s.dtype)
print(s.size, len(s), s.ndim, s.shape)
print(s.index[0], s.index[-1])
s.name = "독서 시간"
s.index.name = "요일"
print(s)''','index·values·array·dtype·size는 속성이므로 뒤에 ()를 붙이지 않습니다. to_numpy()는 메서드입니다. 이 정수 예제의 values는 NumPy 배열이며, 다른 dtype에서는 반환 형태가 다를 수 있습니다.'))
section('select','06. 하나 또는 여러 값 선택하기', '''<p><code>.loc[이름표]</code>와 <code>.iloc[위치]</code>를 구별합니다. 이 수업의 인덱스는 중복이 없습니다. 중복 이름표가 있으면 .loc로 하나의 이름을 골라도 여러 값이 나올 수 있습니다.</p>'''+ex('이름으로 찾기, 위치로 찾기','''print(s.loc["수"])
print(s["수"])
print(s.iloc[2])
print(s.iloc[-1])
print(s.at["월"])
print(s.iat[0])''','수요일 이름표, 위치 2는 같은 30을 가리킵니다. -1은 마지막 위치입니다. at·iat는 단일 값에 접근하는 보충 문법입니다.')+ex('여러 값 선택 · 대괄호 두 겹','''print(s.loc[["월", "수", "금"]])
print(s.iloc[[0, 2, 4]])
print(s.loc[["금", "월"]])
print(type(s.loc["월"]).__name__)
print(type(s.loc[["월"]]).__name__)''','바깥 []는 선택 문법, 안쪽 []는 선택할 이름·위치의 리스트입니다. 요청한 순서대로 결과가 나옵니다. 한 값은 스칼라, 이름 하나를 리스트로 전달하면 Series입니다.')+ex('숫자 이름표도 위치가 아닙니다','''import pandas as pd

n = pd.Series([100, 200, 300], index=[10, 20, 30])
print(n.loc[20])
print(n.iloc[1])
print(n[20])
try:
    print(n.loc[0])
except KeyError:
    print("KeyError: 이름표 0은 없습니다.")''','예전 영상의 s[0]을 위치 조회로 외우지 마세요. pandas 3.0부터 정수 키는 이름표로 해석합니다. 버전에 관계없이 위치를 지정하려면 iloc를 쓰세요.',False))
section('slice','07. 슬라이싱: 시작·끝·간격', '''<p>슬라이싱은 <code>시작:끝:간격</code>으로 연속된 구간을 선택하는 문법입니다. <b>iloc는 끝 위치 제외</b>, <b>loc는 끝 이름표 포함</b>이 핵심입니다. 아래 loc 예제는 이름표가 중복되지 않고 시작·끝 이름표가 실제로 있는 경우입니다. 요일의 사전순이 아니라 현재 나열된 순서를 따릅니다.</p>'''+table(['코드','선택되는 요일','이유'],[['s.iloc[1:4]','화·수·목','위치 1, 2, 3 · 4는 제외'],['s.loc["화":"목"]','화·수·목','끝 이름표 목도 포함'],['s.iloc[:3]','월·화·수','처음부터 위치 3 직전까지'],['s.iloc[2:]','수·목·금','위치 2부터 끝까지'],['s.iloc[-3:]','수·목·금','뒤에서 세 항목'],['s.iloc[::2]','월·수·금','두 칸씩'],['s.iloc[::-1]','금·목·수·화·월','역순'],['s.iloc[4:0:-2]','금·수','위치 4, 2 · 0 제외']])+ex('loc와 iloc로 같은 구간 선택','''print(s.iloc[1:4])
print(s.loc["화":"목"])
print(s["화":"목"])
print(s.iloc[1:4].equals(s.loc["화":"목"]))''','수업에서는 명시적인 loc·iloc를 기본으로 사용합니다. 문자열 이름표 범위 s["화":"목"]도 끝 이름표를 포함합니다.')+ex('시작·끝 생략과 음수 위치','''print(s.iloc[:3])
print(s.iloc[2:])
print(s.iloc[-3:])
print(s.iloc[:-1])
print(s.iloc[:])''','음수 위치는 뒤에서 셉니다. :-1은 마지막 항목 전까지, [:]는 전체 선택입니다. 독립적으로 수정할 복사본이 필요하면 .copy()를 붙이세요.')+ex('간격과 역순 슬라이싱','''print(s.iloc[::2])
print(s.iloc[1::2])
print(s.iloc[::-1])
print(s.iloc[4:0:-2])
print(s.loc["월":"금":2])
print(s.loc["금":"화":-1])''','음수 간격은 뒤에서 앞으로 갑니다. iloc의 끝 위치는 역순에서도 제외되며 loc의 끝 이름표는 포함됩니다.')+ex('빈 범위·범위 밖·한 값과 구간','''print(s.iloc[3:1].tolist())
print(s.iloc[1:3].tolist())
print(s.iloc[3:99].tolist())
try:
    print(s.iloc[99])
except IndexError:
    print("IndexError: 위치 99는 없습니다.")''','양수 간격인데 시작이 끝보다 뒤면 빈 결과입니다. 슬라이스의 큰 끝값은 가능한 범위까지만 선택하지만 단일 위치 99는 오류입니다.')+ex('정수 인덱스에서 끝 포함 비교','''import pandas as pd

n = pd.Series([10, 20, 30, 40, 50])
print(n.loc[1:3].tolist())
print(n.iloc[1:3].tolist())''','같은 1:3이어도 loc는 이름표 1·2·3, iloc는 위치 1·2만 선택합니다. 숫자만 보고 판단하지 마세요.',False)+'''<div class="slice-demo"><h3>선택 범위 눈으로 확인하기</h3><label>예제 선택 <select id="slice-select"><option value="iloc">s.iloc[1:3]</option><option value="loc">s.loc["화":"목"]</option><option value="step">s.iloc[::2]</option><option value="reverse">s.iloc[::-1]</option></select></label><div id="slice-cells"></div><p id="slice-explanation" aria-live="polite"></p></div>''')
section('edit','08. 수정·추가: 있는 이름과 없는 이름', ex('기존 값 수정 · 범위 수정','''s.loc["월"] = 15
s.iloc[1] = 25
s.loc["수":"목"] = 0
s.loc[["월", "금"]] = [11, 55]
print(s)''','이미 있는 이름표에 대입하면 수정입니다. 두 이름에 리스트 [11, 55]를 대입하면 그 선택 순서대로 적용됩니다. 연쇄 선택 후 대입 대신 s.loc[...] = 값 형태를 사용하세요.')+ex('새 이름표 추가 · concat으로 연결','''s.loc["토"] = 60
s["일"] = 70
print(s)
extra = pd.Series({"다음 월": 80, "다음 화": 90})
combined = pd.concat([s, extra])
print(combined)
print("원본 길이:", len(s))''','없는 이름표에 대입하면 추가됩니다. iloc는 범위를 늘려 추가할 수 없습니다. Series.append는 pandas 2.0에서 제거되었으므로 pd.concat을 사용합니다. concat은 새 Series를 반환합니다.'))
section('delete','09. 삭제: drop의 결과를 어디에 담나요?', ex('drop은 기본적으로 원본을 바꾸지 않습니다','''short = s.drop("수")
print(short)
print("원본에는 수가 있나요?", "수" in s.index)
s = s.drop(["월", "금"])
print(s)''','drop은 행 위치가 아니라 인덱스 이름표를 받습니다. 원본 변수에 반영하려면 s = s.drop(...)처럼 다시 대입합니다.')+ex('inplace · del · pop 비교','''a = s.copy()
returned = a.drop("월", inplace=True)
print(returned)
print(a)

del a["화"]
removed = a.pop("수")
print("꺼낸 값:", removed)
print(a)''','inplace=True는 해당 객체를 바꾸고 None을 반환합니다. s = s.drop(..., inplace=True)는 s가 None이 되므로 사용하지 않습니다. del은 삭제, pop은 삭제하면서 값을 돌려줍니다.')+ex('없는 이름 삭제와 위치로 골라 삭제','''print(s.drop("토", errors="ignore"))
print(s.drop(s.index[0]))
try:
    s.drop(0)
except KeyError:
    print("KeyError: 이름표 0은 없습니다.")''','errors="ignore"는 없는 이름을 무시합니다. s.index[0]으로 첫 이름표를 얻어 삭제할 수 있습니다. 중복 인덱스라면 같은 이름의 항목이 함께 삭제되므로 주의하세요.'))
section('math','10. Series와 숫자 연산', ex('덧셈·뺄셈·곱셈·나눗셈','''print((s + 5).tolist())
print((s - 5).tolist())
print((s * 2).tolist())
print((s / 2).tolist())
print((s // 12).tolist())
print((s % 12).tolist())
print((s ** 2).tolist())
print("원본:", s.tolist())''','스칼라 5를 각 값에 적용하는 것을 브로드캐스팅이라고 합니다. +, -, *, /, //, %, **의 파이썬 의미는 그대로입니다. s + 5만 계산하면 원본 s는 바뀌지 않습니다.')+ex('결과 재대입과 집계','''s = s + 5
print(s)
print("합계:", s.sum())
print("평균:", s.mean())
print("최솟값:", s.min())
print("최댓값:", s.max())
print("값 개수:", s.count())''','s.sum()처럼 메서드는 ()를 붙입니다. count()는 결측값을 제외한 개수, size는 결측값을 포함한 전체 항목 수입니다.'))
section('align','11. Series끼리는 이름표를 맞춰 계산합니다', '''<p>NumPy 배열끼리의 기본 원소별 계산은 위치를 기준으로 합니다. pandas Series끼리의 기본 산술 연산은 <b>인덱스 이름표를 맞춥니다</b>. 상대 Series의 순서가 달라도 같은 이름을 찾아 계산합니다.</p>'''+ex('순서가 달라도 같은 이름끼리 더하기','''import pandas as pd

a = pd.Series([10, 20, 30], index=["월", "화", "수"])
b = pd.Series([300, 100, 200], index=["수", "월", "화"])
c = a + b
print(c.reindex(["월", "화", "수"]))
print((a - b).reindex(["월", "화", "수"]))
print((a * b).reindex(["월", "화", "수"]))
print((a / b).reindex(["월", "화", "수"]))''','월은 10+100, 화는 20+200입니다. 첫 번째 값끼리 10+300을 하지 않습니다. reindex는 출력 순서를 월·화·수로 지정한 것입니다.',False)+ex('이름이 맞지 않으면 NaN · fill_value','''import pandas as pd

a = pd.Series({"월": 10, "화": 20})
b = pd.Series({"화": 200, "수": 300})
order = ["월", "화", "수"]
r = (a + b).reindex(order)
print(r)
print(r.isna())
print(a.add(b, fill_value=0).reindex(order))
print(r.fillna(0))''','한쪽에만 있는 이름표는 기본 덧셈에서 NaN입니다. add(fill_value=0)는 더하기 전에 빠진 쪽을 0으로 처리합니다. 결과에 fillna(0)를 적용하는 것과 다릅니다. 두 쪽 모두 결측인 자리까지 항상 0이 되는 것은 아닙니다.',False)+ex('조건 비교와 필터링','''print(s >= 30)
print(s[s >= 30])
print(s[(s >= 20) & (s <= 40)])
print(s[(s < 20) | (s > 40)])''','비교 결과는 True·False Series입니다. 이 조건으로 원래 Series를 선택합니다. 여러 조건에는 각 조건의 괄호와 & 또는 |를 씁니다. 파이썬의 and·or를 그대로 쓰지 않습니다.'))
# Additional operations in the linked author's Series chapter.
extra = ex('최댓값과 그 이름표 · idxmax와 idxmin', '\n'.join(['print(s.max(), s.idxmax())','print(s.min(), s.idxmin())','best_label = s.index[0]','best_value = s.iloc[0]','for label, value in s.items():','    if value > best_value:','        best_label = label','        best_value = value','print(best_label, best_value)']), 'max는 값, idxmax는 그 값의 이름표를 반환합니다. 같은 최댓값이 여러 개라면 처음 나타난 이름표를 반환합니다. items() 반복과 결과를 비교하세요.')
extra += ex('누적 합과 누적 곱', '\n'.join(['print(s.cumsum())','factor = pd.Series([1.1, 1.2, 0.5], index=["1단계", "2단계", "3단계"])','print(factor.cumprod())','print(round(factor.cumprod().iloc[-1], 2))']), 'cumsum은 앞에서부터 합을 누적합니다. cumprod는 곱을 누적합니다. 배율 1.1 × 1.2 × 0.5의 최종 배율은 0.66입니다. 마지막 결과는 iloc[-1]로 선택합니다.')
extra += ex('중복을 제외한 종류와 빈도', '\n'.join(['import pandas as pd','', 'snack = pd.Series(["사과", "우유", "사과", "빵", "우유"])','print(snack.unique())','print(snack.nunique())','print(snack.value_counts().sort_index())']), 'unique는 서로 다른 값, nunique는 그 종류 수, value_counts는 각 값의 빈도를 구합니다. count는 전체 유효 값 개수입니다. sort_index는 이름표 순서로 결과를 정리합니다.', False)
ident,title,body=sections[-1]
sections[-1]=(ident,title,body+extra)
section('dataframe','12. Series에서 DataFrame으로 연결하기', ex('다섯 행, 세 열의 표','''import pandas as pd

idx = ["월", "화", "수", "목", "금"]
s1 = pd.Series([10, 20, 30, 40, 50], index=idx)
s2 = pd.Series((15, 25, 35, 45, 55), index=idx)
s3 = pd.Series({"월": 5, "화": 10, "수": 15, "목": 20, "금": 25})
df = pd.DataFrame({"독서": s1, "운동": s2, "복습": s3})
print(df)
print(df.shape, df.ndim)
print(df["독서"])
print(type(df["독서"]).__name__)
print(type(df[["독서"]]).__name__)''','딕셔너리의 키는 열 이름, 각 Series의 인덱스는 행 이름이 됩니다. 5행 3열이므로 정사각형일 필요가 없습니다. 한 열을 선택한 df["독서"]는 Series, df[["독서"]]는 DataFrame입니다.',False)+'')
quiz=[('s.iloc[1:4]가 선택하는 요일은?',['화·수·목','화·수·목·금','월·화·수'],0,'iloc는 끝 위치 4를 제외하여 1, 2, 3을 선택합니다.'),('s.loc["화":"목"]의 끝 이름표는?',['제외','포함'],1,'loc의 이름표 슬라이스는 이 예제에서 양 끝을 포함합니다.'),('s.iloc[-1]의 값은?',['10','40','50'],2,'-1은 마지막 위치입니다.'),('s.loc[["금", "월"]]의 값 순서는?',['10, 50','50, 10'],1,'여러 이름표를 리스트로 고르면 요청한 순서로 나옵니다.'),('s.drop("수")만 실행한 뒤 s에는 수요일이 있나요?',['있습니다','없습니다'],0,'기본 drop은 새 Series를 반환합니다. 재대입하지 않았습니다.'),('s = s.drop("월", inplace=True) 뒤 s는?',['Series','None','10'],1,'inplace=True의 반환값은 None입니다.'),('s.loc["토"] = 60은?',['기존 월요일 수정','토요일 항목 추가','항상 오류'],1,'새 이름표에 값을 대입하면 추가됩니다.'),('두 Series의 순서가 다를 때 기본 덧셈 기준은?',['위치','인덱스 이름표'],1,'같은 이름표끼리 맞춰 계산합니다.'),('없는 짝 때문에 생긴 NaN의 뜻은?',['값이 0','값이 없거나 계산 결과가 결측','문자열'],1,'NaN과 0은 다릅니다.'),('s.iloc[::2]의 값은?',['10, 30, 50','20, 40','50, 30, 10'],0,'처음 위치 0에서 두 칸씩 선택합니다.'),('s + 5 실행만으로 원본 s가 바뀌나요?',['예','아니요'],1,'변경하려면 s = s + 5처럼 결과를 대입합니다.'),('Series 출력의 인덱스와 값 때문에 Series는 2차원인가요?',['예','아니요'],1,'인덱스는 이름표이며 Series는 1차원입니다.')]
section('check','13. 기말 대비 · 결과 예측 12문항', '''<p>이 페이지에서 배운 범위의 연습 문제입니다. 전체 기말시험의 확정 출제 범위는 선생님 안내를 따릅니다. 모든 문제에서 기본 Series는 월~금 = 10·20·30·40·50입니다.</p><div id="quiz"></div><button id="grade">정답 확인 · 해설 보기</button><p id="score" role="status"></p><h3>직접 코딩 미션</h3><ol><li>월~금 운동 시간 15·30·20·45·10을 리스트와 딕셔너리로 각각 Series로 만드세요.</li><li>화~목을 loc와 iloc 두 방식으로 선택하고, 마지막 두 항목과 역순도 출력하세요.</li><li>수요일을 35로 수정하고 토요일 60을 추가한 뒤 월요일을 삭제하세요.</li><li>모든 값에 5를 더한 결과를 저장하고 평균을 구하세요.</li><li>순서가 다른 보너스 Series를 만들어 인덱스를 맞춰 더한 결과를 설명하세요.</li></ol><p>각 실습의 코드는 이 페이지를 떠나면 사라집니다. 보관하려면 .py 저장을 누르거나 기존 <a href="/?page=practice">자유 Python 실습실</a>에서 계정에 저장하세요.</p>''')
section('teacher','14. 자주 묻는 질문과 참고 자료', '''<h3>자주 묻는 질문</h3><dl><dt>괄호와 대괄호는 왜 다른가요?</dt><dd>pd.Series(...)는 객체 생성 호출, s.iloc[...]는 위치 선택입니다. s.sum()은 메서드 호출입니다.</dd><dt>요일 인덱스는 자동으로 월~금 순서가 되나요?</dt><dd>아닙니다. 처음 지정한 순서와 이후 정렬·연산에 따라 달라집니다. 결과의 인덱스를 확인하세요.</dd><dt>슬라이스를 수정하면 원본도 바뀌나요?</dt><dd>버전과 복사 정책에 따라 혼동될 수 있습니다. 독립 작업은 part = s.iloc[:3].copy(), 원본 수정은 s.loc[...] = 값으로 명시하세요.</dd><dt>예전 영상에서 s[0]과 append가 보이는데요?</dt><dd>위치 선택은 s.iloc[0], 연결은 pd.concat으로 연습하세요. 제거되거나 의미가 바뀐 옛 문법을 답안으로 외우지 않습니다.</dd></dl><h3>참고 강의 · 파이스탁</h3><p>Series 생성부터 연산까지 복습할 때 참고할 수 있는 강의와 교재입니다.</p><ul><li><a target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=bI43qd9HeVw">02. Series 생성</a></li><li><a target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=6lkGh9HpCYw">03. Series 인덱싱과 슬라이싱</a></li><li><a target="_blank" rel="noopener" href="https://wikidocs.net/160689">04 범위 · 저자 공개 교재: 수정·추가·삭제</a></li><li><a target="_blank" rel="noopener" href="https://wikidocs.net/160690">05 범위 · 저자 공개 교재: Series 연산</a></li></ul><h3>정확한 개념을 확인하는 공식 문서</h3><ul><li><a target="_blank" rel="noopener" href="https://support.microsoft.com/en-us/excel/excel-specifications-and-limits">Microsoft · Excel 사양과 제한</a></li><li><a target="_blank" rel="noopener" href="https://numpy.org/about/">NumPy 소개</a> · <a target="_blank" rel="noopener" href="https://numpy.org/doc/stable/user/whatisnumpy.html">NumPy와 벡터 연산</a></li><li><a target="_blank" rel="noopener" href="https://pandas.pydata.org/about/">pandas 개발 역사</a> · <a target="_blank" rel="noopener" href="https://pandas.pydata.org/docs/user_guide/dsintro.html">Series와 DataFrame</a></li><li><a target="_blank" rel="noopener" href="https://pandas.pydata.org/docs/user_guide/indexing.html">인덱싱·슬라이싱</a> · <a target="_blank" rel="noopener" href="https://pandas.pydata.org/docs/reference/api/pandas.Series.add.html">Series.add</a> · <a target="_blank" rel="noopener" href="https://pandas.pydata.org/docs/user_guide/scale.html">대용량 데이터의 제약</a></li></ul>''')
nav=''.join(f'<a href="#{id}">{title}</a>' for id,title,_ in sections)
body=''.join(f'<section id="{id}" class="chapter"><h2>{title}</h2>{body}</section>' for id,title,body in sections)
page='''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>판다스 첫 수업 · Series 생성부터 연산까지 | 영수쌤의 파이썬 교실</title><link rel="stylesheet" href="./pandas-intro.css"><script defer src="./python-runtime.js"></script><script defer src="./pandas-intro.js"></script></head><body><main class="intro"><section class="lesson-course"><p class="eyebrow">고2 · 소프트웨어와 생활</p><h2>02. 차시별 실습</h2><details class="lesson-picker" open><summary>현재 1차시 · 다른 차시 선택</summary><nav aria-label="차시 선택"><a href="./step-by-step.html?lesson=1" aria-current="page">1차시 · 판다스 첫 수업 · Series</a><a href="./step-by-step.html?lesson=2">2차시 · 표 살펴보기 · Series와 평균</a><a href="./step-by-step.html?lesson=3">3차시 · CSV 읽기·행과 열 선택</a><a href="./step-by-step.html?lesson=4">4차시 · 조건 검색·정렬로 선수 찾기</a><a href="./step-by-step.html?lesson=5">5차시 · 결측·중복·자료형 정리</a><a href="./step-by-step.html?lesson=6">6차시 · groupby로 팀별 평균 비교</a><a href="./step-by-step.html?lesson=7">7차시 · 단어 빈도 · 표 결합 맛보기</a><a href="./step-by-step.html?lesson=8">8차시 · Matplotlib 기후 시각화</a><a href="./step-by-step.html?lesson=9">9차시 · 인구 변화 데이터 분석</a><a href="./step-by-step.html?lesson=10">10차시 · 분석 보고서·기말 종합</a></nav></details></section><header class="intro-hero"><p class="eyebrow">1차시 · 판다스 첫 수업 · Series</p><h1>표를 이해하고,<br>데이터를 직접 다루기</h1><p>Excel에서 NumPy, pandas로 이어지는 첫걸음.<br>Series 생성 → 인덱싱·슬라이싱 → 추가·삭제·수정 → 연산</p><div class="tags"><span>기초부터 차근차근</span><span>실행 가능한 독립 예제</span><span>기말 대비 결과 예측</span></div></header><div class="intro-tools"><a href="./">수업 안내로</a><button id="download-all">전체 실습 .py 저장</button><button id="print-page" class="light">인쇄 / PDF</button><button id="stop-run" class="light" disabled>실행 중지</button><span id="run-status" role="status">각 예제는 필요한 데이터부터 새로 만듭니다.</span></div><p class="note">먼저 결과를 예측한 뒤 실행하세요. 코드는 왼쪽, 결과는 오른쪽에 표시됩니다. 휴대전화에서는 위아래로 배치됩니다. 편집 내용은 이 페이지 안에서만 유지되며 계정에 자동 저장되지 않습니다.</p><details class="toc" open><summary>수업 목차 · 원하는 부분으로 이동</summary><nav aria-label="판다스 첫 수업 목차">'''+nav+'</nav></details>'+body+'''<footer>영수쌤의 파이썬 교실 · 학습용 가상 데이터 · Series 첫 수업</footer></main><script id="intro-data" type="application/json">'''+json.dumps({'examples':examples,'quiz':quiz},ensure_ascii=False).replace('</','<'+chr(92)+'/')+'</script></body></html>'
(OUT/'pandas-intro.html').write_text(page)
(OUT/'pandas-intro-examples.json').write_text(json.dumps(examples,ensure_ascii=False,indent=2)+'\n')
print(f'Built {len(sections)} chapters, {len(examples)} executable examples, {len(quiz)} quizzes')
