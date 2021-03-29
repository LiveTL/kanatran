# Kanatran

## Usage

### Configure a `.env` file
```env
LIVETL_API_KEY=
CONTROLLER_URL=
WATCHER_IMAGE=watcher
MAX_CONTAINERS=2
CHROME_REFRESH=10
```

### Run the pre-built image
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
