video = 'testvideoid'

build:
	@docker-compose build

spawn:
	@docker-compose down
	@docker-compose run -d -e VIDEO=$(video) --name $(video) watcher

start: build spawn

.pull:
	@git fetch --all
	@git pull --autostash

update: .pull build