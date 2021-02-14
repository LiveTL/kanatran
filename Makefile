name = watcher

build:
	@docker-compose build

spawn: 
	@docker-compose up -d $(name)

start: build spawn

.pull:
	@git fetch --all
	@git pull --autostash

update: .pull build