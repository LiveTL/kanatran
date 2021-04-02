import asyncio
import os
import sys
from multiprocessing import Process
from pathlib import Path
from pprint import pprint
from threading import Thread
from typing import Optional

from autoselenium import chrome
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from models import ClientError, Log, Timestamp
from pyvirtualdisplay import Display
from workers import WebSpeechSlave
from yt import get_timestamp

static = Path(__file__).resolve().parent / "../public"

app = FastAPI()
app.mount("/static", StaticFiles(directory=static), name="static")


class Disp(Display):
    def __del__(self):
        self.stop()
        super().__del__()


display = Disp(visible=0, size=(800, 600))
display.start()

# defaults to kanata
# print("Using ch", os.environ.get("CHANNEL_ID"))
# ytl = YTLiveService(os.environ.get("CHANNEL_ID", "UCZlDXzGoo7d44bwdNObFacg"))

old_print = print

# TODO Figure out a less jank way to control uvicorn's logging
def print(*args, sep=" ", end="\n", **kwargs):
    pstr = sep.join(args) + end
    Process(target=old_print, args=(pstr,)).start()

async def get_video_id() -> Optional[str]:
    return os.environ.get("VIDEO")


@app.get("/timestamp", response_model=Timestamp)
async def timestamp():
    vid = await get_video_id()
    loop = asyncio.get_event_loop()
    timestamp = await loop.run_in_executor(None, get_timestamp, vid)
    return Timestamp(current=timestamp)


@app.post("/error")
async def error(err: ClientError):
    print("/error", err.message, file=sys.stderr)
    return 200


@app.post("/logs")
async def transcript_event(log: Log):
    print("/logs", log.text, file=sys.stderr)
    return 200


@app.get("/env")
async def info():
    return os.environ


@app.get("/")
async def root():
    return {"message": "Hello World"}


web_speech = WebSpeechSlave("http://localhost:42069")
web_speech.start()
