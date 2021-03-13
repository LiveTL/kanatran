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
LIVETL_API_KEY="api key here"
```

### Build / Run

#### Server Commands
`make init`: Initialize the controller server
`make build image={runner or watcher}`: Build images
`make start`: Start the controller server
`make run`: Run the local runner
