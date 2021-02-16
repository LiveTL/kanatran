"""
python run_audio.py channel_id
"""

import os
import sys
from pathlib import Path
from subprocess import Popen
from tempfile import TemporaryFile
from threading import Event, Thread

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import requests

from models import Timestamp
from yt import YTLiveService

processes = list()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/timestamp")
async def timestamp():
    return Timestamp(duration=ytl.vid_time, epoch=ytl.curr_time)


@app.get("/link")
async def link():
    return Response(content=ytl.live_link, media_type="text/html")


def fprint(*args, **kwargs) -> None:
    print(*args, **kwargs, file=sys.stderr, flush=True)


def stop_audio():
    with open(Path(__file__).parent / "../bruh.txt", "w+") as fout:
        fout.write("None")
    for p in processes:
        p.terminate()
    processes[:] = []


def play(link: str):
    fprint("Playing", link)
    with open(Path(__file__).parent / "../bruh.txt", "w+") as fout:
        fout.write(link)
    Thread(target=notify_server, daemon=True).start()


def notify_server() -> None:
    requests.post("http://localhost:42069/refresh")


def main() -> None:
    global ytl

    fprint("Starting audio monitor of", os.environ.get("CHANNEL_ID"))
    ytl = YTLiveService(os.environ.get("CHANNEL_ID"))
    change = ytl.listen()
    while 1:
        if ytl.live_link:
            play(ytl.live_link)
        else:
            fprint("Vtuber not live")
            stop_audio()
        change.wait()
        change.clear()


if __name__ == "__main__":
    try:
        fprint("RUN AUDIO INVOKING MAIN")
        main()
    except (Exception, SystemExit):
        fprint("Exiting")
        stop_audio()
else:
    Thread(target=main, daemon=True).start()
