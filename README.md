# Kanatran

# [Kanatran has been discontinued and is no longer being developed. Please read our announcement post here.](https://www.reddit.com/r/Hololive/comments/n9fvye/regarding_automatic_translations_livetl/)

An automatic livestream caption/translation system for Japanese Vtubers [WORK IN PROGRESS]

[![Build Runner](https://github.com/LiveTL/kanatran/actions/workflows/build_runner.yaml/badge.svg)](https://github.com/LiveTL/kanatran/actions/workflows/build_runner.yaml)
[![Build Watcher](https://github.com/LiveTL/kanatran/actions/workflows/build_watcher.yaml/badge.svg)](https://github.com/LiveTL/kanatran/actions/workflows/build_watcher.yaml)
[![Deploy to Production](https://github.com/LiveTL/kanatran/actions/workflows/deploy.yaml/badge.svg)](https://github.com/LiveTL/kanatran/actions/workflows/deploy.yaml)

## About

LiveTL is building an automatic livestream caption/translation system for Japanese Vtubers, and we need your support.

I'll get straight to the point: we developed a system called Kanatran to generate machine translations for Japanese Vtuber streams in realtime, and we need some funding to deploy it. Below are the things we want to achieve:
1.  Run Kantran on Japanese Hololive and Holostars streams, as well as selected agencies / independents
2.  Provide Kanatran translations to users of LiveTL 
3.  Make our automated translations accessible to other 3rd party apps and websites for watching Vtubers

To do this, we need some financial support to kickstart our efforts. Our team accepts donations through Open Collective, a platform that makes our spendings completely transparent to donators. We will use funding from supporters to run our servers and translation software. We currently have about $750, which would only last a few short months. Please consider chipping in here: https://opencollective.com/livetl

Our system is extremely low cost compared to previous attempts at machine translations, and we will make our entire transcription/translation technology completely free and open source here on GitHub. Additionally, we will make our machine translations as accessible as possible -- if you are developer that wants to access our translations, please reach out to us (preferably through our Discord server). Our goal is not to monopolize this technology, but to use it to improve the Vtuber-watching experience for everyone in this community.

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
    INTERCOM_NETWORK=kanatran
    MAX_CPU=50%
    MAX_MEM=4GB
    ```
    [View All Configurable Environment Variables](#Environment-Variables) 

1.  Run the pre-built image
    ```bash
    docker run -v /var/run/docker.sock:/var/run/docker.sock --env-file .env ghcr.io/livetl/runner
    ```

## Environment Variables

| Variable | Description | Required | Values | Default |
|:---------|:------------|:---------|:-------|:--------|
| `LIVETL_API_KEY` | LiveTL API Key | ✅ | String | ` ` |
| `WATCHER_IMAGE` | Watcher Image Name | ❌ | String | `ghcr.io/livetl/watcher` |
| `API_URL` | API URL | ❌ | String | `https://api.livetl.app` |
| `INTERCOM_NETWORK` | Inter-container Bridge Network Name | ❌ | String | `kanatran` |
| `CONTROLLER_URL` | Controller Address | ❌ | String | `wss://api.livetl.app/kanatran/controller` |
| `INTERCOM_PORT` | Inter-container Bridge Port | ❌ | Integer | `6969` |
| `MAX_CPU` | Max CPU Usage | ❌ | Percentage (`__%`) | `100%` |
| `MAX_MEM` | Max Memory Usage | ❌ | Bytes (`__GB`, `__MB`, etc.), Percentage (`__%`) | `100%` |

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

### Dev Info

#### Commands
* `make init`: Initialize the controller server
* `make build image={runner or watcher}`: Build images
* `make start`: Start the controller server
* `make run`: Run the local runner
* `make spawn video={video id}`: Start a translation container

#### Environment Variables
* `MODE`: `production` or `development` for the controller
