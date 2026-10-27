"""Student narration must contain teaching, without production disclosures."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
for episode in ['lesson02','lesson02-part2']:
    out=root/'public/pandas-data-lab/videos'/episode
    scenes=json.loads((out/'timeline.json').read_text())['scenes']
    for scene in scenes:
        for phrase in ['재현','녹화','촬영','합성 음성','합성음성','목소리','영상 제작']:
            assert phrase not in scene['speech'], (episode,scene['title'],phrase)
    for phrase in ['목소리','실제 화면 녹화','합성 음성','합성음성']:
        assert phrase not in (out/'captions.vtt').read_text(), (episode,phrase)
print('PASS: both episodes contain lesson narration only')
