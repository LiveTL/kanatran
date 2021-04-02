# Kanatran
[![Build Runner](https://github.com/LiveTL/kanatran/actions/workflows/build_runner.yaml/badge.svg)](https://github.com/LiveTL/kanatran/actions/workflows/build_runner.yaml)
[![Build Watcher](https://github.com/LiveTL/kanatran/actions/workflows/build_watcher.yaml/badge.svg)](https://github.com/LiveTL/kanatran/actions/workflows/build_watcher.yaml)
[![Deploy to Production](https://github.com/LiveTL/kanatran/actions/workflows/deploy.yaml/badge.svg)](https://github.com/LiveTL/kanatran/actions/workflows/deploy.yaml)

## Usage


1. Pull the latest images
    ```bash
    docker pull ghcr.io/livetl/watcher:latest
    docker pull ghcr.io/livetl/runner:latest
    ```
1. Configure a `.env` file
    ```bash
    LIVETL_API_KEY= # livetl api key
    CONTROLLER_URL= # controller address
    WATCHER_IMAGE=ghcr.io/livetl/watcher # watcher image
    API_URL=https://api.livetl.app # api url
    MAX_CPU=100% # max cpu usage at which container can start. (ex. 69%)
    MAX_MEM=100% # max mem usage at which container can start. can be either % or standard file size notation (ex. 69%, 420MB, 21GB)
    ```
1.  Run the pre-built image
    ```bash
    docker run -v /var/run/docker.sock:/var/run/docker.sock --env-file .env ghcr.io/livetl/runner
    ```

## Development

#### Requirements
* `docker`
* `docker-compose`
* `make`
* `npm`
* `node`
* `python`

### Setup
```bash
git clone https://github.com/LiveTL/Kanatran
```
Make sure to replace your `WATCHER_IMAGE` in `.env` with `watcher` to use your development image.

### Dev Info

#### Commands
* `make init`: Initialize the controller server
* `make build image={runner or watcher}`: Build images
* `make start`: Start the controller server
* `make run`: Run the local runner
* `make spawn video={video id}`: Start a translation container

#### Environment Variables
* `MODE`: `production` or `development` for the controller
