"""CPython peripheral stubs test policy only; not a MicroPython/hardware acceptance."""
import ast
import asyncio
import json
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[2]
FW=ROOT/'public/downloads/ai-ble/firmware'

class Pin:
    OUT=1
    def __init__(self,*args,**kwargs):self.level=kwargs.get('value',0)
    def value(self,v=None):
        if v is not None:self.level=int(v)
        return self.level
    def on(self):self.level=1
    def off(self):self.level=0

def load(name,modules,strip_last=False):
    module=types.ModuleType(name)
    tree=ast.parse((FW/(name+'.py')).read_text())
    if strip_last:tree.body=tree.body[:-1]
    with patch.dict(sys.modules,modules):exec(compile(tree,str(FW/(name+'.py')),'exec'),module.__dict__)
    return module

class FirmwareTests(unittest.TestCase):
    def config(self):return load('config',{})

    def test_sensor_errors_do_not_reuse_old_values(self):
        class Dht:
            fail=False
            def __init__(self,*a):pass
            def measure(self):
                if self.fail:raise OSError('unplugged')
            def temperature(self):return 25
            def humidity(self):return 50
        modules={'config':self.config(),'machine':types.SimpleNamespace(Pin=Pin,ADC=lambda pin:types.SimpleNamespace(read_u16=lambda:12345)),'dht':types.SimpleNamespace(DHT11=Dht)}
        sensor=load('sensors',modules)
        self.assertIsNone(sensor.read_sensors()['error'])
        sensor.env_sensor.fail=True
        self.assertEqual(sensor.read_sensors(),dict(light=None,temperature=None,humidity=None,error='DHT_READ'))
        sensor.env_sensor.fail=False
        self.assertEqual(sensor.read_sensors()['light'],12345)

    def test_output_three_samples_invalid_off_and_sound_rate(self):
        config=self.config();config.SOUND_ENABLED=True
        clock={'now':0}
        timer=types.SimpleNamespace(ticks_ms=lambda:clock['now'],ticks_diff=lambda a,b:a-b)
        outputs=load('outputs',{'config':config,'machine':types.SimpleNamespace(Pin=Pin),'time':timer})
        device=outputs.Outputs()
        for _ in range(2):device.update('DARK')
        self.assertIsNone(device.state)
        device.update('DARK');self.assertEqual(device.state,'DARK')
        device.last_beep=0
        for _ in range(3):device.update('HOT_HUMID')
        self.assertEqual(device.beep,0)
        clock['now']=30000
        for _ in range(3):device.update('VENTILATE')
        self.assertEqual(device.beep,1)
        device.led.on();device.buzzer.on();device.update(None)
        self.assertEqual((device.led.value(),device.buzzer.value(),device.state,device.beep),(0,0,None,0))

    def test_inference_missing_model_outside_domain_no_fallback(self):
        config=self.config()
        fake=types.SimpleNamespace(MODEL_ID=None,TRAINING_RANGES=None,predict=lambda *x:None)
        modules={'config':config,'sensors':types.SimpleNamespace(read_sensors=lambda:{}),'ble_peripheral':types.SimpleNamespace(Peripheral=object),'outputs':types.SimpleNamespace(Outputs=object),'model':fake}
        main=load('main',modules,strip_last=True)
        self.assertEqual(main.infer([100,25,50]),(None,None,None))
        main.INFERENCE_MODE=True
        self.assertEqual(main.infer([100,25,50])[2],'MODEL_MISSING')
        fake.MODEL_ID='dt-123456789abc';fake.TRAINING_RANGES=[(100,200),(20,30),(40,60)];fake.predict=lambda *x:'DARK'
        self.assertEqual(main.infer([100,25,50])[0],'DARK')
        self.assertEqual(main.infer([99,25,50])[2],'OUT_OF_DOMAIN')
        fake.predict=lambda *x:None
        self.assertEqual(main.infer([100,25,50])[2],'MODEL_ERROR')

    def test_ble_fragments_at_most_20_bytes_and_single_message_reassembles(self):
        sent=[]
        class Characteristic:
            def __init__(self,*a,**k):pass
            def notify(self,connection,data):sent.append(data)
        aio=types.SimpleNamespace(sleep_ms=None)
        class Done(Exception):pass
        async def sleep(ms):
            if ms==20:raise Done()
        aio.sleep_ms=sleep
        module=load('ble_peripheral',{'config':self.config(),'asyncio':aio,'bluetooth':types.SimpleNamespace(UUID=lambda x:x),'aioble':types.SimpleNamespace(Service=lambda x:x,Characteristic=Characteristic,register_services=lambda *x:None)})
        p=module.Peripheral();p.connection=types.SimpleNamespace(is_connected=lambda:True)
        packet=dict(v=1,seq=1,uptime_ms=3000,light=12345,temperature=25,humidity=50,state=None,model_id=None,error=None)
        p.publish(packet)
        coroutine=p.send()
        try:
            with self.assertRaises(Done):coroutine.send(None)
        finally:coroutine.close()
        self.assertTrue(all(4<len(f)<=20 for f in sent))
        self.assertEqual([f[2] for f in sent],list(range(len(sent))))
        self.assertEqual(json.loads(b''.join(f[4:] for f in sent)),packet)

if __name__=='__main__':unittest.main(verbosity=2)
