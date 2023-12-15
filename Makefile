lint:
	npx eslint .

test:
	$(MAKE) lint
	@NODE_ENV=test ./node_modules/.bin/jest

lib: index.ts
	./node_modules/.bin/tsc

.PHONY: test
