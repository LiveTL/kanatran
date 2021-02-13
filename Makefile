name = kanatran_watcher_1
instances = 1

.built: watcher docker-compose.yml
	@docker-compose build
	@touch .built

build: .built

start: build
	@docker-compose up -d --scale $(name)=$(instances)

attach: 
	@docker attach $(name)

stop:
	@docker stop $(name)

kill:
	@docker kill $(name)

.PHONY: build start attach stop kill
