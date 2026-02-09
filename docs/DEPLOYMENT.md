```markdown
# Deployment Guide — Secure Healthcare Information & Patient Management System

This document gives practical guidance for packaging, deploying, and operating the application in staging and production. It provides example Dockerfiles, a `docker-compose` for local staging, and high-level recommendations for CI/CD, monitoring, and security.

---

## Goals

- Reproducible builds for frontend and backend
- Secure secret management (KMS / secrets manager)
- Minimal blast radius and automated rollbacks
- Observability: logs, metrics, and alerts

## Build artifacts

- Frontend: static assets produced by `npm run build` in `frontend/`.
- Backend: a Node.js app packaged into a container or deployed as a managed service.

## Example Dockerfile — backend

```dockerfile
# Use official Node LTS
FROM node:18-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --production
COPY backend ./

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "src/app.js"]
```

## Example Dockerfile — frontend

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Example docker-compose (local staging)

```yaml
version: '3.8'
services:
  mongo:
    image: mongo:6
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db

  backend:
    build:
      context: .
      dockerfile: ./Dockerfile.backend
    environment:
      - MONGODB_URI=mongodb://mongo:27017/shims
      - JWT_SECRET=devsecret
      - ENCRYPTION_KEY=devkey
    ports:
      - "5000:5000"
    depends_on:
      - mongo

  frontend:
    build:
      context: .
      dockerfile: ./Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongo_data:
```

## Environment and secrets

- Do NOT commit `.env` files. Use a secrets manager (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault).
- Store `ENCRYPTION_KEY` and `JWT_SECRET` in a KMS-backed secret store and inject at runtime.
- Rotate keys regularly and keep an audit trail for rotations.

## CI/CD recommendations

- Pipeline stages:
  1. Install and lint
  2. Run unit and integration tests
  3. Build artifacts (frontend and backend)
  4. Run security scans (dependency checks, SAST)
  5. Build and push container images to a registry
  6. Deploy to staging, run smoke tests
  7. Promote to production with approval gates

- Use immutable tags for images (no `latest` in production).
- Enable automated rollback on failed health checks.

## Production recommendations

- Use a managed database with encryption at rest (MongoDB Atlas or managed service).
- Place backend behind a load balancer and API gateway with TLS termination.
- Enforce least-privilege IAM policies for services and service accounts.
- Use WAF and enable rate limiting for public endpoints.
- Ensure backups and point-in-time restore are configured. Test restores quarterly.

## Observability

- Centralize logs (e.g., ELK, Datadog, Splunk) and retain per policy.
- Export metrics (Prometheus-compatible) and create dashboards for errors, latency, and throughput.
- Configure alerts for elevated error rates, high latency, and failed health checks.

## Zero-downtime deploys

- Prefer blue/green or rolling deployments depending on platform support.
- Ensure DB migrations are backward compatible; prefer online migrations.

## Database migrations

- Use a migration tool or script and keep migrations in version control.
- Test migrations in staging with production-sized data when possible.

## Backup & Recovery

- Automate regular backups and test restores.
- Keep at least one offsite encrypted backup for disaster recovery.

## Security hardening checklist

- Enforce HTTPS/TLS 1.2+ (TLS 1.3 recommended)
- Enable HSTS and strong security headers
- Use KMS for encryption keys and rotate periodically
- Run dependency vulnerability scans and fix critical issues before deploy

## Quick troubleshooting

- Check container logs: `docker-compose logs -f backend`
- Check health endpoints and readiness probes
- Verify environment variables and secret injection

---

If you'd like, I can add runnable `Dockerfile.backend`, `Dockerfile.frontend`, and a `docker-compose.yml` tailored to this repo.
```
