.PHONY: web app admin api agent db migrate build-agent

web:
	cd apps/web && pnpm dev

app:
	cd apps/app && pnpm dev

admin:
	cd apps/admin && pnpm dev

api:
	cd apps/api && go run cmd/api/main.go

agent:
	cd apps/agent && go run cmd/api/main.go

db:
	docker compose up -d postgres

db-stop:
	docker compose stop postgres

migrate:
	cd apps/api && go run cmd/api/main.go --migrate-only 2>/dev/null || \
		cd apps/api && go run cmd/api/main.go

build-agent:
	cd apps/agent && GOOS=linux GOARCH=arm64 CGO_ENABLED=0 \
		go build -ldflags "-X main.Version=$$(git describe --tags --always --dirty)" \
		-o ../../dist/bitbus-agent ./cmd/api/main.go
	@echo "Binary written to dist/bitbus-agent"