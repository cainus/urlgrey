lint:
	npx eslint .

test:
	$(MAKE) lint
	@NODE_ENV=test ./node_modules/.bin/jest

.PHONY: test
