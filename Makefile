py = python3
video = 'xHP6lpOepk4'
env = $(shell cat .env | sed 's|\(.*\)|\-e \1|g')
DFLAGS = 
# https://youtu.be/DMmJZ1q2ZN8?t=778

ifdef NOCACHE
DFLAGS += --no-cache
endif

.PHONY: build update start stop spawn reboot format

build:
	@docker-compose build $(DFLAGS)

update: .pull build

start: build stop spawn

stop:
	@docker-compose down

spawn:
	@docker-compose run -d -e VIDEO=$(video) $(env) --name $(video) watcher

reboot: stop spawn

.gitignore: requirements.txt
	@$(py) -m pip install -r requirements.txt
	@touch .gitignore

node_modules: package.json
	@npm i

format: .gitignore node_modules
	@$(py) -m black watcher
	@$(py) -m isort watcher
	@./node_modules/eslint/bin/eslint.js --fix watcher/public

.pull:
	@git stash
	@git reset --hard HEAD
	@git checkout master
	@git fetch --all
	@git pull
	@npm install
