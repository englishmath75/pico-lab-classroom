export const pins = [
  {
    id: "cds",
    part: "CDS 접점",
    gpio: "GP26 / ADC0",
    physical: "31",
    connection: "3.3V → CDS → 접점(GP26) → 10kΩ → GND",
  },
  {
    id: "dht",
    part: "DHT11 DATA",
    gpio: "GP16",
    physical: "21",
    connection: "3.3V 지원 SKU만 사용. 필요시 DATA를 4.7~10kΩ으로 3.3V 풀업",
  },
  {
    id: "led",
    part: "외부 LED",
    gpio: "GP15",
    physical: "20",
    connection: "GP15 → 330Ω → LED 양극, 음극 → GND",
  },
  {
    id: "buzzer",
    part: "부저 드라이버",
    gpio: "GP14",
    physical: "19",
    connection:
      "3.3V 입력 호환 능동 부저 드라이버 모듈 IN. 부하 GPIO 직결 금지",
  },
  {
    id: "power",
    part: "센서 전원",
    gpio: "3V3(OUT)",
    physical: "36",
    connection: "3.3V 전원 레일",
  },
  {
    id: "ground",
    part: "공통 접지",
    gpio: "GND",
    physical: "38 / 23",
    connection: "센서·드라이버 공통 GND",
  },
  {
    id: "analog",
    part: "ADC 접지",
    gpio: "AGND",
    physical: "33",
    connection: "필요시 아날로그 접지",
  },
  {
    id: "onboard",
    part: "내장 LED",
    gpio: 'Pin("LED")',
    physical: "외부 핀 없음",
    connection: "무선칩 연결 LED. 새 과정에서 GP25 사용 금지",
  },
];
export const hardwareNotes = [
  "USB 커넥터가 위인 공식 핀맵과 대조하세요. VBUS(40), VSYS(39), 3V3_EN(37)은 센서용 3V3(OUT)(36)과 다릅니다. GP26에 5V를 넣지 않습니다.",
  "밝아지면 CDS 저항이 줄고 이번 회로의 접점 전압·raw가 증가합니다. ADC는 저항이 아니라 전압을 읽습니다. read_u16의 0~65535는 스케일이며 16비트 정확도나 lux가 아닙니다.",
  "DHT11 모듈 인쇄 핀 순서와 단품 NC를 확인하세요. 채택 계약은 3.3V 지원, 0~50℃ 제품이며 SKU 실기 확인은 NOT_RUN입니다. 3.3V 미지원품에 5V를 공급하고 DATA를 직결하지 않습니다.",
  "DHT는 Dallas 1-Wire와 다른 프로토콜입니다. 3초마다 읽고 오류를 0이나 이전 값으로 채우지 않습니다. 물·고온 물체·입김으로 결로를 만들지 않습니다.",
  "부저 채택 회로: 3.3V 제어 입력 호환 능동 부저 드라이버 모듈. GP14→IN, 공통 GND, 모듈 정격 전원. SKU·전류·구동 극성은 교사가 검증 후 기록합니다. 소리 기본 OFF.",
  "저항·배선·보드·ADC 스케일을 바꾸면 재수집·재학습합니다. CO₂·미세먼지·산소·감염 위험·실제 공기질을 측정하는 장치가 아닙니다.",
];
export const preparation = [
  "Pico 2 W with headers / 데이터 USB / 예비 보드와 케이블",
  "CDS / 10kΩ / 브레드보드 / 3.3V 지원 DHT11 / 필요시 풀업",
  "LED / 330Ω / 사전 검증한 능동 부저 드라이버",
  "Thonny / RPI_PICO2_W 안정 UF2 버전·SHA256 / aioble 전체 패키지·의존성",
  "Galaxy Chrome 권한·HTTPS / PC CSV 전달 / Colab 로그인 사전 확인",
  "라벨별 4회차×5행 이상 실제 사전 자료. 권장 5회차·총100행. 같은 키트·출처 확인",
];
