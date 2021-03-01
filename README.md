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
| Command | Description |
|:--------|:------------|
| `npm start` | Runs the server. |

#### Docker Commands
| Command | Description | Parameters |
|:--------|:------------|:-----------|
| `make build` | Builds the image. |  |
| `make spawn` | Spawns the container. | `video` |
| `make stop` | Stops the container. |  |
| `make start` | Builds the image and spawns the container. | `video` |
| `make update` | Pulls the latest changes on master and rebuilds the image. |  |
| `docker attach NAME` | Attach the terminal to the container `NAME`. |  |
