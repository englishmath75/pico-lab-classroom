void setup() {
  pinMode(7, OUTPUT);
  pinMode(8, INPUT);
  pinMode(2, OUTPUT);
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int cds = __01__(A0);
  int pot = __02__(A1);
  int led = map(pot, 0, 1023, __03__, __04__);

  if (__05__) {
    digitalWrite(__06__, HIGH);
  } else {
    digitalWrite(9, __07__);
  }
  analogWrite(__08__, __09__);

  digitalWrite(7, LOW);
  delayMicroseconds(2);
  digitalWrite(7, HIGH);
  delayMicroseconds(10);
  digitalWrite(7, LOW);

  float dist = pulseIn(8, HIGH, 25000) * 0.034 / 2;
  if (dist == 0) {
    dist = 999;
  }

  if (__10__) {
    __11__(2, 1000);
  } else {
    __12__(2);
  }

  Serial.print("cds=");
  Serial.print(cds);
  Serial.print(" pot=");
  Serial.print(pot);
  Serial.print(" led=");
  Serial.print(led);
  Serial.print(" dist=");
  Serial.println(dist);
  delay(100);
}
