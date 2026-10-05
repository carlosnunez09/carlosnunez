HUGO := .tools/hugo/hugo

.PHONY: setup dev preview build
setup:
	sh scripts/setup.sh

dev: setup
	$(HUGO) server -D --cacheDir "$(CURDIR)/.tools/cache" --destination .tools/dev

preview: setup
	$(HUGO) server --environment production --gc --minify --disableLiveReload --cacheDir "$(CURDIR)/.tools/cache" --destination .tools/preview

build: setup
	$(HUGO) --environment production --gc --minify --cacheDir "$(CURDIR)/.tools/cache" --destination .tools/build
