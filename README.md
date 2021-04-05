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
1. Create a bridge network
    ```bash
    docker network create -d bridge kanatran
    ```
1. Configure a `.env` file
    ```bash
    LIVETL_API_KEY=
    CONTROLLER_URL=wss://api.livetl.app/kanatran/
    WATCHER_IMAGE=ghcr.io/livetl/watcher
    API_URL=https://api.livetl.app
    INTERCOM_NETWORK=kanatran
    MAX_CPU=50%
    MAX_MEM=4GB
    ```
    | Variable | Description | Default | Required | Values |
    |:---------|:------------|:--------|:---------|:-------|
    | `LIVETL_API_KEY` | LiveTL API Key | ` ` | ✅ | String |
    | `WATCHER_IMAGE` | Watcher Image Name | `ghcr.io/livetl/watcher` | ❌ | String |
    | `API_URL` | API URL | `https://api.livetl.app` | ❌ | String |
    | `INTERCOM_NETWORK` | Inter-container Bridge Network Name | `kanatran` | ❌ | String |
    | `CONTROLLER_URL` | Controller Address | `wss://api.livetl.app/kanatran/controller` | ❌ | String |
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
