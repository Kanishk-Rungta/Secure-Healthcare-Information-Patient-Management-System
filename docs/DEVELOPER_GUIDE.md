```markdown
# Developer Guide — Secure Healthcare Information & Patient Management System

This developer guide consolidates setup, development workflows, code structure, and pointers to security and API documentation. Use this as the single source of truth for contributing, running locally, and understanding architecture.

## Table of contents
- Introduction
- Quick start
- Project layout
- Backend: development & testing
- Frontend: development & testing
- Environment & secrets
- Database
- API & SDK pointers
- Security & compliance
- Deployment (high level)
- Contributing
- Useful commands
- Where to find more documentation

---

## Introduction
This project is a MERN-style web application that manages patient records while enforcing strong privacy controls (consent management), RBAC, and audit logging. The system is designed for demonstration and reference; production deployments require additional operational hardening.

## Quick start
1. Clone the repo:
```bash
git clone <repo-url>
cd Secure-Healthcare-Information-Patient-Management-System
```
2. Install dependencies and run both apps locally:
```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (in a separate terminal)
cd ../frontend
npm install
cp .env.example .env
npm start
```
3. Run tests (both sides):
```bash
cd backend && npm test
cd ../frontend && npm test
```

## Project layout (high level)
See the full, detailed layout in `PROJECT_STRUCTURE.md`. Key folders:
- `backend/src/` — Express app, controllers, middleware, routes, models
- `frontend/src/` — React app, pages, components, contexts, services
- `docs/` — Security, API, threat model, and this developer guide

## Backend: development & testing

- Entry point: `backend/src/app.js`
- Config: `backend/src/config/database.js` (MongoDB connection)
- Models: `backend/src/models/*` (Mongoose schemas)
- Controllers: `backend/src/controllers/*`
- Middleware: `backend/src/middleware/*` (auth, consent, security)
- Routes: `backend/src/routes/*`

Common commands
```bash
# run dev server with nodemon
cd backend
npm run dev

# lint
npm run lint

# tests
npm test
```

Environment notes
- Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, and `ENCRYPTION_KEY`.
- For key management in production use a cloud KMS (AWS KMS, Azure Key Vault).

Testing and seed data
- Tests live in `backend/tests/` where present. Add integration tests that mock or use a test MongoDB (e.g., MongoMemoryServer) to avoid touching production DB.

## Frontend: development & testing

- Entry point: `frontend/src/index.js`
- App root: `frontend/src/App.js`
- API service: `frontend/src/services/api.js` (axios wrapper and interceptors)
- Auth & role contexts: `frontend/src/contexts/*`
- Pages by role under `frontend/src/pages/`

Common commands
```bash
cd frontend
npm install
npm start

# tests
npm test

# build for production
npm run build
```

Local environment
- Copy `frontend/.env.example` to `frontend/.env` and set `REACT_APP_API_BASE_URL` to `http://localhost:5000/api`.

## Environment & secrets
- Never commit `.env` files. Use `.env.example` as the template for required variables.
- Required backend env vars (minimum): `MONGODB_URI`, `JWT_SECRET`, `ENCRYPTION_KEY`, `PORT`.
- Required frontend env vars (minimum): `REACT_APP_API_BASE_URL`.

## Database
- Uses MongoDB with Mongoose definitions in `backend/src/models/`.
- For local development use a local MongoDB instance or MongoDB Atlas dev cluster. Update the connection string in `backend/.env`.
- Consider `mongodump`/`mongorestore` for sample dataset import.

## API & SDK pointers
- Full API details are in: `docs/API.md`
- Use `frontend/src/services/api.js` for calling backend endpoints; it already implements axios interceptors for auth.

## Security & compliance
- Security architecture is documented in `docs/SECURITY_ARCHITECTURE.md` and the threat model is in `docs/THREAT_MODEL.md`.
- Important runtime controls:
  - Use HTTPS in production
  - Store secrets in a KMS
  - Keep `ENCRYPTION_KEY` off code and rotate periodically

## Deployment (high level)
- This repo does not include orchestrated deployment manifests (K8s/CloudFormation). High-level recommendations:
  - Build frontend assets (`npm run build`) and serve via CDN or static hosting
  - Deploy backend behind an API gateway with HTTPS and WAF
  - Use managed MongoDB with encryption at rest and proper network ACLs
  - Use CI pipelines that run linting, tests, dependency scanning, and security scans before deploy

## Contributing
- Follow the code style enforced by `eslint` and any tslint/prettier config included.
- Create a feature branch per change and open a PR with a clear description and tests when applicable.

## Useful commands (summary)
- `cd backend && npm run dev` — start backend in dev
- `cd frontend && npm start` — start frontend in dev
- `cd backend && npm test` — run backend tests
- `cd frontend && npm test` — run frontend tests
- `npm run lint` — run linter (run in the appropriate folder)

## Where to find more documentation
- API: `docs/API.md`
- Security architecture: `docs/SECURITY_ARCHITECTURE.md`
- Threat model: `docs/THREAT_MODEL.md`
- Project structure: `PROJECT_STRUCTURE.md`

---

If you want, I can also:
- Add a short `docs/DEPLOYMENT.md` with example Dockerfiles and a single-stage Docker Compose
- Generate a `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`

```