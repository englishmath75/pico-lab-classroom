# Classroom preparation

Hardware validation: NOT_RUN. No real classroom CSV or trained model is included.
`firmware/model.py` is an untrained stub. Collection mode is the default.
Teacher: install stable RPI_PICO2_W UF2 and the complete aioble dependencies into `/lib`,
record version/hash/commit and a 3.3V-qualified DHT11 SKU in classroom-environment.json.
Copy all firmware files to Pico root using Thonny. Run diagnostics separately.
Replace model.py using the notebook's real-data training output and set INFERENCE_MODE=True.
Upload model-tests.json for the on-device self-test. Sound stays off until the driver is verified.
