video = 'svnnDIUQ2m8'

build:
	@docker-compose build

update: .pull build

start: build spawn

stop:
	@docker-compose down

spawn:
	@docker-compose down
	@docker-compose run -d -e VIDEO=$(video) --name $(video) watcher

.pull:
	@git fetch --all
	@git pull --autostash --rebase

