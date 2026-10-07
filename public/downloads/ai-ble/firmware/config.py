"""Teacher must confirm the kit SKU and driver before enabling outputs."""
DEVICE_NAME = 'P2W-01'
SERVICE_UUID = '7e57c001-6f5b-4c8a-9d2e-73b1a0c2d301'
TX_UUID = '7e57c002-6f5b-4c8a-9d2e-73b1a0c2d301'
LIGHT_PIN, DHT_PIN, LED_PIN, BUZZER_PIN = 26, 16, 15, 14
SAMPLE_MS = 3000
TEMP_MIN, TEMP_MAX = 0, 50  # Confirm against the selected 3.3V DHT11 SKU.
INFERENCE_MODE = False  # Lessons 3-5: collection. Set True for lessons 7-8.
SOUND_ENABLED = False
# Selected design: 3.3V input-compatible ACTIVE buzzer driver module.
# GP14 drives only the module IN, never the buzzer load directly.
