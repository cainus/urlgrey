REPORTER = spec

browser-test:
	$(MAKE) browser-build
	gnome-open test.html

browser-build-min:
	@rm -f urlgrey.min.js
	@./node_modules/.bin/browserify ./lib/urlgrey.js \
		-s urlgrey | \
	./node_modules/.bin/uglifyjs > urlgrey.min.js

browser-build:
	@rm -f urlgrey.js
	@./node_modules/.bin/browserify ./lib/urlgrey.js \
		-s urlgrey > urlgrey.js

precommit:
	$(MAKE) test
	$(MAKE) browser-build
	$(MAKE) browser-build-min
	echo "Artifacts built!"

test:
	@NODE_ENV=test ./node_modules/.bin/mocha -b --reporter $(REPORTER)

lib-cov:
	jscoverage lib lib-cov

test-cov:	lib-cov
	@URLGREY_COVERAGE=1 $(MAKE) test REPORTER=html-cov > coverage.html
	rm -rf lib-cov

test-coveralls:	lib-cov
	echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	@URLGREY_COVERAGE=1 $(MAKE) test REPORTER=mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js
	rm -rf lib-cov

.PHONY: test
