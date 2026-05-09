IMAGE = doc-ai-bot-api:latest
CONTAINER = doc-ai-bot-api

build:
	docker build --build-arg GITHUB_TOKEN=$(GITHUB_TOKEN) -t doc-ai-bot-api:latest ../doc-ai-bot-api

rebuild:
	docker build --no-cache -t $(IMAGE) .

dev:
	npm run dev

logs:
	docker logs -f $(CONTAINER)

clean:
	docker rmi $(IMAGE)
