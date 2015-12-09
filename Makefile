SRC_FILES = $(shell find src -name '*.js')
LIB_FILES = $(patsubst src/%.js, lib/%.js, $(SRC_FILES))

all: lib doc

clean:
	rm -rf lib doc

lib:
	tsc

doc:
	typedoc \
		--mode file \
		--out ./doc/ \
		--theme minimal \
		--readme ./README.md \
		--excludeNotExported \
		--hideGenerator \
		--module commonjs \
		--experimentalDecorators \
		--target es5 \
		./src/index.ts
	@touch doc

deploy: doc
	@bash ./script/deploy-docs.sh

.PHONEY: all clean deploy
