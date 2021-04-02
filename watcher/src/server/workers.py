import gc
import os
import time
from threading import Event, Lock, Thread

from autoselenium import chrome


class WebSpeechSlave(Thread):

    def __init__(self, host: str):
        super().__init__(daemon=True)
        self._host = host
        self._web = None
        self._refresh_lock = Lock()
        chrome.setup_driver()

    def run(self):
        chrome.setup_driver()
        self.refresh()

    def refresh(self):
        with self._refresh_lock:
            newweb = chrome.get_selenium(True)
            newweb.get(f"{self._host}/static/index.html")
            del self._web
            gc.collect()
            self._web = newweb
