# Secure Healthcare Information & Patient Management System

A comprehensive, enterprise-grade healthcare platform built with the MERN stack, designed with security, privacy, and regulatory compliance (GDPR/HIPAA) at its core.

## 🏗️ Architecture Overview

This system implements a **security-first, layered architecture** with:

- **Backend**: Node.js + Express.js with modular design
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: React.js with role-based UI rendering
- **Security**: JWT authentication, RBAC, encryption, audit logging

## 🛡️ Security Features

- **Role-Based Access Control (RBAC)** with least privilege principle
- **Patient-driven consent management** with granular permissions
- **End-to-end encryption** (in transit and at rest)
- **Immutable audit logging** for complete traceability
- **GDPR & HIPAA compliance** built into the architecture
# Secure Healthcare Information & Patient Management System

A secure, role-based patient information and consent management platform built with a Node.js/Express backend and React frontend. This repository contains all source, documentation, and developer tooling needed to run, develop, and test the system locally.

--

## Table of Contents
- [Overview](#overview)
- [Key features](#key-features)
- [Architecture](#architecture)
- [Project layout](#project-layout)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Development workflow](#development-workflow)
- [Testing & CI](#testing--ci)
- [Building & Deployment (overview)](#building--deployment-overview)
- [Security & Compliance](#security--compliance)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License & Support](#license--support)

---

## Overview

This project demonstrates a production-minded design for a healthcare application prioritizing privacy, auditability, and regulatory compliance (GDPR / HIPAA). It provides:

- Fine-grained consent management for patient data
- Role-based access controls (doctors, nurses, receptionists, lab technicians, pharmacists, administrators)
- Immutable audit logging for access and changes
- Field-level encryption for sensitive data

## Key features

- JWT-based authentication and refresh flow
- RBAC with least-privilege permissions
- Consent lifecycle (grant, revoke, audit)
- Audit logs with tamper-evident signatures
- Rate limiting and security headers

## Architecture

- Backend: Node.js + Express + Mongoose (MongoDB)
- Frontend: React (Create React App) with Context-based auth
- Data store: MongoDB (local or Atlas)
- Dev tooling: ESLint, Jest (where present), nodemon for hot reload

Architecture diagram (high level):

Client (React) ⇄ API Gateway/Express ⇄ MongoDB

## Project layout

Top-level structure:

- `backend/` — Express app, controllers, models, middleware
- `frontend/` — React app, pages, components, services
- `docs/` — Developer guide, API docs, security architecture, threat model
- `PROJECT_STRUCTURE.md` — Detailed on-disk layout

For a detailed layout see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).

## Prerequisites

- Node.js (>= 16.x recommended)
- npm (>= 8.x)
- MongoDB (local) or a MongoDB Atlas cluster

## Quick start

1. Clone the repository

```bash
git clone <repository-url>
cd Secure-Healthcare-Information-Patient-Management-System
```

2. Backend: install and run

```bash
cd backend
npm install
copy .env.example .env     # Windows
# or: cp .env.example .env # macOS / Linux
npm run dev
```

3. Frontend: install and run (new terminal)

```bash
cd frontend
npm install
copy .env.example .env     # Windows
npm start
```

Open the app at `http://localhost:3000` and the backend API at `http://localhost:5000/api`.

## Configuration

Environment variables are stored in `.env` files (do not commit). Use `.env.example` files in `backend/` and `frontend/` as templates.

Minimum backend variables (examples):

- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `ENCRYPTION_KEY` — AES key for any field-level encryption
- `PORT` — API port (default: 5000)

Minimum frontend variables:

- `REACT_APP_API_BASE_URL` — e.g. `http://localhost:5000/api`

## Development workflow

- Start backend in dev with hot reload: `cd backend && npm run dev`
- Start frontend in dev: `cd frontend && npm start`
- Run backend tests: `cd backend && npm test`
- Run frontend tests: `cd frontend && npm test`
- Linting: use `npm run lint` in the relevant package

Use feature branches and open PRs for changes. Tests and linting should pass before merging.

## Testing & CI

- Unit and integration tests should live under `backend/tests/` and `frontend/src/__tests__/` (where present).
- For integration tests, prefer `mongodb-memory-server` to avoid modifying developer databases.
- Add CI steps to run lint, tests, and dependency-security scans (e.g., `npm audit` or Snyk).

## Building & Deployment (overview)

This repo does not include production deployment manifests. Recommended high-level steps:

- Build frontend: `cd frontend && npm run build` and serve via CDN or static hosting
- Containerize backend and frontend with Docker and deploy behind an API gateway
- Use managed MongoDB with network access controls and encryption at rest
- Use a secrets manager / KMS for `ENCRYPTION_KEY` and `JWT_SECRET`

If you want, I can add a `docs/DEPLOYMENT.md` with example Dockerfiles and a `docker-compose.yml` for local staging.

## Security & Compliance

See the full security architecture in [docs/SECURITY_ARCHITECTURE.md](docs/SECURITY_ARCHITECTURE.md) and the threat analysis in [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).

Important runtime controls:

- Use HTTPS in production
- Store secrets in a KMS (AWS KMS, Azure Key Vault)
- Rotate `ENCRYPTION_KEY` and `JWT_SECRET` regularly
- Perform regular penetration testing and dependency scanning

## Documentation

- Developer guide: [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)
- API documentation: [docs/API.md](docs/API.md)
- Security architecture: [docs/SECURITY_ARCHITECTURE.md](docs/SECURITY_ARCHITECTURE.md)
- Threat model: [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md)
- Project structure: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## Contributing

Short guide:

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Run tests and linting locally
4. Commit and push, then open a PR

I can generate a full `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` if you want.

## License & support

MIT License — see `LICENSE`.

For issues and support, open an issue on the repository or contact the maintainers.

---

Files updated:

- [README.md](README.md)
- [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) (new)
