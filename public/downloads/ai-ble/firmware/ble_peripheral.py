import asyncio
import bluetooth
import aioble
import json
from config import SERVICE_UUID, TX_UUID, DEVICE_NAME

class Peripheral:
    def __init__(self):
        service = aioble.Service(bluetooth.UUID(SERVICE_UUID))
        self.tx = aioble.Characteristic(service, bluetooth.UUID(TX_UUID), notify=True)
        aioble.register_services(service)
        self.connection = None
        self.pending = None
        self.message_id = 0

    def publish(self, packet):
        self.pending = packet  # Latest only; never queue stale sensor measurements.

    async def advertise(self):
        while True:
            try:
                async with await aioble.advertise(250_000, name=DEVICE_NAME,
                        services=[bluetooth.UUID(SERVICE_UUID)]) as connection:
                    self.connection = connection
                    await connection.disconnected(timeout_ms=None)
            except Exception as exc:
                print('BLE advertising:', exc)
            finally:
                self.connection = None
                self.pending = None
            await asyncio.sleep_ms(300)

    async def send(self):
        # This is the ONLY coroutine that calls notify.
        while True:
            if self.connection and self.pending is not None:
                packet, self.pending = self.pending, None
                connection = self.connection
                message_id = self.message_id
                self.message_id = (message_id + 1) % 256
                try:
                    raw = json.dumps(packet).encode('utf-8')
                    count = (len(raw) + 15) // 16
                    if not 1 <= count <= 32:
                        raise ValueError('packet too large')
                    for i in range(count):
                        if connection is not self.connection or not connection.is_connected():
                            raise OSError('disconnected')
                        self.tx.notify(connection, bytes((0xA1, message_id, i, count)) + raw[i*16:(i+1)*16])
                        await asyncio.sleep_ms(30)
                except Exception as exc:
                    print('BLE message dropped:', exc)
            await asyncio.sleep_ms(20)
