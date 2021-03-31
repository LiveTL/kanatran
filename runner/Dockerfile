FROM mhart/alpine-node:14

LABEL authors="Kento Nishi <kento24gs@outlook.com>, Ronak Badhe <ronak.badhe@gmail.com>"
LABEL org.opencontainers.image.source=https://github.com/LiveTL/kanatran

RUN apk update && apk add --no-cache docker-cli
ADD runner/src /usr/src/runner
ADD runner/package.json /usr/src/runner/package.json
ADD runner/package-lock.json /usr/src/runner/package-lock.json
WORKDIR /usr/src/runner
RUN npm install

CMD ["node", "index.js"]
