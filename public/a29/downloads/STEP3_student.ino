// A29-UNO-80-v1.1 | Arduino Uno R3 | Student starter
// Replace __01__ ... __12__. This file will not compile before completion.
// Pins: TRIG D7, ECHO D8, LED D9, passive piezo D2, CDS A0, POT A1.
const int LIGHT_LIMIT = 400;

void setup() {
  pinMode(7, OUTPUT);
  pinMode(8, INPUT);
  pinMode(9, OUTPUT);
  pinMode(2, OUTPUT);
  digitalWrite(7, LOW);
  analogWrite(9, 0);
  noTone(2);
  Serial.begin(9600);
}

void loop() {
  int light = __01__(A0);
  int pot = __02__(A1);
  int brightness = map(pot, 0, 1023, __03__, __04__);

  digitalWrite(7, LOW);
  delayMicroseconds(2);
  digitalWrite(7, HIGH);
  delayMicroseconds(10);
  digitalWrite(7, LOW);
  unsigned long duration = pulseIn(8, HIGH, 30000UL);
  float distance = duration * 0.034f / 2.0f;

  int ledPwm = 0;
  int alarm = 0;
  if (duration > 0) {
    if (__05__) {
      alarm = 1;
      if (__06__) {
        ledPwm = __07__;
      }
    }
  }

  analogWrite(9, __08__);
  if (alarm == 1) {
    __09__(2, 1000);
  } else {
    __10__(2);
  }

  Serial.print("DIST_CM=");
  if (duration > 0) {
    Serial.print(__11__);
  } else {
    Serial.print("N/A");
  }
  Serial.print(" LIGHT_RAW="); Serial.print(__12__);
  Serial.print(" POT_RAW="); Serial.print(pot);
  Serial.print(" LED_PWM_CMD="); Serial.print(ledPwm);
  Serial.print(" BUZZER_CMD="); Serial.println(alarm);
  delay(200);
}
