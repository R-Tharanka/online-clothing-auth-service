# Online Clothing Auth Service

## Overview
Authentication and user identity service for the Veloura online clothing platform. This repository contains a single microservice within a larger microservices-based system that includes other services. Provides user registration, login, token-based sessions, role checks, and password reset flows with an OpenAPI contract for client integration.

## Features
- Register, login, logout, refresh tokens (single-use refresh with rotation)
- Password reset request + perform (token is logged; email delivery is a stub)
- Role assignment and role-based guards (roles: customer, shop_owner)
- Protected user endpoints (requires bearer access token)
- Health endpoint, JSON HTTP request logging, and correlation IDs
- OpenAPI contract and Swagger UI
- Docker + docker-compose for local dev

## Quick Start
```bash
npm install
cp .env.example .env
npm run dev
```

Swagger UI: http://localhost:5000/api-docs
Health check: http://localhost:5000/health

## Scripts
- `npm run dev` - start with nodemon
- `npm start` - start with node
- `npm run test` - Jest tests
- `npm run lint` - ESLint

## Docker (local dev)
```bash
docker compose up --build
```

## Environment Variables
See [.env.example](.env.example).

Required:
- `MONGODB_URI` (or `MONGO_URI`)
- JWT config:
  - Preferred: `JWT_PRIVATE_KEY` + `JWT_PUBLIC_KEY` (RS256)
  - Fallback: `JWT_SECRET` (HS256, warning logged)

Token TTLs:
- `ACCESS_TOKEN_TTL` (default 15m)
- `REFRESH_TOKEN_TTL` (default 7d)

Mongo connection retry:
- `MONGODB_CONNECT_RETRIES` (default 5)
- `MONGODB_CONNECT_DELAY_MS` (default 2000)

Port:
- `PORT` (default 5000)

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

Security note: store private keys in a secret manager (do not commit).

## Token Claims
Access and refresh tokens include:
- `userId`
- `roles` (array)
- `tokenType` (refresh tokens only)

## Password Reset
- `POST /api/auth/password-reset-request` creates a single-use token and logs it.
- `POST /api/auth/password-reset` verifies token, updates password, and revokes refresh tokens.

## Roles and Access
- Supported roles: `customer`, `shop_owner`.
- Admin-only routes use `requireRoles("shop_owner")` ("admin" is normalized to `shop_owner`).

## Observability
- Every request gets an `x-request-id` header (incoming value is preserved or generated).
- HTTP logs are JSON lines with request id, status, and duration.

## API Docs
The OpenAPI contract is defined in [openapi.yaml](openapi.yaml) and served via `/api-docs`.
