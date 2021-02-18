FROM ubuntu:18.04

LABEL authors="Kento Nishi <kento24gs@outlook.com>, Ronak Badhe <ronak.badhe@gmail.com>"

RUN apt-get update
RUN apt-get install -y xvfb libxkbcommon-x11-0 libxcb-icccm4 libxcb-image0 libxcb-keysyms1 libxcb-randr0 libxcb-render-util0 libxcb-xinerama0 libxcb-xinput0 libxcb-xfixes0
RUN apt-get install -y curl mpv pulseaudio jq alsa-utils
RUN apt-get install -y python3.8 python3.8-distutils
RUN apt-get remove -y youtube-dl
RUN curl -L https://yt-dl.org/latest/youtube-dl -k -o /usr/bin/youtube-dl
RUN chmod +x /usr/bin/youtube-dl
RUN curl -L https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o /tmp/google-chrome.deb
ADD https://bootstrap.pypa.io/get-pip.py /tmp/get-pip.py
RUN apt-get install -y /tmp/google-chrome.deb
RUN python3.8 /tmp/get-pip.py
ADD watcher /usr/src/watcher
RUN python3.8 -m pip install -r /usr/src/watcher/server/requirements.txt

CMD ["bash", "/usr/src/watcher/kanatran.bash"]
