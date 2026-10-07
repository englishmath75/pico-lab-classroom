import asyncio
import time
from config import SAMPLE_MS, INFERENCE_MODE
from sensors import read_sensors
from ble_peripheral import Peripheral
from outputs import Outputs

model_load_error = False
try:
    import model
except ImportError:
    model = None
except Exception:
    model = None
    model_load_error = True

def infer(values):
    if not INFERENCE_MODE:
        return None, None, None
    if model_load_error:
        return None, None, 'MODEL_ERROR'
    if model is None or not getattr(model, 'MODEL_ID', None):
        return None, None, 'MODEL_MISSING'
    try:
        ranges = model.TRAINING_RANGES
        if not ranges or len(ranges) != 3:
            raise ValueError('missing training domain')
        if any(not lo <= value <= hi for value, (lo, hi) in zip(values, ranges)):
            return None, model.MODEL_ID, 'OUT_OF_DOMAIN'
        state = model.predict(*values)
        if state not in ('GOOD', 'DARK', 'VENTILATE', 'HOT_HUMID'):
            raise ValueError('invalid model output')
        return state, model.MODEL_ID, None
    except Exception:
        return None, model.MODEL_ID, 'MODEL_ERROR'

async def measure(peripheral, outputs):
    await asyncio.sleep_ms(2000)  # DHT power stabilization.
    seq = 0
    while True:
        started = time.ticks_ms()
        try:
            packet = read_sensors()
            state, model_id = None, getattr(model, 'MODEL_ID', None) if INFERENCE_MODE else None
            if packet['error'] is None:
                state, model_id, packet['error'] = infer([packet[k] for k in ('light','temperature','humidity')])
            outputs.update(state if packet['error'] is None else None)
            packet.update(v=1, seq=seq, uptime_ms=time.ticks_ms(), state=state, model_id=model_id)
            peripheral.publish(packet)
        except Exception as exc:
            outputs.off()
            print('measurement failed:', exc)
        seq = (seq + 1) % (2**31)
        await asyncio.sleep_ms(max(0, SAMPLE_MS-time.ticks_diff(time.ticks_ms(), started)))

async def main():
    outputs = Outputs()
    tasks = []
    try:
        peripheral = Peripheral()
        tasks = [asyncio.create_task(c) for c in (peripheral.advertise(), peripheral.send(), outputs.run(), measure(peripheral, outputs))]
        await asyncio.gather(*tasks)
    finally:
        for task in tasks:
            task.cancel()
        outputs.off()

try:
    asyncio.run(main())
finally:
    asyncio.new_event_loop()
