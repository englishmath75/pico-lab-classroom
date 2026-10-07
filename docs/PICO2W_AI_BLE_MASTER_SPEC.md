# PICO 2 W AI + BLE CLASSROOM · MASTER SPEC

## Goal
Extend the existing ARDUINO → PICO classroom with an 8-class Pico 2 W course that connects:
sensor data → BLE → CSV → Google Colab Decision Tree → edge inference → BLE dashboard.

## Route
- Existing app remains unchanged by default.
- New course: ?view=ai-ble

## Hardware
- Raspberry Pi Pico 2 W with pre-soldered headers
- breadboard, USB data cable
- CDS + 10kΩ
- DHT11
- LED + 220Ω
- buzzer
- optional ultrasonic sensor

## 8 classes
1. Pico 2 W + MicroPython setup
2. CDS/DHT11 sensor data
3. BLE peripheral and phone discovery
4. JSON sensor telemetry over BLE
5. feature/label + CSV dataset
6. Decision Tree in Colab
7. export learned rules to predict()
8. AI smart-classroom final project

## AI integrity rule
Do not present a teacher-authored if/elif rule as “trained AI”.
The model must first be trained in Colab, then the learned tree rules are transferred to Pico.

## BLE contract
- NUS-like service UUID: 6e400001-b5a3-f393-e0a9-e50e24dcca9e
- TX notify UUID: 6e400003-b5a3-f393-e0a9-e50e24dcca9e
- payload: newline-delimited JSON
  {"light":12345,"temperature":25.1,"humidity":52.0,"state":"GOOD"}

## Web requirements
- Reuse current visual language and components.
- Preserve existing Arduino/PWM/C/Pico views.
- New page must work responsively on school PCs and Android phones.
- Use Web Bluetooth only after explicit user click.
- Show a clear unsupported-browser message.
- Store only learning progress in localStorage. Do not store student names or personal data.

## Acceptance criteria
- npm run build passes.
- Existing views continue to load.
- ?view=ai-ble opens without console fatal errors.
- 8 lesson completion state persists after reload.
- BLE button opens browser device picker on a supported browser.
- Incoming JSON updates four cards: light, temperature, humidity, state.
- Malformed BLE text is shown in log without crashing the page.
- Back button returns to the integrated classroom.
