import functools
import io
import sys
import time

import requests
import youtube_dl

def suppress(default, exception=Exception):
    def wrapper(func):
        @functools.wraps(func)
        def inner(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except exception as e:
                print(e, file=sys.stderr)
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
