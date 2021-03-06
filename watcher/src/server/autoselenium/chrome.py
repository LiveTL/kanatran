import os
import stat
import subprocess as sb
import sys
from pathlib import Path

import autoselenium.setup_utils as su
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

pwd = Path(".") / "drivers"
platform = su.platform

enable_headless = True


class Popen(sb.Popen):
    """
    Suppress chromedriver output on windows
    """

    def __init__(self, *args, **kwargs):
        if sys.platform[:3] == "win":
            kwargs = {
                "stdin": sb.PIPE,
                "stdout": sb.PIPE,
                "stderr": sb.PIPE,
                "shell": False,
                "creationflags": 0x08000000,
            }
        super().__init__(*args, **kwargs)


class ChromeDriver(webdriver.Chrome):
    def __init__(self, *args, **kwargs):
        old_popen = sb.Popen
        sb.Popen = Popen
        super().__init__(*args, **kwargs)
        sb.Popen = old_popen
        self.has_quit = False

    def quit(self):
        try:
            if not self.has_quit:
                self.has_quit = True
                super().quit()
        except AttributeError:
            self.has_quit = True
            super().quit()

    def __del__(self):
        self.quit()


def get_selenium(display: bool = False) -> webdriver.Chrome:
    options = __get_options(display)
    with open("bruh", "w+") as fout:
        p = str(Path(__platform_drivers[su.platform]).absolute())
        print(p, Path(p).exists(), file=fout)
    browser = ChromeDriver(executable_path=p, options=options)
    return browser


def setup_driver() -> None:
    __setup_driver()
    if (pwd / "chromedriver").exists():
        os.chmod(pwd / "chromedriver", stat.S_IEXEC)


def __get_options(display: bool) -> Options:
    options = Options()

    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--remote-debugging-port=9222")
    options.add_experimental_option(
        "prefs",
        {
            "profile.default_content_setting_values.media_stream_mic": 1,
            "profile.default_content_setting_values.media_stream_camera": 1,
            "profile.default_content_setting_values.geolocation": 1,
            "profile.default_content_setting_values.notifications": 1,
        },
    )
    # options.add_experimental_option("use-automated-extension", False)
    if enable_headless and not display:
        # options.add_argument("--disable-gpu")
        options.add_argument("--headless")
    return options


__platform_drivers = {
    "win": pwd / "chromedriver.exe",
    "darwin": pwd / "chromedriver",
    "linux": pwd / "chromedriver",
}

# TODO Find a link to latest
# maybe scrape https://chromedriver.chromium.org/downloads
version = "89.0.4389.23"

__setup_driver = su.setup_driver(
    {
        "win": [
            "https://chromedriver.storage.googleapis.com"
            f"/{version}/"
            "chromedriver_win32.zip",
            su.unzip,
        ],
        "darwin": [
            "https://chromedriver.storage.googleapis.com"
            f"/{version}/"
            "chromedriver_mac64.zip",
            su.untar,
        ],
        "linux": [
            "https://chromedriver.storage.googleapis.com"
            f"/{version}/"
            "chromedriver_linux64.zip",
            su.unzip,
        ],
    },
    __platform_drivers,
)


if __name__ == "__main__":
    setup_driver()
    web = get_selenium()
