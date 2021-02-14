FROM ubuntu:18.04

LABEL authors="Kento Nishi <kento24gs@outlook.com>, Ronak Badhe <ronak.badhe@gmail.com>"

RUN apt update
RUN apt-get install -y curl
ADD watcher /usr/src/watcher

CMD ["bash", "/usr/src/watcher/kanatran.bash"]
