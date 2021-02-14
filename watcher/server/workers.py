import gc
import os
import time
from threading import Event, Lock, Thread

from autoselenium import chrome

class WebSpeechSlave(Thread):
    """
    Opens up web speech in the browser

    export REFRESH_CHROME="1" to enable refreshing
    """
    refresh_interval = 60 * 15

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

    def __wait_for_refresh(self):
        if int(os.environ.get("REFRESH_CHROME", 0)):
            time.sleep(self.refresh_interval)
        else:
            Event().wait()
