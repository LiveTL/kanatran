FROM ubuntu:18.04

LABEL authors="Kento Nishi <kento24gs@outlook.com>, Ronak Badhe <ronak.badhe@gmail.com>"

RUN apt-get update
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:mc3man/mpv-tests -y
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y mpv pulseaudio xvfb libxkbcommon-x11-0 libxcb-icccm4 libxcb-image0 libxcb-keysyms1 libxcb-randr0 libxcb-render-util0 libxcb-xinerama0 libxcb-xinput0 libxcb-xfixes0 alsa-utils mpv jq
RUN apt-get remove -y youtube-dl
ADD https://yt-dl.org/latest/youtube-dl /usr/bin/youtube-dl
RUN chmod +x /usr/bin/youtube-dl
ADD https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb /tmp/google-chrome.deb
ADD https://bootstrap.pypa.io/get-pip.py /tmp/get-pip.py
RUN apt-get install -y /tmp/google-chrome.deb
RUN apt-get install -y python3.8 python3.8-distutils
RUN python3.8 /tmp/get-pip.py
ADD watcher /usr/src/watcher

CMD ["bash", "/usr/src/watcher/kanatran.bash"]
