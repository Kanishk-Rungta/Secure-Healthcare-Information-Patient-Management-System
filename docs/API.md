# API Documentation

## Overview

The Secure Healthcare Information System API provides RESTful endpoints for managing patient data, user authentication, consent management, and audit logging. All endpoints are secured with JWT authentication and follow GDPR/HIPAA compliance requirements.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

### JWT Token Format
```json
{
  "Authorization": "Bearer <access_token>"
}
```

### Token Refresh
Access tokens expire after 15 minutes. Use the refresh token endpoint to obtain new tokens.

## API Endpoints

### Authentication Routes

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "patient|doctor|receptionist|lab_technician|pharmacist|administrator",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "phone": "+1234567890"
  },
  "privacy": {
    "dataProcessingConsent": true,
    "marketingConsent": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": "15m"
    }
  }
}
```

#### POST /auth/login
Authenticate user and return tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### POST /auth/refresh-token
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST /auth/logout
Logout user and invalidate tokens.

#### POST /auth/change-password
Change user password.

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

#### GET /auth/profile
Get current user profile.

### Patient Routes

#### GET /patients/search
Search patients (medical staff only).

**Query Parameters:**
- `q`: Search query (min 2 characters)
- `limit`: Number of results (default: 20)
- `page`: Page number (default: 1)

#### GET /patients/:patientId/profile
Get patient profile (requires consent).

#### PUT /patients/:patientId/demographics
Update patient demographics.

#### GET /patients/:patientId/medical-records
Get patient medical records (requires consent).

**Query Parameters:**
- `recordType`: Filter by record type
- `limit`: Number of records (default: 50)
- `page`: Page number (default: 1)

#### POST /patients/:patientId/medical-records
Create new medical record (medical staff only).

#### GET /patients/:patientId/visits
Get patient visits (requires consent).

#### POST /patients/:patientId/visits
Add new patient visit (medical staff only).

#### GET /patients/:patientId/medications
Get patient medications (requires consent).

#### POST /patients/:patientId/emergency-access
Request emergency access override (medical staff only).

### Consent Routes

#### POST /consent/patients/:patientId
Create new consent.

**Request Body:**
```json
{
  "recipientId": "user_id",
  "dataType": "demographics|medical_history|visits|medications|all_records",
  "purpose": "treatment|diagnosis|research|billing",
  "validUntil": "2024-12-31T23:59:59Z",
  "limitations": {
    "maxAccessCount": 10
  }
}
```

#### GET /consent/patients/:patientId
Get patient consents.

#### GET /consent/my-consents
Get consents where user is recipient.

#### PUT /consent/:consentId/revoke
Revoke consent.

**Request Body:**
```json
{
  "reason": "No longer required"
}
```

#### PUT /consent/:consentId
Update consent details.

#### GET /consent/check
Check consent status.

**Query Parameters:**
- `patientId`: Patient ID
- `recipientId`: Recipient ID
- `dataType`: Data type
- `purpose`: Access purpose

#### GET /consent/patients/:patientId/stats
Get consent statistics for patient.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": ["Detailed error messages"]
}
```

### Common Error Codes

- `TOKEN_REQUIRED`: Authentication token missing
- `TOKEN_EXPIRED`: Authentication token expired
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `CONSENT_REQUIRED`: Patient consent required for access
- `PATIENT_NOT_FOUND`: Patient record not found
- `VALIDATION_ERROR`: Request validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Security Headers

All API responses include security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Rate Limiting

API endpoints are rate-limited by role:

- **Authentication**: 5 requests per 15 minutes
- **General API**: 100 requests per 15 minutes
- **Data Export**: 10 requests per hour
- **Emergency Access**: 5 requests per day

## Data Formats

### Date Format
All dates use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

### Pagination
Paginated responses include:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Compliance Features

### GDPR Compliance
- Right to access via data export endpoints
- Right to erasure via anonymization
- Consent management for all data processing
- Data minimization in API responses

### HIPAA Compliance
- Audit logging for all data access
- Access controls based on user roles
- Emergency access with justification
- Data encryption in transit and at rest

## Testing

### Authentication Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

### Patient Search Test
```bash
curl -X GET "http://localhost:5000/api/patients/search?q=John&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

### Consent Creation Test
```bash
curl -X POST http://localhost:5000/api/consent/patients/patient_id \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "doctor_id",
    "dataType": "medical_history",
    "purpose": "treatment",
    "validUntil": "2024-12-31T23:59:59Z"
  }'
```

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get patient profile
const patient = await api.get(`/patients/${patientId}/profile`);

// Create consent
const consent = await api.post(`/consent/patients/${patientId}`, {
  recipientId: doctorId,
  dataType: 'medical_history',
  purpose: 'treatment',
  validUntil: '2024-12-31T23:59:59Z'
});
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Get patient profile
response = requests.get(
    f'{base_url}/patients/{patient_id}/profile',
    headers=headers
)

# Create consent
consent_data = {
    'recipientId': doctor_id,
    'dataType': 'medical_history',
    'purpose': 'treatment',
    'validUntil': '2024-12-31T23:59:59Z'
}

response = requests.post(
    f'{base_url}/consent/patients/{patient_id}',
    json=consent_data,
    headers=headers
)
```

## Support

For API support and questions, please refer to the project documentation or open an issue in the GitHub repository.
