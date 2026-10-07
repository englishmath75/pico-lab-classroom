# M5 실제 하드웨어 수용 기록

상태: **NOT_RUN — PICO 2 W NOT YET PURCHASED**. Pico 2 W는 아직 구입 전이므로 실제 하드웨어 검증을 실행하지 않았습니다.
브라우저 mock, CPython 또는 Wokwi 통과는 이 표의 PASS가 아닙니다.

## 환경 기록

`public/downloads/ai-ble/classroom-environment.json`에 UF2 버전·SHA256,
`sys.implementation`, aioble commit·전체 패키지, DHT11 SKU·3.3V 지원 근거,
부저 드라이버 SKU·전류·입력 극성, Galaxy 브라우저·OS, PC 어댑터·정책을 기록합니다.
현재 센서 계약은 DHT11 0~50℃, 습도 0~100%이며 구매품 규격 확인이 선행되어야 합니다.

| 검사 | 상태 | 기록할 증거 |
|---|---|---|
| 전원 분리 후 GP/물리핀, CDS 분압, DHT DATA 풀업, LED 330Ω 확인 | NOT_RUN | SKU·배선 점검 |
| Pin("LED"), CDS 밝음/가림 3쌍, DHT 유효값 3회 | NOT_RUN | 실제 raw/℃/%RH |
| Galaxy에서 3초 주기 5분 수신 | NOT_RUN | 수신 건수·손실·파싱 오류·측정 시간 |
| disconnect/reconnect 3회, 다른 보드 선택 혼동 확인 | NOT_RUN | 회차별 성공/실패·복구 방법 |
| DHT 분리/복구 | NOT_RUN | error/null, 수집 정지, 수동 새 회차 |
| MicroPython model-tests 전체 일치 | NOT_RUN | model_id·실행 개수·결과 |
| 새 조건/시간 실측 입력 10회 이상 | NOT_RUN | 관찰 label·state·오분류·범위 밖 |
| 출력 정책: 3회 연속, 무효 즉시 OFF, 30초 간격, 기본 무음 | NOT_RUN | LED·부저 실제 관찰 |
| 스마트폰 CSV → 학교 PC → Colab → 모델 3파일 → Pico | NOT_RUN | 각 단계 파일 열기·전송·실행 |
| 학교 PC 직접 BLE 및 미지원 안내 | NOT_RUN | 브라우저·어댑터·정책 결과 |

## 교사용 10분 사전 점검

1. 0~2분: 전원 분리, 3.3V 지원 SKU·핀·레일·저항·부저 드라이버 확인.
2. 2~4분: 보드 전용 UF2와 aioble 환경 기록, `import bluetooth, asyncio, dht, aioble`, LED와 센서 확인.
3. 4~6분: 다른 Central을 끄고 Galaxy 연결·진단 카운터·재연결 확인.
4. 6~8분: 실제 센서 송신으로 전환, 오류/null, 모델 ID/selftest, 무효 출력 정지 확인.
5. 8~10분: CSV 다운로드 위치, USB/학교 허용 전달 방식, Colab 업로드를 시연.

이 준비 점검은 위의 5분 수신·3회 재연결·10회 새 입력 수용 검사를 대체하지 않습니다.
실패 시 학생에게 코드를 임의 수정시키기 전에 예비 보드/케이블과 사전 검증한 동일 이미지를 사용합니다.

## 실제 데이터 준비

가짜 real CSV와 학습 완료 모델을 제공하지 않습니다. 같은 키트에서 라벨별 독립 4회차×5행,
총 80행 이상(권장 라벨별 5회차·총100행)을 다른 시간·조건에서 사전 수집합니다.
자료가 부족하면 부족 상태를 기록하고 보충합니다. 수치 임계값 자동 라벨이나 합성 자료로 메우지 않습니다.
두 상태 예비 실습은 네 상태 최종 프로젝트 완료와 구분합니다.

## 참조 API와 설계 선택

- [Pico 2 W 공식 핀맵](https://datasheets.raspberrypi.com/picow/pico-2-w-pinout.pdf)
- [aioble notify 원본](https://github.com/micropython/micropython-lib/blob/master/micropython/bluetooth/aioble/aioble/server.py)
- [Chrome Web Bluetooth](https://developer.chrome.com/docs/capabilities/bluetooth)
- [scikit-learn train_test_split](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html)

UUID·0xA1 프레임·3초 주기·회차 최소 수·루브릭은 본 과정 설계입니다. 제조사 성능 보장이 아닙니다.
