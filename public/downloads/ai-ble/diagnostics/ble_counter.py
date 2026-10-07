"""Diagnostic counter, NOT measurements. Separate schema prevents CSV collection."""
import asyncio
import time
from ble_peripheral import Peripheral

async def counter(p):
    n = 0
    while True:
        p.publish({'diagnostic': 'counter', 'count': n})
        print('DIAGNOSTIC counter', n)
        n += 1
        await asyncio.sleep_ms(3000)

async def main():
    p = Peripheral()
    await asyncio.gather(p.advertise(), p.send(), counter(p))

asyncio.run(main())
