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
- **Emergency "break-glass" access** with justification logging

## 👥 User Roles

1. **Patient** - Data owner with consent controls
2. **Doctor** - Diagnosis and prescription management
3. **Receptionist** - Patient intake coordination
4. **Lab Technician** - Laboratory results management
5. **Pharmacist** - Prescription fulfillment
6. **Administrator** - System oversight and audit review

## 📁 Project Structure

```
Secure-Healthcare-Information-Patient-Management-System/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Security & validation middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic layer
│   │   ├── utils/          # Helper utilities
│   │   └── config/         # Configuration files
│   ├── tests/              # Backend tests
│   ├── .env.example        # Environment variables template
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components by role
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── utils/         # Frontend utilities
│   │   └── contexts/      # React contexts
│   ├── .env.example        # Environment variables template
│   └── package.json
├── docs/                  # Documentation
│   ├── SECURITY_ARCHITECTURE.md
│   ├── THREAT_MODEL.md
│   └── API.md
├── .gitignore            # Git ignore file
└── README.md             # This file
```

## 🔐 Regulatory Compliance

### GDPR Implementation
- **Right to Access** → Patient data export APIs
- **Right to Rectification** → Controlled update mechanisms
- **Right to Erasure** → Anonymization/soft delete procedures
- **Data Minimization** → Limited field storage design
- **Purpose Limitation** → Consent-driven access controls

### HIPAA Implementation
- **Confidentiality** → Encryption + RBAC enforcement
- **Integrity** → Audit trails and data versioning
- **Availability** → Error handling and resilience patterns
- **Accountability** → Per-user action traceability

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Secure-Healthcare-Information-Patient-Management-System
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

4. **Set up MongoDB database**
   - Install MongoDB locally or use MongoDB Atlas
   - Update connection string in `backend/.env`

5. **Run the application**
   ```bash
   # Start backend (port 5000)
   cd backend
   npm run dev
   
   # Start frontend (port 3000)
   cd ../frontend
   npm start
   ```

## 📖 Documentation

- [API Documentation](./docs/API.md)
- [Security Architecture](./docs/SECURITY_ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Threat Model](./docs/THREAT_MODEL.md)

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm test             # Run tests
npm run lint         # Run linter
```

### Frontend Development
```bash
cd frontend
npm start            # Start development server
npm test             # Run tests
npm run build        # Build for production
```

## ⚠️ Important Notes

- This is a demonstration system for educational purposes
- Production deployment requires additional security hardening
- Always consult with legal and security experts for healthcare applications
- Regular security audits and penetration testing recommended

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.