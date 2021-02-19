video = 'xHP6lpOepk4'
# https://youtu.be/DMmJZ1q2ZN8?t=778

build:
	@docker-compose build

update: .pull build

start: build stop spawn

stop:
	@docker-compose down

spawn:
	@docker-compose run -d -e VIDEO=$(video) --name $(video) watcher

.pull:
	@git stash
	@git reset --hard HEAD
	@git checkout master
	@git fetch --all
	@git pull
	@npm install
