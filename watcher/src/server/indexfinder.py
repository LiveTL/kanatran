import json
import sys
from pathlib import Path

static = Path(__file__).resolve().parent / "../"

with open(f"{static}/channels.json", "r") as fin:
    vtubers = json.load(fin)

for i, v in enumerate(vtubers):
    if sys.argv[1].lower() in v["name"].lower():
        print(i, v)
