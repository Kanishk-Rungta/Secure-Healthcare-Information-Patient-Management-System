const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/User');
// We need the app to test HTTP endpoints
const app = require('../../app');

// Remove ensureJwtSecrets issue if not running app correctly
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

describe('Auth Controller', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    const validRegistrationData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        role: 'patient',
        profile: {
            firstName: 'Jane',
            lastName: 'Smith',
            dateOfBirth: '1985-05-15',
            phone: '1234567890'
        },
        privacy: {
            dataProcessingConsent: true,
            marketingConsent: false
        }
    };

    describe('POST /api/auth/register', () => {
        test('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .set('User-Agent', 'jest-test')
                .send(validRegistrationData)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(validRegistrationData.email);
            expect(response.body.data.tokens.accessToken).toBeDefined();
            expect(response.body.data.tokens.refreshToken).toBeDefined();
        });

        test('should fail registration if email exists', async () => {
            // Create user first
            await request(app).post('/api/auth/register').set('User-Agent', 'jest-test').send(validRegistrationData);

            // Try again
            const response = await request(app)
                .post('/api/auth/register')
                .set('User-Agent', 'jest-test')
                .send(validRegistrationData)
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/auth/register').set('User-Agent', 'jest-test').set('X-Forwarded-For', '127.0.0.2').send(validRegistrationData);
        });

        test('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .set('User-Agent', 'jest-test')
                .set('X-Forwarded-For', '127.0.0.3')
                .send({
                    email: validRegistrationData.email,
                    password: validRegistrationData.password
                });

            // Handle MFA requirement
            if (response.body.mfaRequired) {
                const userWithOtp = await User.findOne({ email: validRegistrationData.email }).select('+security.otp');
                const otp = userWithOtp.security.otp;
                const otpRes = await request(app)
                    .post('/api/auth/verify-otp')
                    .set('User-Agent', 'jest-test')
                    .send({ email: validRegistrationData.email, otp })
                    .expect(200);
                
                expect(otpRes.body.success).toBe(true);
                expect(otpRes.body.data.tokens.accessToken).toBeDefined();
            } else {
                expect(response.body.success).toBe(true);
                expect(response.body.data.tokens.accessToken).toBeDefined();
            }
        });

        test('should fail login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .set('User-Agent', 'jest-test')
                .set('X-Forwarded-For', '127.0.0.4')
                .send({
                    email: validRegistrationData.email,
                    password: 'WrongPassword!'
                })
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });
    });
});
