import time
from threading import Event, Thread
from typing import List, Optional, Tuple

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
