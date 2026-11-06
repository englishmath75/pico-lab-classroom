# SW V2 운영 배포 완료

[SW 운영 주소](https://sw.englishmath.kr/)에서 목차·초기화면 수정본과 실제 Python 실행을 확인했습니다.

- 소스: 7b47bc8e21de46576792ebbf754613d4a787c0e2
- 게시: f226d1004c737fe50ed7b2460f6e77435b208211
- [운영 배포 42269964662](https://github.com/englishmath75/sw/actions/runs/42269964662): 성공, 2026-11-07 03:26 KST 최종 공개 검증 완료
- 최종 전체 CI 42268100470 및 게시 후보 검사 42269961510: 성공
- 검증표: PASS 51 / BLOCKED 3 / NOT_RUN 4 / FAIL 0. 미실시 환경을 성공으로 바꾸지 않았습니다.

[58개 검증 결과](../ACCEPTANCE_RESULTS.md) · [배포 증거](production-release-20261107.json) · [실계정 독립 복원](LIVE_ACCOUNT_VERIFICATION.md) · [보호 사이트 재조회](protected-deployments-final.json) · [메뉴·저장 범위](../ACTIVITY_MAP.md) · [비교표](../COMPARISON.md) · [교사용 사용법](../TEACHER_GUIDE.md)

![최종 공개 홈](sw-home-production-final-20261107.jpg)
![최종 공개 메뉴 아래쪽](sw-menu-production-final-20261107.jpg)

실계정 저장·종료·재로그인·독립 브라우저 복원은 직전 통합 운영판 af113f4/747496d에서 완료했습니다. 최종 UI 수정은 저장 코어와 승인 규칙을 변경하지 않았으며 전체 회귀와 공개 검사를 다시 통과했습니다. 최종 수정본의 추가 Google 로그인 재검사는 브라우저 조작 시간 초과로 완료하지 않았고 별도 성공으로 계산하지 않았습니다.

기존 datalab-python-table/lesson-account-restored/avatar-common-menu/layout-390 이미지는 가상 계정 후보 화면입니다. sw-home-production-final과 sw-menu-production-final은 실제 운영 주소의 익명 화면입니다. 학교 PC·물리 카메라·실제 학생 B 등 남은 항목은 검증표를 따릅니다.
