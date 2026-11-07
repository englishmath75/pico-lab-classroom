# 통합 실습 배포와 복구

## 기준

- 원본: englishmath75/pico-lab-classroom
- 작업 브랜치: work/sw-integrated-20261107
- 실제 운영에서 출발한 소스: 03889ab04520ad2beea3d21d6080dc133536f396
- 변경 전 게시: englishmath75/sw @ b1d44df6f1e6efb0c6af8e946f82d90b051b3393
- 원본 main의 c38e7ce5e057b68898d086dde1caaaceae4f6d00은 운영 기준보다 오래되어 출발점으로 쓰지 않습니다.
- Firebase: englishmath-python-classroom. 기존 사용자·학급·교사·공용 PC 정책을 유지합니다.

## 새 예제 추가

`sw/exercises.json`의 영구 ID, 교사 코드, 코드 버전, 준비 파일·입력, 출력 종류, 기록 방식, 저장 버전, 기대 결과를 등록합니다. 파일 속 원문 위치는 `inventory.json`에 대응시킵니다. `register-exercises.mjs`는 기존 수업 원문을 보존하며 독립 실행에 필요한 앞 단계 맥락을 덧붙입니다.

`/?page=exercise&exercise=<등록 ID>`가 공통 편집기·실행·기록·계정 저장을 사용합니다. 제목이나 순서가 바뀌어도 ID를 바꾸지 않습니다. 새 ID는 유한 허용 목록과 권한 회귀 검증에 포함해야 합니다. 설치 명령·출력·C++·HTML 작품을 Python으로 오분류하지 않습니다.

`node sw/audit-exercises.mjs`는 미분류, 중복 ID, 빈 교사 코드, 알 수 없는 런타임, 감사되지 않은 수업 소스 변경을 거부합니다. 새로운 원문을 검토·등록한 뒤에만 `--refresh`로 소스 해시를 갱신합니다. 실행 결과는 `catalog-runtime.json`에 남깁니다.

## 배포 순서

1. 운영 site-version.json, 게시 release-source.json, 원본 및 게시 브랜치 최신 SHA를 다시 대조합니다.
2. `npm ci`, `npm ci --prefix sw`, `npm run build:sw`로 빌드합니다. 빌드는 반드시 새 Vite 산출물에서 시작합니다.
3. 기존 게시 package_site.py, finalize_brand.py, check_site.py를 실행합니다.
4. `.github/workflows/sw-integrated-validation.yml`의 현재 커밋 검사 결과와 120행 검증표를 확인합니다. CI 성공은 운영 계정·학교 PC 검증 성공을 뜻하지 않습니다.
5. 기존 Firebase 규칙과 `sw/security/integration-proposed.rules`를 비교합니다. 변경은 SW 소유자 저장 경로의 명시적 실습 ID 추가뿐입니다. MK/PY 허용 목록과 교사 권한은 변경하지 않습니다. 적용한 규칙 해시와 적용 사실을 별도 기록합니다.
6. 게시 저장소의 검증 워크플로 경로/브랜치 확인 조건을 새 검증 경로와 일치시킨 뒤, 성공한 정확한 소스 SHA·검증 run·규칙 기록으로 명시적으로 고정합니다. 옛 규칙 승인 기록을 새 규칙 적용 증거로 재사용하지 않습니다.
7. 운영에서 버전·한글·실행·처음 단계·Turtle·CSV·로그인·실제 저장·복원을 확인합니다.

## 되돌리기

변경 전 소스 03889ab04520ad2beea3d21d6080dc133536f396와 게시 b1d44df6f1e6efb0c6af8e946f82d90b051b3393의 release-source.json/게시 스크립트 조합으로 재빌드·배포합니다. 동시 변경이 있으면 최신 게시 내용을 먼저 검토하고 필요한 배포 선언만 되돌립니다. 다른 사이트나 학생 데이터를 삭제하지 않습니다.

새 실습 ID 허용은 기존 권한을 확장하지 않는 추가 저장 공간입니다. 롤백 때 이미 작성된 학생 기록을 지우지 않습니다. 기존 파일을 복원한 뒤 공개 사이트에서 해당 소스 SHA와 대표 수업을 다시 확인합니다.

## 검증 자료

`sw/evidence/integration-20261107/`에 원문 전수 목록, 등록 실습 목록, 실제 Python 결과, 단계 경계, 작품 수정, 모바일 화면, 에뮬레이터 계정 분리·교사 제출 결과, 120행 검증표를 보관합니다. FIELD_PENDING은 실제 학교 PC 검증 전까지 그대로 둡니다.
