import json
from pathlib import Path
from typing import List


async def aio_write_transcripts(
    video: str, transcript: str, translation: str, srtTimes: List[str], timestamp: float
):
    with open("transcripts.txt", "a+") as fout:
        json.dump(
            {
                "video": video,
                "transcript": transcript,
                "translation": translation,
                "srtTimes": srtTimes,
                "timestamp": timestamp,
            },
            fout,
        )
        fout.write("\n")
