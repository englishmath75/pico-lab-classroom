# SW 배포·복구 절차

운영 게시 저장소는 englishmath75/sw, Pages 경로와 도메인은 그대로 유지합니다. source main을 자동 추적하던 예약 배포를 검증된 source SHA + 성공 CI run 번호를 읽는 release-source.json 방식으로 고정합니다. MK 브랜치/PR39를 main에 합칠 필요가 없습니다.

1. 통합 source의 CI 전체 성공을 확인합니다.
2. 현재 전체 Firebase 규칙과 비교한 SW 유한 활동 확장안의 운영 승인을 별도로 받습니다.
3. 승인 기록 후 publisher의 release-source.json에 그 정확한 source SHA와 validation_run을 지정합니다.
4. publisher는 해당 커밋만 체크아웃하여 build:sw → 기존 경로 정리·브랜드·다운로드 검사 → Pages 게시 → 공개 Python 실행·메뉴·아바타 무카메라 검사를 수행합니다.
5. 공개 site-version.json에서 source/publisher SHA를 각각 대조합니다. 새 source main 커밋은 예약 배포 대상으로 자동 선택되지 않습니다.

정상 복구 기준쌍: source c38e7ce5e057b68898d086dde1caaaceae4f6d00 / publisher 17162105ba32ac5075017115901800cb298068a0.
복구 전 이 두 커밋의 빌드·패키징 결과를 격리 환경에서 재현합니다. 현재 운영 코드에는 새 학생 기록이 있으므로 데이터와 새 승인/교사 정보를 삭제하거나 되돌리지 않습니다.

긴급 복구는 이 기준쌍으로 만든 정적 산출물을 기존 Pages에 게시하고, publisher 예약 배포의 source pin도 기준 source로 유지하는 별도 복구 커밋을 적용합니다. 통합 릴리스가 자동 재게시되지 않도록 핀 검사에서 새 통합 source 선택을 막습니다. 오래된 root firestore.rules를 다시 배포하는 방식은 사용하지 않습니다. MK와 상용 외부 서비스 배포는 복구 대상이 아닙니다.

복구 핀의 mode는 baseline, source_sha는 위 c38e7ce…이며 baseline_publisher_sha는 171621…입니다. validation_run은 rollback 작업이 성공한 통합 검증 run, baseline_validation_source_sha는 그 run의 소스 커밋입니다. check-release.mjs가 허용된 기준쌍 및 성공한 재빌드 작업을 확인하므로 예약 실행도 이 기준쌍만 유지합니다.
