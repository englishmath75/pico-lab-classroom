# Shared rules proposal — NOT DEPLOYED

Baseline: last confirmed production rules before the pause, SHA256 707b90cfdef2e7604aeb2ea43aa81efc23fc02badd801e3fbebb966eb9806687. This is NOT a fresh V2 console read. The currently connected personal Google account cannot open this project. Re-read full production rules using the authorized school account before approving any deployment.

Adds only a finite SW learning activity list through swWorkspaceId. Keeps workspaceId and the MK/cohort/public sections unchanged. All existing authentication, approval, teacher, quota, version, field and length checks remain.

Never deploy the root firestore.rules from SW main. Do not apply this candidate before regression tests, current live baseline comparison, and explicit user approval. Do not run firebase deploy as part of CI. A rollback must preserve new SW records and MK access; stop affected writes instead of deleting records.

2026-11-07 KST: 학교 계정의 Firebase Console에서 현재 게시된 전체 31,905자 규칙을 다시 읽음. last-confirmed.rules와 정확히 동일함. live-read-20261107.json 참조. 운영 적용 승인은 아직 받지 않았으며 규칙을 수정하지 않음.
