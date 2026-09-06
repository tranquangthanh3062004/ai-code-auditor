.PHONY: dev server test build audit clean

dev:
	pnpm run dev

server:
	pnpm run server

test:
	pnpm run test

build:
	pnpm run build

audit:
	pnpm run audit .

audit-vulnerable:
	pnpm run audit samples/sample-vulnerable

audit-secure:
	pnpm run audit samples/sample-secure

audit-xss:
	pnpm run audit samples/sample-xss

clean:
	rm -rf dist node_modules/.pnpm/lock.yaml.*
