const left = [
  "GP0",
  "GP1",
  "GND",
  "GP2",
  "GP3",
  "GP4",
  "GP5",
  "GND",
  "GP6",
  "GP7",
  "GP8",
  "GP9",
  "GND",
  "GP10",
  "GP11",
  "GP12",
  "GP13",
  "GND",
  "GP14",
  "GP15",
];
const right = [
  "VBUS",
  "VSYS",
  "GND",
  "3V3_EN",
  "3V3(OUT)",
  "ADC_VREF",
  "GP28",
  "AGND",
  "GP27",
  "GP26",
  "RUN",
  "GP22",
  "GND",
  "GP21",
  "GP20",
  "GP19",
  "GP18",
  "GND",
  "GP17",
  "GP16",
];
export function HardwareBoard() {
  return (
    <figure className="my-4">
      <svg
        viewBox="0 0 440 560"
        className="w-full max-w-lg mx-auto"
        role="img"
        aria-label="USB 위 기준 Pico 2 W 핀 배치. GP26 물리31, GP16 물리21, GP15 물리20, GP14 물리19, 3V3 OUT 물리36"
      >
        <rect x="140" y="30" width="160" height="510" rx="12" fill="#14532d" />
        <rect x="195" y="8" width="50" height="40" rx="4" fill="#94a3b8" />
        <text x="220" y="75" textAnchor="middle" fill="white">
          USB ↑
        </text>
        <text x="220" y="280" textAnchor="middle" fill="white">
          Pico 2 W
        </text>
        {left.map((name, i) => (
          <g key={name + i}>
            <circle
              cx="150"
              cy={85 + i * 23}
              r="5"
              fill={i > 17 ? "#22d3ee" : "#fbbf24"}
            />
            <text x="132" y={89 + i * 23} textAnchor="end" fontSize="13">
              {i + 1} · {name}
            </text>
          </g>
        ))}
        {right.map((name, i) => (
          <g key={name + i}>
            <circle
              cx="290"
              cy={85 + i * 23}
              r="5"
              fill={[4, 9, 19].includes(i) ? "#22d3ee" : "#fbbf24"}
            />
            <text
              x="308"
              y={89 + i * 23}
              fontSize="13"
              fill={[0, 1, 3].includes(i) ? "#b91c1c" : "#0f172a"}
            >
              {40 - i} · {name}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        공식 핀맵 기준 교육용 재도식 · 실제 보드 실크와 대조 · 붉은 전원 핀을
        3V3(OUT)과 혼동하지 않기
      </figcaption>
    </figure>
  );
}
