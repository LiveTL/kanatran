py = python3
video = 'xHP6lpOepk4'
image = 'watcher'
env = $(shell cat .env | sed 's|\(.*\)|\-e \1|g')
DFLAGS = 
# https://youtu.be/DMmJZ1q2ZN8?t=778

ifdef NOCACHE
DFLAGS += --no-cache
endif

.PHONY: build update start stop spawn reboot format

build:
	@docker-compose build $(DFLAGS) $(image)

update: .pull
	@pkill node & make start | make start

start:
	@cd controller; node src/index.js

init:
	@cd controller; npm install;

stop:
	@docker-compose down

run:
	@docker-compose run -d $(env) runner

spawn:
	@docker-compose run -d -e VIDEO=$(video) $(env) --name $(video) $(image)

.gitignore: requirements.txt
	@$(py) -m pip install -r requirements.txt
	@touch .gitignore

node_modules: package.json
	@npm i

format: .gitignore node_modules
	@$(py) -m black .
	@$(py) -m isort .
	@./node_modules/eslint/bin/eslint.js --fix .

.pull:
	@git stash
	@git reset --hard HEAD
	@git checkout master
	@git fetch --all
	@git pull
	@cd controller; npm install;
