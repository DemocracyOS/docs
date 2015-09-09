run: build
	@echo "Launching..."
	@npm run serve

build: submodules packages
	@echo "Building..."
	@npm run build

packages:
	@echo "Installing dependencies..."
	@npm install

submodules:
	@echo "Updating git submodules..."
	@git submodule init && git submodule update

clean:
	@echo "Removing dependencies and built assets..."
	@rm -rf node_modules build
	@echo "Done.\n"

.PHONY: clean
