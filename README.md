# Kanatran
[![Build Runner](https://github.com/LiveTL/kanatran/actions/workflows/build_runner.yaml/badge.svg)](https://github.com/LiveTL/kanatran/actions/workflows/build_runner.yaml)
[![Build Watcher](https://github.com/LiveTL/kanatran/actions/workflows/build_watcher.yaml/badge.svg)](https://github.com/LiveTL/kanatran/actions/workflows/build_watcher.yaml)
<!-- [![Deploy to Production](https://github.com/LiveTL/kanatran/actions/workflows/deploy.yaml/badge.svg)](https://github.com/LiveTL/kanatran/actions/workflows/deploy.yaml) -->

## Usage


1. Pull the latest images
    ```bash
    docker pull ghcr.io/livetl/watcher:latest
    docker pull ghcr.io/livetl/runner:latest
    ```
1. Create a bridge network
    ```bash
    docker network create -d bridge kanatran
    ```
1. Configure a `.env` file
    ```bash
    = # livetl api key
    = # controller address
    =ghcr.io/livetl/watcher # watcher image
    =https://api.livetl.app # api url
    =kanatran # inter-container communication network. usually a docker bridge
    =6969 # inter-container communication port. 42069 is taken XD
    =100% # max cpu usage at which container can start. (ex. 69%)
    =100% # max mem usage at which container can start. can be either % or standard file size notation (ex. 69%, 420MB, 21GB)
    ```
    | Variable | Description | Default | Required | Values |
    |:---------|:------------|:--------|:---------|:-------|
    | `LIVETL_API_KEY` | LiveTL API Key | `` | ✅ | String |
    | `CONTROLLER_URL` | Controller Address | `` | ✅ | String |
    | `WATCHER_IMAGE` | Watcher Image Name | `watcher` | ✅ | String |
    | `API_URL` | API URL | `` | ✅ | String |
    | `INTERCOM_NETWORK` | Inter-container Bridge Network Name | `kanatran` | ✅ | String |
    | `INTERCOM_PORT` | Inter-container Bridge Port | `6969` | ❌ | Integer |
    | `MAX_CPU` | Max CPU Usage | `100%` | ❌ | Percentage (`__%`) |
    | `MAX_MEM` | Max Memory Usage | `100%` | ❌ | Bytes (`__GB`, `__MB`, etc.), Percentage (`__%`) |
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
