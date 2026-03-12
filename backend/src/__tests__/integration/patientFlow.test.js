const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Patient = require('../../models/Patient');
const app = require('../../app');

// Mock setup to avoid missing secrets
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

describe('Patient Flow Integration Test', () => {
    let patientToken;
    let patientId;
    let userId;

    const testPatientData = {
        email: 'patient_int_v4@example.com',
        password: 'SecurePassword123!',
        role: 'patient',
        profile: {
            firstName: 'Integration',
            lastName: 'Patient',
            dateOfBirth: '1990-01-01',
            phone: '1234567890'
        },
        privacy: {
            dataProcessingConsent: true,
            marketingConsent: true
        }
    };

    beforeEach(async () => {
        await User.deleteMany({});
        await Patient.deleteMany({});

        // 1. Register a user
        const regRes = await request(app)
            .post('/api/auth/register')
            .set('User-Agent', 'jest-test')
            .send(testPatientData);

        userId = regRes.body.data.user._id;

        // 2. IMPORTANT: Create the Patient record for this User
        // The app might do this automatically in a real flow, but here we ensure it exists
        const patient = new Patient({
            userId: userId,
            demographics: {
                dateOfBirth: testPatientData.profile.dateOfBirth,
                gender: 'other',
                emergencyContact: {
                    name: 'Contact',
                    relationship: 'Other',
                    phone: '9876543210'
                }
            }
        });
        await patient.save();
        patientId = patient._id;

        // 3. Login to get token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .set('User-Agent', 'jest-test')
            .send({
                email: testPatientData.email,
                password: testPatientData.password
            });

        // Handle MFA - need to verify OTP
        if (loginRes.body.mfaRequired) {
            // Get the OTP from the user's security field
            const userWithOtp = await User.findOne({ email: testPatientData.email }).select('+security.otp');
            const otp = userWithOtp.security.otp;

            // Verify OTP to get tokens
            const otpRes = await request(app)
                .post('/api/auth/verify-otp')
                .set('User-Agent', 'jest-test')
                .send({
                    email: testPatientData.email,
                    otp: otp
                });

            patientToken = otpRes.body.data.tokens.accessToken;
        } else {
            patientToken = loginRes.body.data.tokens.accessToken;
        }
    });

    describe('Access Control Integration', () => {
        it('should allow a patient to access their own profile', async () => {
            const res = await request(app)
                .get(`/api/patients/${patientId}/profile`)
                .set('Authorization', `Bearer ${patientToken}`)
                .set('User-Agent', 'jest-test')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.patient._id.toString()).toBe(patientId.toString());
        });

        it('should deny a patient access to another patients ID', async () => {
            // Create another user and patient
            const otherUser = new User({
                email: 'other@example.com',
                password: 'Password123!',
                role: 'patient',
                profile: { firstName: 'Other', lastName: 'User', dateOfBirth: '1980-01-01' },
                privacy: { dataProcessingConsent: true }
            });
            await otherUser.save();

            const otherPatient = new Patient({
                userId: otherUser._id,
                demographics: {
                    dateOfBirth: '1980-01-01',
                    gender: 'other',
                    emergencyContact: { name: 'X', relationship: 'Y', phone: '000' }
                }
            });
            await otherPatient.save();

            // Try to access otherPatient with first patient's token
            await request(app)
                .get(`/api/patients/${otherPatient._id}/profile`)
                .set('Authorization', `Bearer ${patientToken}`)
                .set('User-Agent', 'jest-test')
                .expect(403);
        });

        it('should return 401 for requests without token', async () => {
            await request(app)
                .get(`/api/patients/${patientId}/profile`)
                .set('User-Agent', 'jest-test')
                .expect(401);
        });
    });
});
