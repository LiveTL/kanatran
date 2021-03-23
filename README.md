# Kanatran

## Usage

#### Requirements
* `docker`
* `docker-compose`
* `make`
* `npm`
* `node`

### Setup
```bash
git clone https://github.com/LiveTL/Kanatran
```

Create a `.env` file with the following:
```env
LIVETL_API_KEY='api key here'
CONTROLLER_URL='controller url here'
WATCHER_IMAGE='watcher image name here (probably ghcr.io/livetl/watcher:latest)'
```

### Dev Info

#### Commands
* `make init`: Initialize the controller server
* `make build image={runner or watcher}`: Build images
* `make start`: Start the controller server
* `make run`: Run the local runner
* `make spawn video={video id}`: Start a translation container
