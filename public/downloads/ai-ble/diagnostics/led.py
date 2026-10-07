from machine import Pin
import time
led = Pin('LED', Pin.OUT)
try:
    while True:
        led.toggle()
        time.sleep(0.5)
finally:
    led.off()
