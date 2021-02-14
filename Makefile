video = 'KpSLiHAYe7k'

build:
	@docker-compose build

update: .pull build

start: build spawn

spawn:
	@docker-compose down
	@docker-compose run -d -e VIDEO=$(video) --name $(video) watcher

.pull:
	@git fetch --all
	@git pull --autostash

