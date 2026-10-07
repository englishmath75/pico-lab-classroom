# Copy the Colab-generated model.py and model-tests.json to the Pico root.
import json
import model
with open('model-tests.json') as f:
    tests = json.load(f)
assert model.MODEL_ID == tests['model_id'], 'model ID mismatch'
for i, row in enumerate(tests['tests']):
    actual = model.predict(*row['input'])
    assert actual == row['expected'], (i, actual, row['expected'])
print('MicroPython model tests PASS:', len(tests['tests']))
