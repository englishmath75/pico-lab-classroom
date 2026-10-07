from machine import Pin
import asyncio
import time
from config import LED_PIN, BUZZER_PIN, SOUND_ENABLED

class Outputs:
    def __init__(self):
        self.led = Pin(LED_PIN, Pin.OUT, value=0)
        self.buzzer = Pin(BUZZER_PIN, Pin.OUT, value=0)
        self.candidate = self.state = None
        self.repeats = 0
        self.beep = 0
        self.last_beep = None

    def off(self):
        self.led.off()
        self.buzzer.off()
        self.state = self.candidate = None
        self.repeats = self.beep = 0

    def update(self, state):
        if state not in ('GOOD', 'DARK', 'VENTILATE', 'HOT_HUMID'):
            self.off()
            return
        self.repeats = self.repeats + 1 if state == self.candidate else 1
        self.candidate = state
        if self.repeats >= 3 and state != self.state:
            self.state = state
            if SOUND_ENABLED and (self.last_beep is None or time.ticks_diff(time.ticks_ms(), self.last_beep) >= 30000):
                self.beep = {'VENTILATE': 1, 'HOT_HUMID': 2}.get(state, 0)

    async def run(self):
        phase = 0
        try:
            while True:
                state = self.state
                self.led.value(state == 'DARK' or (state == 'VENTILATE' and phase % 20 < 10)
                               or (state == 'HOT_HUMID' and phase % 4 < 2))
                if self.beep and state:
                    count, self.beep = self.beep, 0
                    self.last_beep = time.ticks_ms()
                    for _ in range(count):
                        if self.state != state:
                            break
                        self.buzzer.on()
                        await asyncio.sleep_ms(80)
                        self.buzzer.off()
                        await asyncio.sleep_ms(100)
                phase += 1
                await asyncio.sleep_ms(100)
        finally:
            self.off()
