# Copy config.py and sensors.py to Pico first. This loop is for lesson 2 only.
from sensors import read_sensors
import time
time.sleep(2)
while True:
    print(read_sensors())
    time.sleep(3)
