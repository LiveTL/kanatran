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
# default instances is 3
make start instances=1
# instances are tagged by their index
make attach name=kanatran_watcher_1
```
