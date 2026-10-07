from machine import ADC, Pin
import dht
import math
from config import LIGHT_PIN, DHT_PIN, TEMP_MIN, TEMP_MAX

light_sensor = ADC(Pin(LIGHT_PIN))
env_sensor = dht.DHT11(Pin(DHT_PIN))

def read_sensors():
    try:
        env_sensor.measure()
        light = light_sensor.read_u16()
        temperature = float(env_sensor.temperature())
        humidity = float(env_sensor.humidity())
        if not (0 <= light <= 65535 and math.isfinite(temperature)
                and TEMP_MIN <= temperature <= TEMP_MAX
                and math.isfinite(humidity) and 0 <= humidity <= 100):
            raise ValueError('sensor range')
        return dict(light=light, temperature=temperature, humidity=humidity, error=None)
    except (OSError, ValueError):
        return dict(light=None, temperature=None, humidity=None, error='DHT_READ')
