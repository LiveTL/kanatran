FROM mhart/alpine-node:14

LABEL authors="Kento Nishi <kento24gs@outlook.com>, Ronak Badhe <ronak.badhe@gmail.com>"
LABEL org.opencontainers.image.source=https://github.com/LiveTL/kanatran

ADD runner/src /usr/src/runner
WORKDIR /usr/src/runner
RUN npm install
ADD Makefile /usr/src/runner/Makefile

CMD ["node", "index.js"]
