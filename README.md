# Online Clothing Auth Service

Production-style authentication microservice for CTSE Assignment 1.

## Features
- Register, login, logout, refresh tokens
- Password reset request + perform (email stub)
- Role assignment and role-based guards
- GET /me, GET /api/auth/users/:id (admin), public user lookup
- Health endpoint and structured logging
- OpenAPI contract and Swagger UI
- Docker + docker-compose for local dev
- CI pipeline with SAST (Snyk) and Docker image build

## Quick Start
```bash
npm install
cp .env.example .env
npm run dev
```

Swagger UI: http://localhost:5000/api-docs
Health check: http://localhost:5000/health

## Docker (local dev)
```bash
docker compose up --build
```

## Environment Variables
See [.env.example](.env.example).

Required:
- `MONGODB_URI`
- `JWT_PRIVATE_KEY` + `JWT_PUBLIC_KEY` (preferred)
  - If missing, the service falls back to `JWT_SECRET` (HS256) and logs a warning.

Token TTLs:
- `ACCESS_TOKEN_TTL` (default 15m)
- `REFRESH_TOKEN_TTL` (default 7d)

## RSA Key Generation (RS256)
```bash
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -in private_key.pem -pubout -out public_key.pem
```

Convert for `.env` usage:
```bash
cat private_key.pem | sed ':a;N;$!ba;s/\n/\\n/g'
cat public_key.pem | sed ':a;N;$!ba;s/\n/\\n/g'
```

**Security Note:** Store private keys in a secret manager (do not commit).

## Password Reset
- `POST /api/auth/password-reset-request` generates a single-use token.
- Email sending is stubbed; integrate SendGrid/SES where indicated.

## Interservice Contract
- `GET /api/auth/public/users/:id` returns minimal user info for other services.
- Use `X-Request-ID` for correlation in downstream services.

## CI / DevSecOps
GitHub Actions workflow runs lint, tests, Snyk SAST, and Docker build/push.

Required secrets:
- `SNYK_TOKEN`
- `REGISTRY_URL`, `REGISTRY_USER`, `REGISTRY_PASS`

Optional:
- Add a deploy step with cloud CLI and required secrets.

## Security Notes
- Enforce HTTPS in production.
- Add rate limiting on auth endpoints (middleware placeholder).
- Avoid logging sensitive values (passwords, tokens, secrets).

## API Docs
The OpenAPI contract is defined in [openapi.yaml](openapi.yaml) and served via `/api-docs`.
