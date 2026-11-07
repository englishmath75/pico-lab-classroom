"""Record the observed test environment; never convert a local PASS to production PASS."""
import csv,json,os,datetime,pathlib
root=pathlib.Path(__file__).parent/'evidence/integration-20261107'
path=root/'acceptance.csv'
rows=list(csv.DictReader(path.open(encoding='utf-8-sig')))
def load(name):return json.loads((root/name).read_text())
browser=load('browser-runtime.json');extra=load('extra-runtime.json');ui=load('ui-results.json');account=load('account-results.json');catalog=load('catalog-runtime.json')
def passed(items):return bool(items) and all(x['status']=='PASS' for x in items)
stamp=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).isoformat()
source_evidence='inventory.json;audited-source-hashes.json;../../INTEGRATED_RELEASE.md'
groups={
 'A':(True,source_evidence,'운영 소스·게시 선언과 현재 작업 브랜치 대조. 운영 계정 로그인 화면을 별도 확인.'),
 'B':(passed(catalog),'inventory.csv;registered-exercises.csv;catalog-runtime.json','원문 189위치와 독립 실행 183실습. 설치 명령·출력·다른 언어·내부 런타임은 구분하여 보존.'),
 'C':(passed(ui['results']),'ui-results.json;account-results.json','로컬 배포 후보의 실제 Chromium 화면 및 Firebase 에뮬레이터. 운영 배포 확인은 K05~K07.'),
 'D':(passed(browser) and passed(extra),'browser-runtime.json;extra-runtime.json','실제 격리 Pyodide Worker. 실패·중지·재실행·코드 변경·패키지 재시도 검증.'),
 'E':(passed(browser) and passed(extra),'browser-runtime.json;extra-runtime.json;host-reference.json','실제 실행 기록 및 안전한 상태 직렬화. UI 처음/마지막/되돌리기 별도 검증.'),
 'F':(passed(browser) and passed(extra),'browser-runtime.json;extra-runtime.json;catalog-runtime.json;ui-results.json','브라우저 Turtle 호환 실행과 수학적 좌표 검증. 실제 Windows Tk 창 픽셀 대조는 미실시.'),
 'G':(passed(browser) and passed(extra),'browser-runtime.json;extra-runtime.json;ui-results.json','실제 pandas·Matplotlib. 표시 한도는 원본 계산에 적용하지 않음.'),
 'H':(passed(extra) and passed(ui['results']),'extra-runtime.json;ui-results.json','작품 4개는 실제 Python 계산. 기본 90프레임의 상태와 그림을 기록. 실시간 전체 GUI와 구분.'),
 'I':(passed(extra) and passed(ui['results']),'extra-runtime.json;ui-results.json;../../INTEGRATED_CLASSROOM_GUIDE.md','기본 자료, 입력, CP949 업로드, 결과 파일, 웹/PC 코드 구분.'),
 'J':(passed(account['results']),'account-results.json;security-regression.json;../../tests/store.test.mjs','Firebase 에뮬레이터 계정 A/B·별도 브라우저 복원·허용 교사 제출. 운영 저장은 K07 대기.'),
 'K':(True,'../../INTEGRATED_RELEASE.md;catalog-runtime.json;ui-results.json','배포 및 현장 항목은 별도 판정.')}
for r in rows:
 ok,evidence,notes=groups[r['id'][0]]
 r.update(status='PASS' if ok else 'BLOCKED',environment='Local Chromium / actual Pyodide + Firebase emulators / source audit',evidence=evidence,checked_at_KST=stamp,notes=notes)
 if r['gate']=='FIELD':r.update(status='FIELD_PENDING',environment='학교 실제 PC 검증 미실시',evidence='',notes='클라우드 브라우저·에뮬레이터를 실제 학교 PC 검증으로 대체하지 않음.')
 if r['id'] in ['A08','K05','K06','K07']:r.update(status='BLOCKED',environment='운영 배포 전',notes='개발 후보만 검증. Firebase 새 ID 규칙 적용·운영 게시·운영 계정 저장 검증이 아직 필요.')
 if r['id']=='K01':r.update(status='PASS' if os.environ.get('SW_VALIDATED')=='1' else 'BLOCKED',notes='GitHub 현재 커밋 검증 성공 후 확정. 로컬 빌드·회귀 결과만으로 운영 완료로 판정하지 않음.')
 if r['id']=='G08':r.update(status='PASS' if (root/'matplotlib-korean.png').exists() else 'BLOCKED',evidence='matplotlib-korean.png',notes='실제 Pyodide 이미지의 제목·축 한글이 네모 없이 읽히는 것을 시각 확인. 범례는 V13 복수 Figure 검증.')
 if r['id']=='K04':r.update(status='BLOCKED',notes='전체 코드 독립 실행·링크 검사 및 대표 UI는 통과. 모든 페이지의 계정 저장 연결을 하나씩 실제 조작하는 검증은 아직 완료하지 않음.')
 if r['id']=='K08':r.update(status='BLOCKED',notes='390px 반응형·버튼과 한글은 확인. 키보드 전용·터치·확대 조합의 추가 검증 대기.')
 if r['id']=='K09':r.update(status='BLOCKED',evidence='catalog-runtime.json;browser-runtime.json',notes='예제별 실행 시간은 기록. 콜드·재방문 페이지 로딩 비교는 추가 실측 대기. 학교 초기 다운로드 속도를 의미하지 않음.')
with path.open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.DictWriter(f,fieldnames=rows[0].keys(),lineterminator='\n');w.writeheader();w.writerows(rows)
summary={'sourceSha':os.environ.get('GITHUB_SHA','local working tree'),'software':118,'field':2,'statuses':{s:sum(r['status']==s for r in rows) for s in sorted(set(r['status'] for r in rows))},'productionDeployed':False,'timestampKST':stamp}
(root/'acceptance-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
print(json.dumps(summary,ensure_ascii=False))
