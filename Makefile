IMAGE = doc-ai-bot-api:latest
CONTAINER = doc-ai-bot-api

build:
	docker build -t $(IMAGE) .

rebuild:
	docker build --no-cache -t $(IMAGE) .

dev:
	npm run dev

logs:
	docker logs -f $(CONTAINER)

clean:
	docker rmi $(IMAGE)
