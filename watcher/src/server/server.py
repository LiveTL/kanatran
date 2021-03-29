import asyncio
import functools
import io
import os
import re
import sys
from pathlib import Path
from pprint import pprint
from threading import Thread
from typing import Optional

import aiohttp
import requests
import translators as ts
import youtube_dl
from autoselenium import chrome
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from models import ClientError, Log, Timestamp
from pyvirtualdisplay import Display
from workers import WebSpeechSlave
from yt import YTLiveService, get_timestamp

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


@app.get("/timestamp", response_model=Timestamp)
async def timestamp():
    vid = await get_video_id()
    loop = asyncio.get_event_loop()
    timestamp = await loop.run_in_executor(None, get_timestamp, vid)
    return Timestamp(current=timestamp)


@app.post("/error")
async def error(err: ClientError):
    print("Got error message:", err.message)
    return 200


@app.post("/refresh")
async def refresh():
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, web_speech.refresh)
    return 200


@app.post("/logs")
async def transcript_event(log: Log):
    print(log.text)
    return 200


@app.get("/env")
async def info():
    return os.environ


@app.get("/")
async def root():
    return {"message": "Hello World"}


web_speech = WebSpeechSlave("http://localhost:42069")
web_speech.start()
