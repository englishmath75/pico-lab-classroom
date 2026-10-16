void setup() {
  pinMode(7, OUTPUT);
  pinMode(8, INPUT);
  pinMode(2, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(7, LOW);
  delayMicroseconds(2);
  digitalWrite(7, HIGH);
  delayMicroseconds(10);
  digitalWrite(7, LOW);

  long duration = pulseIn(8, HIGH);
  float dist = duration * 0.034 / 2;

  if (duration > 0 && dist < 20) {
    tone(2, 1000);
  } else {
    noTone(2);
  }

  Serial.print("dist=");
  Serial.println(dist);
  delay(100);
}
