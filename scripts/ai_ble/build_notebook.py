"""Build a reproducible, output-free ten-cell Colab notebook from canonical Python sources."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).parent

def build():
    training=(HERE/'training.py').read_text(encoding='utf-8')
    exporter=(HERE/'export_tree.py').read_text(encoding='utf-8')
    sources=[
('markdown','''# PICO 2 W AI SMART CLASSROOM\n## ① 오늘의 질문\nAI가 판단하는 규칙은 사람이 정한 것이 아니라, 학습 데이터로부터 모델이 찾은 것이다.\n다만 무엇을 정답이라고 부를지, 어떤 데이터를 모을지, 어떤 특성을 쓸지는 사람이 정한다. 모델의 판단은 그 선택과 데이터의 한계를 가진다.\n\nfeature 순서: light(raw), temperature(℃), humidity(%RH). label은 사람이 합의한 행동입니다. state를 정답으로 복사하지 않습니다. VENTILATE는 CO₂나 공기질 측정이 아니며 GOOD도 안전 보장이 아닙니다.\n\n실제 같은 키트·배선·저항으로 모은 자료만 사용합니다. 정확도는 실행 후 측정합니다. 두 상태 예비 실습은 네 상태 최종 완료와 다릅니다.\n\n수정할 것: CSV 선택, 해석 문장, 실험 가설. 고급 변환 셀의 feature 순서·전처리는 바꾸지 않습니다.'''),
('code', '''# ② 스마트폰 CSV를 PC로 옮긴 뒤 업로드 (USB 또는 학교 허용 방식)\nfrom google.colab import files\nuploaded = files.upload()\nassert uploaded, '실제 classroom CSV를 선택하세요.'\n'''),
('code', '# ③ 표·단위·품질 검사. 오류를 조용히 제외하지 않습니다.\n'+training+'''\ndf, issues, duplicates, csv_hashes = inspect_csvs(uploaded)\nprint('중복 업로드 제거:', duplicates, '오류:', len(issues))\nfor issue in issues: print(issue)\nassert not issues, '원본 CSV의 오류를 수정하고 다시 업로드하세요. 학습을 중단합니다.'\ndisplay(df.head())\nprint('단위: raw / ℃ / %RH. 온습도 소수 최대 한 자리.')\n'''),
('code', '''# ④ 실제 라벨·회차 분포와 준비 상태\nsessions = require_ready(df)\ndisplay(sessions.label.value_counts().reindex(CLASSES, fill_value=0))\ndisplay(df.label.value_counts().reindex(CLASSES, fill_value=0))\nsessions.label.value_counts().reindex(CLASSES, fill_value=0).plot.bar(title='Independent sessions by label')\nprint('회차 버튼만 다시 누른 것은 독립 자료가 아닙니다. 다른 조건/시간을 확인하세요.')\n'''),
('code', '''# ⑤ 회차 단위 train_test_split: 원시 행 무작위 분리 금지\nfrom sklearn.model_selection import train_test_split\ntrain_sessions, test_sessions = train_test_split(sessions, test_size=0.25, random_state=42, stratify=sessions.label)\ntrain = df[df.session_id.isin(train_sessions.session_id)].copy()\ntest = df[df.session_id.isin(test_sessions.session_id)].copy()\nassert set(train.session_id).isdisjoint(set(test.session_id))\nprint('회차 교집합 0 / 행수:', len(train), len(test))\n'''),
('code', '# ⑥ 학습 / 교사용 고급 셀: 같은 정수 전처리와 tree_ 변환 원본\n'+exporter+'''\nfrom sklearn.tree import DecisionTreeClassifier, export_text\nX_train, X_test = features_for_model(train), features_for_model(test)\nmodel = DecisionTreeClassifier(max_depth=3, min_samples_leaf=3, random_state=42)\nmodel.fit(X_train, train.label)\n'''),
('code', '''# ⑦ 평가: test로 fit하거나 좋은 결과가 나올 때까지 seed를 바꾸지 않습니다.\nfrom sklearn.metrics import accuracy_score, confusion_matrix\nfrom sklearn.dummy import DummyClassifier\npred = model.predict(X_test)\nbaseline = DummyClassifier(strategy='most_frequent').fit(X_train, train.label)\nmetrics = dict(train_accuracy=accuracy_score(train.label, model.predict(X_train)), accuracy=accuracy_score(test.label,pred), baseline=accuracy_score(test.label,baseline.predict(X_test)), confusion_matrix=confusion_matrix(test.label,pred,labels=CLASSES).tolist(), confusion_labels=CLASSES)\nprint(metrics)\ndisplay(pd.DataFrame(metrics['confusion_matrix'],index=CLASSES,columns=CLASSES))\ndisplay(test.loc[pred != test.label, ['light','temperature','humidity','label']])\ninterpretation = '실행 후 오분류 조건과 다수 클래스 기준을 비교해 직접 적으세요.'\nprint(interpretation)\n'''),
('code', '''# ⑧ 경로 읽기. export_text는 설명 전용이며 다시 파싱하지 않습니다.\nprint(export_text(model, feature_names=list(X_train.columns), decimals=1))\nprint('temperature_x10 <= 275라면 27.5℃ 이하. 숫자는 학습에서 얻은 것입니다.')\nprint('테스트를 반복 튜닝에 사용하지 마세요. 필요하면 train 내부에 validation 회차를 만드세요.')\n'''),
('code', '''# ⑨ 자동 변환과 동등성. 학습/평가 전체 + 변환 검사 전용 합성 1000개 + 경로별 cut±1\nmetadata = write_artifacts(model, train, test, csv_hashes, metrics)\nprint('CPython 동등성 PASS / model_id:', metadata['model_id'])\nprint('합성 입력은 변환 검사 전용이며 fit/accuracy에 사용하지 않았습니다. MicroPython 실기는 NOT_RUN입니다.')\n'''),
('code', '''# ⑩ 파일 다운로드와 새 자료 검증\nfor filename in ['model.py','model-meta.json','model-tests.json']:\n    files.download(filename)\nprint('model.py: Pico 추론 코드 / meta: 출처·평가·학습 범위 / tests: 실기 동등성 입력')\nprint('Thonny로 Pico 루트에 model.py와 model-tests.json을 저장하고 model_selftest.py를 실행하세요.')\nprint('config.py INFERENCE_MODE=True 후 재시작. 학습 범위 밖이면 OUT_OF_DOMAIN과 출력 정지.')\nprint('7~8차시는 다른 시간·조건의 새 센서 입력 10회 이상을 별도 검증하세요. 범위 안도 정답 보장은 아닙니다.')\nprint('새 검증 결과는 학습 CSV와 분리해 기록하고 실제 오분류·센서 한계·다음 수집 조건을 3문장으로 설명하세요.')\n''')]
    cells=[]
    for i,(kind,source) in enumerate(sources):
        cell=dict(cell_type=kind,id=f'classroom-{i+1:02}',metadata={},source=source.splitlines(keepends=True))
        if kind=='code': cell.update(execution_count=None,outputs=[])
        if i==5: cell['metadata']={'cellView':'form','source_hidden':True}
        cells.append(cell)
    notebook=dict(nbformat=4,nbformat_minor=5,metadata={'kernelspec':{'name':'python3','display_name':'Python 3'},'language_info':{'name':'python'},'colab':{'name':'PICO2W_AI_Classroom.ipynb'}},cells=cells)
    target=ROOT/'public/downloads/ai-ble/PICO2W_AI_Classroom.ipynb'
    target.write_text(json.dumps(notebook,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return notebook

if __name__=='__main__': build()
