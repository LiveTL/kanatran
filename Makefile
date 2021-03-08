video = 'xHP6lpOepk4'
env = $(shell cat .env | sed 's|\(.*\)|\-e \1|g')
# https://youtu.be/DMmJZ1q2ZN8?t=778

build:
	@docker-compose build

update: .pull build

start: build stop spawn

stop:
	@docker-compose down

spawn:
	@docker-compose run -d -e VIDEO=$(video) $(env) --name $(video) watcher

reboot: stop spawn

.pull:
	@git stash
	@git reset --hard HEAD
	@git checkout master
	@git fetch --all
	@git pull
	@npm install
