HUGO := .tools/hugo/hugo

.PHONY: setup dev build
setup:
	sh scripts/setup.sh

dev:
	$(HUGO) server -D --destination .tools/dev

build:
	$(HUGO) --gc --minify --destination .tools/build
