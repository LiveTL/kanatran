FROM ubuntu:18.04

LABEL authors="Kento Nishi <kento24gs@outlook.com>, Ronak Badhe <ronak.badhe@gmail.com>"

RUN apt update
ADD watcher /usr/src/watcher

CMD ["bash"]
