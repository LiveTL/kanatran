# Kanatran

## Usage

#### Requirements
* `docker`
* `docker-compose`
* `make`

### Clone
```bash
git clone https://github.com/LiveTL/Kanatran
```

### Build / Run
```bash
# default INSTANCES is 3
make start INSTANCES=1
# instances are tagged by their index
make attach NAME=kanatran_watcher_1
```
