FROM mhart/alpine-node:14

LABEL authors="Kento Nishi <kento24gs@outlook.com>, Ronak Badhe <ronak.badhe@gmail.com>"
LABEL org.opencontainers.image.source=https://github.com/LiveTL/runner

ADD src /usr/src/runner
WORKDIR /usr/src/runner
RUN npm install 

CMD ["node", "/usr/src/runner/index.js"]
