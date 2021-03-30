import functools
import io
import sys
import time
from threading import Event, Thread
from typing import List, Optional, Tuple

import requests
import youtube_dl
from autoselenium import chrome, firefox
from bs4 import BeautifulSoup

yt = "https://www.youtube.com"
ChromeDriver = chrome.webdriver.Chrome


class YTLiveService(Thread):
    """
    Usage:

    >>> ytl = YTLiveService("UCHsx4Hqa-1ORjQTh9TYDhww")
    >>> assert ytl.live_link is None, "Kiara is not live"
    >>> assert ytl.live_link == "yt/watch?v=id", "Kiara is live"
    """

    refresh_interval = 30

    def __init__(self, channel_id: str):
        super().__init__(daemon=True)
        self._channel_link = f"{yt}/channel/{channel_id}"
        self._web: Optional[ChromeDriver] = None
        self._subscribers: List[Event] = []
        self.live_link: Optional[str] = None
        self.vid_time: Optional[int] = None
        self.curr_time: Optional[int] = None
        self.start()

    def listen(self) -> Event:
        e = Event()
        self._subscribers.append(e)
        return e

    def run(self):
        self._web = self.__get_selenium()
        while 1:
            old_link = self.live_link
            self.__update_live_link()
            if self.live_link != old_link:
                self.__update_timestamps()
                self.__publish_on_change()
            time.sleep(self.refresh_interval)

    def __publish_on_change(self) -> None:
        for sub in self._subscribers:
            sub.set()

    def __update_live_link(self) -> None:
        self._web.get(self._channel_link)
        time.sleep(2)
        soup = BeautifulSoup(self._web.page_source, "html.parser")
        try:
            if soup.find("span", {"aria-label": "LIVE"}):
                yt_endpoint = soup.find("div", {"id": "dismissable"}).find(
                    "a", {"id": "video-title"}
                )["href"]
                self.live_link = f"{yt}{yt_endpoint}"
            else:
                self.live_link = None
        except AttributeError:
            self.live_link = None

    def __update_timestamps(self):
        self.vid_time, self.curr_time = self.__get_timestamp(self.live_link)

    def __get_timestamp(self, video_link: str) -> Tuple[int, int]:
        self._web.get(video_link)
        time.sleep(10)
        video_time, current_time = self._web.execute_script(
            "return [document.querySelector('video').currentTime, new Date().getTime()]"
        )
        self._web.get(self._channel_link)
        return video_time, current_time

    @staticmethod
    def __get_selenium() -> ChromeDriver:
        firefox.setup_driver()
        web = firefox.get_selenium(False)
        return web


def suppress(default, exception=Exception):
    def wrapper(func):
        @functools.wraps(func)
        def inner(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except exception as e:
                print(e, sys=sys.stderr)
                return default

        return inner

    return wrapper


@suppress(0, KeyError)
def get_timestamp(sID):
    sys.stdout = io.StringIO()
    with youtube_dl.YoutubeDL(
        {
            "format": "bestaudio/best",
            "outtmpl": "tmp/%(id)s.%(ext)s",
            "noplaylist": True,
            "quiet": True,
            "prefer_ffmpeg": True,
            "skip_download": True,
            "audioformat": "wav",
            "forceduration": True,
        }
    ) as ydl:
        sys.stdout = sys.__stdout__
        dictMeta = ydl.extract_info(
            "https://www.youtube.com/watch?v={sID}".format(sID=sID), download=True
        )
        manifest = dictMeta["formats"][0]["manifest_url"]
        manifest_contents = requests.get(manifest).text.split("\n")
        last = manifest_contents[-2]
        head = requests.get(last).text.split("\n")
        timestamp = int(head[3].split(":")[1])
    return timestamp
