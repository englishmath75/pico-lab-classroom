# STEP 1 V6 source and lesson settings

- Read-only teacher source: https://www.tinkercad.com/things/h4ANNRDybN4-newstep1/editel
- Source title: 수행평가연습01_초음파_부저
- Inspected on 2026-10-16. No source circuit or code edits were made.
- Five components: Arduino Uno R3, two small breadboards, HC-SR04, piezo.
- Twelve wires recreated one at a time. Native circuit vectors, enlarged endpoints, Korean captions; this is a reconstruction, not a live Tinkercad recording.
- Source discrepancy: original TRIG wire ends at D9 (terminal x=19,y=-95 relative to Uno), while code writes pin 7. This lesson corrects the TRIG endpoint to D7 (x=45,y=-95). ECHO D8 and piezo D2 remain as observed. This difference is stated in the video.
- Original code uses dist < 50. Lesson uses dist < 20 to match the website and STEP 3; both values and their effect at 30cm are explained. duration > 0 is retained.
- Sensor supply 5V / GND; TRIG D7; ECHO D8; piezo + D2 / - GND; common power rails linked across two boards.
- pulseIn reads microseconds; dist = duration * 0.034 / 2. Serial.begin(9600), dist output, delay(100).
- No added resistor value: no discrete resistor is present in this STEP 1 source.
- Output examples are explicitly labeled code calculations, not recordings of simulator results.
- No audio track; the ON/OFF indicator explains the 1000Hz piezo state. Captions are burned in and also supplied as SRT.
- Original STEP 1 V5 remains at ../../v5/ep02/index.m3u8. STEP 2, STEP 3 and other site materials are preserved.
