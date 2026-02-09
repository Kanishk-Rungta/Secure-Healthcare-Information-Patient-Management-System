# Security Architecture Documentation

## Overview

This document outlines the comprehensive security architecture of the Secure Healthcare Information & Patient Management System, designed to meet GDPR and HIPAA compliance requirements while maintaining high security standards.

## Security Principles

### 1. Defense in Depth
- **Multiple Layers**: Security controls at network, application, and data levels
- **Redundancy**: Multiple security mechanisms protecting the same assets
- **Diversity**: Different types of security controls (technical, administrative, physical)

### 2. Least Privilege
- **Role-Based Access Control (RBAC)**: Users only have access to data and functions necessary for their role
- **Minimal Data Exposure**: APIs return only necessary data fields
- **Time-Bound Access**: Consent and access permissions have expiration dates

### 3. Privacy by Design
- **Data Minimization**: Collect only necessary personal and medical data
- **Purpose Limitation**: Data used only for specified, legitimate purposes
- **Patient Consent**: Granular, revocable consent management system

## Authentication & Authorization

### Authentication Mechanisms

#### JWT-Based Authentication
```javascript
// Access Token (15 minutes)
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "doctor",
  "iat": 1640995200,
  "exp": 1640996100
}

// Refresh Token (7 days)
{
  "id": "user_id",
  "type": "refresh",
  "iat": 1640995200,
  "exp": 1641600000
}
```

#### Password Security
- **Hashing**: bcrypt with 12 rounds salt
- **Complexity Requirements**: Minimum 8 characters, uppercase, lowercase, numbers, special characters
- **Account Lockout**: 5 failed attempts triggers 2-hour lockout
- **Password History**: Prevent reuse of last 5 passwords

#### Session Management
- **Secure Storage**: Tokens stored in httpOnly cookies or secure localStorage
- **Automatic Refresh**: Silent token refresh before expiration
- **Session Timeout**: 15 minutes of inactivity
- **Concurrent Sessions**: Maximum 3 active sessions per user

### Authorization Framework

#### Role-Based Access Control (RBAC)
```javascript
const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor', 
  RECEPTIONIST: 'receptionist',
  LAB_TECHNICIAN: 'lab_technician',
  PHARMACIST: 'pharmacist',
  ADMINISTRATOR: 'administrator'
};

const PERMISSIONS = {
  PATIENT: [
    'view_own_records',
    'manage_own_consent',
    'update_own_profile'
  ],
  DOCTOR: [
    'view_patient_records',
    'create_diagnosis',
    'create_prescription',
    'emergency_access'
  ]
  // ... other roles
};
```

#### Permission Checking
```javascript
// Middleware example
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

## Data Protection

### Encryption at Rest
- **Field-Level Encryption**: Sensitive fields encrypted using AES-256-GCM
- **Key Management**: Environment-based encryption keys (production: AWS KMS/Azure Key Vault)
- **Database Encryption**: MongoDB encryption at rest enabled

```javascript
// Encryption implementation
const encryptField = (text) => {
  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.ENCRYPTION_KEY;
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, secretKey);
  cipher.setAAD(Buffer.from('healthcare-data', 'utf8'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};
```

### Encryption in Transit
- **HTTPS/TLS 1.3**: All API communications encrypted
- **Certificate Pinning**: Prevent man-in-the-middle attacks
- **HSTS Headers**: Force HTTPS connections

### Data Anonymization
- **GDPR Right to Erasure**: Soft delete with data anonymization
- **Pseudonymization**: Replace identifiers with pseudonyms for research
- **Data Masking**: Sensitive data masked in non-production environments

## Consent Management

### Consent Model
```javascript
const consentSchema = {
  patientId: ObjectId,
  recipientId: ObjectId,
  recipientRole: String,
  dataType: ['demographics', 'medical_history', 'visits', 'medications'],
  purpose: ['treatment', 'diagnosis', 'research', 'billing'],
  validFrom: Date,
  validUntil: Date,
  status: ['active', 'expired', 'revoked'],
  limitations: {
    maxAccessCount: Number,
    ipAddress: String
  }
};
```

### Consent Enforcement
- **Pre-Access Validation**: Every data access checks consent validity
- **Real-Time Revocation**: Immediate effect of consent changes
- **Audit Trail**: Complete consent history and access logging

## Audit Logging & Monitoring

### Immutable Audit Trail
```javascript
const auditLogSchema = {
  eventType: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN'],
  userId: ObjectId,
  userRole: String,
  targetPatientId: ObjectId,
  resourceType: String,
  resourceId: ObjectId,
  action: String,
  description: String,
  requestDetails: {
    ipAddress: String,
    userAgent: String,
    endpoint: String,
    method: String
  },
  timestamp: Date,
  signature: {
    hash: String,
    algorithm: 'SHA256'
  }
};
```

### Security Monitoring
- **Anomaly Detection**: Unusual access patterns and behaviors
- **Rate Limiting**: Prevent brute force and DoS attacks
- **Security Events**: Failed logins, consent violations, emergency access

### Compliance Reporting
- **GDPR Reports**: Data access, consent management, breach notifications
- **HIPAA Logs**: Access logs, audit trails, security incidents
- **Data Retention**: Configurable retention periods (default: 7 years)

## Network Security

### API Security
- **Rate Limiting**: Role-based rate limiting
  - Authentication: 5 requests per 15 minutes
  - General API: 100 requests per 15 minutes
  - Data Export: 10 requests per hour
  - Emergency Access: 5 requests per day

- **Input Validation**: Comprehensive input sanitization
- **CORS Configuration**: Strict cross-origin resource sharing
- **Security Headers**: HSTS, CSP, X-Frame-Options, etc.

```javascript
// Security headers example
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Infrastructure Security
- **Firewall Rules**: Restrict database and API access
- **VPN Access**: Secure remote access for administrators
- **DDoS Protection**: Cloud-based DDoS mitigation
- **Load Balancing**: Distribute traffic and prevent overload

## Threat Mitigation

### Common Web Vulnerabilities

#### OWASP Top 10 Protection
1. **Injection**: Parameterized queries, input validation
2. **Broken Authentication**: Secure session management, MFA
3. **Sensitive Data Exposure**: Encryption, data masking
4. **XML External Entities**: Disable XML external entities
5. **Broken Access Control**: RBAC, permission checks
6. **Security Misconfiguration**: Secure defaults, regular updates
7. **Cross-Site Scripting**: Input sanitization, CSP headers
8. **Insecure Deserialization**: Avoid deserialization of untrusted data
9. **Using Components with Known Vulnerabilities**: Dependency scanning
10. **Insufficient Logging**: Comprehensive audit logging

#### Healthcare-Specific Threats
- **Data Breach Prevention**: Encryption, access controls, monitoring
- **Insider Threat Detection**: Anomaly detection, behavior analysis
- **Ransomware Protection**: Regular backups, network segmentation
- **Medical Device Security**: Secure communication protocols

## Incident Response

### Security Incident Classification
- **Low**: Suspicious activity, no data compromise
- **Medium**: Unauthorized access attempt, limited data exposure
- **High**: Data breach, system compromise
- **Critical**: Widespread breach, patient safety risk

### Response Procedures
1. **Detection**: Automated monitoring and alerting
2. **Containment**: Isolate affected systems
3. **Investigation**: Forensic analysis, impact assessment
4. **Recovery**: Restore systems, patch vulnerabilities
5. **Reporting**: Regulatory notifications, patient communication
6. **Prevention**: Post-incident analysis, security improvements

## Compliance Mapping

### GDPR Implementation
| GDPR Principle | Implementation |
|----------------|----------------|
| Lawfulness, Fairness, Transparency | Privacy policy, consent management |
| Purpose Limitation | Consent-based access control |
| Data Minimization | Minimal data collection, field selection |
| Accuracy | Data validation, audit trails |
| Storage Limitation | Configurable retention policies |
| Integrity, Confidentiality | Encryption, access controls |
| Accountability | Comprehensive audit logging |

### HIPAA Implementation
| HIPAA Requirement | Implementation |
|-------------------|----------------|
| Administrative Safeguards | Security policies, training programs |
| Physical Safeguards | Facility access controls, workstation security |
| Technical Safeguards | Access controls, audit controls, integrity controls |
| Breach Notification | Automated breach detection and reporting |
| Omnibus Rule | Business associate agreements, HITECH provisions |

## Security Testing

### Automated Testing
- **Static Code Analysis**: ESLint, SonarQube security rules
- **Dependency Scanning**: npm audit, Snyk vulnerability scanning
- **Dynamic Application Security Testing**: OWASP ZAP integration
- **Penetration Testing**: Regular third-party security assessments

### Security Monitoring
- **Real-time Alerts**: Security events, unusual patterns
- **Log Analysis**: Centralized logging with ELK stack
- **Performance Monitoring**: Security impact on system performance
- **Compliance Monitoring**: Automated compliance checks

## Best Practices

### Development Security
- **Secure Coding Guidelines**: OWASP secure coding practices
- **Code Review Process**: Security-focused peer reviews
- **Secrets Management**: Environment variables, secret scanning
- **Secure Deployment**: Automated security testing in CI/CD

### Operational Security
- **Regular Updates**: Patch management schedule
- **Backup Strategy**: Automated, encrypted backups
- **Disaster Recovery**: Business continuity planning
- **Security Training**: Regular security awareness training

## Conclusion

This security architecture provides a comprehensive, multi-layered approach to protecting sensitive healthcare data while maintaining compliance with GDPR and HIPAA requirements. The system is designed to be both secure and usable, with patient privacy and data protection as primary concerns.

Regular security assessments, updates, and monitoring ensure the system remains secure against evolving threats while maintaining compliance with changing regulatory requirements.
