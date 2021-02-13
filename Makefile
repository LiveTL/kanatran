NAME ?= kanatran_watcher_1
INSTANCES ?= 1

build:
	docker-compose build

run:
	docker-compose up -d --scale $(NAME)=$(INSTANCES)

start: build run

attach: 
	docker attach $(NAME)

stop:
	docker stop $(NAME)

kill:
	docker kill $(NAME)