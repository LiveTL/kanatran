import asyncio
import os
import re
import sys
from pathlib import Path
from pprint import pprint
from threading import Thread
from typing import Optional

import translators as ts
import aiohttp
from autoselenium import chrome
from workers import WebSpeechSlave
from yt import YTLiveService
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from models import ClientError, TranscriptEvent
from pyvirtualdisplay import Display
from transcribe import aio_write_transcripts

static = Path(__file__).resolve().parent / "../public"

app = FastAPI()
app.mount("/static", StaticFiles(directory=static), name="static")
session = aiohttp.ClientSession()


class Disp(Display):
    def __del__(self):
        self.stop()
        super().__del__()


display = Disp(visible=0, size=(800, 600))
display.start()

# defaults to kanata
# print("Using ch", os.environ.get("CHANNEL_ID"))
# ytl = YTLiveService(os.environ.get("CHANNEL_ID", "UCZlDXzGoo7d44bwdNObFacg"))

translate = ts.bing


async def translate(jap: str) -> Optional[str]:
    if 0:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: ts.bing(jap))
    return None


async def get_video_id() -> Optional[str]:
    return os.environ.get("VIDEO")


def launch_selenium() -> None:
    global web  # Avoid garbage collection
    chrome.setup_driver()
    web = chrome.get_selenium(True)
    try:
        web.switch_to.window("1")
    except Exception:
        pass
    web.get("http://localhost:42069/static/index.html")


@app.post("/error")
async def error(err: ClientError):
    print("Got error message:", err.message)
    return 200


@app.post("/refresh")
async def refresh():
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, web_speech.refresh)
    return 200


@app.post("/transcript")
async def transcript_event(transcript: TranscriptEvent):
    print("Got transcript:", transcript.text)
    print("At time:", transcript.timestamp)
    print("Browser translation:", transcript.translation)
    vid = await get_video_id()
    await aio_write_transcripts(
        vid, transcript.text, transcript.translation, transcript.srtTime, transcript.timestamp
    )
    return 200


@app.get("/info")
async def info():
    return {"api_key": os.environ.get("LIVETL_API_KEY")}


@app.get("/")
async def root():
    return {"message": "Hello World"}

web_speech = WebSpeechSlave("http://localhost:42069")
web_speech.start()
