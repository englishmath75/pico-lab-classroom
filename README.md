# PICO LAB | 라즈베리파이 피코 실습실

소프트웨어와 생활 수업에서 사용하는 라즈베리파이 Pico 웹 실습실입니다.

- 0차시: Thonny 설치, MicroPython 펌웨어, 인터프리터·COM 포트, 저장 위치, 라이브러리 및 연결 오류 점검
- 1~10차시: 개념 학습, Wokwi 가상 실습, Thonny로 실제 Pico 실행, 형성평가
- 학생별 진행 상황은 각 브라우저에 저장

## 웹앱 주소

저장소 이름이 `pico-lab-classroom`이면 다음 주소로 배포됩니다.

`https://englishmath75.github.io/pico-lab-classroom/`

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포

`main` 브랜치에 변경 사항이 올라오면 `.github/workflows/pages.yml`이 웹앱을 빌드하여 GitHub Pages에 자동 배포합니다.
