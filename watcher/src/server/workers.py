import gc
import os
import time
from threading import Event, Lock, Thread

from autoselenium import chrome


class WebSpeechSlave(Thread):
    """
    Opens up web speech in the browser

    export CHROME_REFRESH="x" to refresh chrome after x minutes
                                default is 10
    """

    refresh_interval = 60 * int(os.environ.get("CHROME_REFRESH", 5))

    def __init__(self, host: str):
        super().__init__(daemon=True)
        self._host = host
        self._web = None
        self._refresh_lock = Lock()
        chrome.setup_driver()

    def run(self):
        chrome.setup_driver()
        while 1:
            self.refresh()
            time.sleep(self.refresh_interval)

    def refresh(self):
        with self._refresh_lock:
            newweb = chrome.get_selenium(True)
            newweb.get(f"{self._host}/static/index.html")
            del self._web
            gc.collect()
            self._web = newweb
