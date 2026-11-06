# 공유 Firebase 규칙 변경 검토 — 승인 및 운영 적용 완료
현재 프로젝트 englishmath-python-classroom의 기본 Firestore 활성 규칙 전체 31,905자를 학교 계정으로 확인했습니다. SHA256은 707b90cfdef2e7604aeb2ea43aa81efc23fc02badd801e3fbebb966eb9806687이며 last-confirmed.rules와 정확히 같습니다. 읽기 증거는 live-read-20261107.json입니다.

[proposed.rules](proposed.rules)는 33,831자입니다. SW users/UID의 기존 25개 활동에 신규 64개 고정 활동 ID를 추가하는 함수와 기존 SW 검사 5곳만 바꿉니다. 기존 workspaceId 함수와 MK/cohort/개인 영역 전체는 바이트 단위로 동일합니다.

학생 승인·담당 교사·자기 UID·필드·버전·20,000자·하루 150회·서버 15초/클라이언트 16초 간격·이력 10개·별도 제출 경계는 유지합니다. 학생 문서·승인·staff·기록을 수정하거나 삭제하지 않습니다. 루트의 오래된 firestore.rules는 배포하지 않습니다.

전체 규칙 회귀 시험과 29개 가상 계정 저장·분리 시험은 GitHub Actions에서 수행합니다. 최종 성공 실행은 ACCEPTANCE_RESULTS.md를 참조하세요.

사용자의 명시적 승인 후 활성 규칙 전체를 다시 읽어 기존 해시와 일치함을 확인했습니다. 2026-11-07 01:58 KST에 제안 규칙을 게시했고, 콘솔을 새로고침하여 활성 규칙 전체가 제안 33,831자와 정확히 일치함을 확인했습니다. 적용 SHA256: 81db0ec12e9bba91504f847af089b92656ba5c21216787459198ecb66f6eee1e. 증거: [production-applied-20261107.json](production-applied-20261107.json), [활성 버전 화면](../review-evidence/rules-published-20261107.jpg).

복구는 검증된 이전 SW source/publisher 조합의 재게시로 합니다. 새 기록을 지우거나 MK 권한을 되돌리지 않습니다. 규칙 복구가 필요하면 새 기록과 MK를 보존하는 별도 수정안을 검토합니다.

위 64개 고정 SW 활동 확장에 대한 승인과 게시·재대조는 완료했습니다. 사이트 운영 배포 및 실계정 검증 상태는 [58개 검증표](../ACCEPTANCE_RESULTS.md)를 따릅니다.
