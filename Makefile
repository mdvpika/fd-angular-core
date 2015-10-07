SRC_FILES = $(shell find src -name '*.js')
LIB_FILES = $(patsubst src/%.js, lib/%.js, $(SRC_FILES))

all: lib dist doc

clean:
	rm -r lib dist

lib: $(SRC_FILES)
	babel --out-dir=lib --source-maps=true --module=umdStrict --stage=0 src
	@touch lib

doc: dist
	jsdoc -r -d ./doc ./dist/*.js
	@touch doc

dist: lib $(LIB_FILES)
	@mkdir -p dist
	browserify lib/index.js -o dist/fd-angular-core.raw.js --standalone=FdAngularCore --extension=js --debug \
		--exclude jquery \
		--exclude angular \
		--exclude mr-util \
		--exclude angular-ui-router
	cat dist/fd-angular-core.raw.js | exorcist dist/fd-angular-core.js.map > dist/fd-angular-core.js
	rm dist/fd-angular-core.raw.js
	@touch dist

deploy: doc
	@bash ./script/deploy-docs.sh

.PHONEY: all clean deploy
