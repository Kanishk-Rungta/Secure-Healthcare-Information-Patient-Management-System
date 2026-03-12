const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Patient = require('../../models/Patient');
const Complaint = require('../../models/Complaint');
const app = require('../../app');

describe('Receptionist & Doctor Flow Integration Test', () => {
    jest.setTimeout(60000);
    let receptionistToken, doctorToken, patientToken;
    let patientId, doctorId, receptionistId;
    let complaintId;

    const testUsers = {
        receptionist: {
            email: 'receptionist_final@example.com',
            password: 'SecurePassword123!',
            role: 'receptionist',
            profile: {
                firstName: 'Alice',
                lastName: 'Receptionist',
                professionalInfo: { receptionistId: 'REC-001' }
            },
            privacy: { dataProcessingConsent: true }
        },
        doctor: {
            email: 'doctor_final@example.com',
            password: 'SecurePassword123!',
            role: 'doctor',
            profile: {
                firstName: 'Bob',
                lastName: 'Doctor',
                professionalInfo: {
                    licenseNumber: 'LIC-789',
                    specialization: 'General Medicine',
                    department: 'Outpatient'
                }
            },
            privacy: { dataProcessingConsent: true }
        },
        patient: {
            email: 'patient_comp_final@example.com',
            password: 'SecurePassword123!',
            role: 'patient',
            profile: {
                firstName: 'Charlie',
                lastName: 'Patient',
                dateOfBirth: '1995-01-01'
            },
            privacy: { dataProcessingConsent: true }
        }
    };

    beforeAll(async () => {
        // Clear everything initially
        await User.deleteMany({});
        await Patient.deleteMany({});
        await Complaint.deleteMany({});

        // Helper function to handle login with MFA
        const loginWithMFA = async (email, password) => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .set('User-Agent', 'jest-test')
                .send({ email, password });

            if (loginRes.body.mfaRequired) {
                const userWithOtp = await User.findOne({ email: email.toLowerCase() }).select('+security.otp');
                const otp = userWithOtp.security.otp;
                const otpRes = await request(app)
                    .post('/api/auth/verify-otp')
                    .set('User-Agent', 'jest-test')
                    .send({ email, otp });
                return otpRes.body.data;
            }
            return loginRes.body.data;
        };

        // 1. Register and Login Receptionist
        await request(app).post('/api/auth/register').set('User-Agent', 'jest-test').send(testUsers.receptionist);
        const recData = await loginWithMFA(testUsers.receptionist.email, testUsers.receptionist.password);
        receptionistToken = recData.tokens.accessToken;

        // 2. Register and Login Doctor
        await request(app).post('/api/auth/register').set('User-Agent', 'jest-test').send(testUsers.doctor);
        const docData = await loginWithMFA(testUsers.doctor.email, testUsers.doctor.password);
        doctorToken = docData.tokens.accessToken;
        doctorId = docData.user._id;

        // 3. Register Patient and Login
        await request(app).post('/api/auth/register').set('User-Agent', 'jest-test').send(testUsers.patient);
        const patData = await loginWithMFA(testUsers.patient.email, testUsers.patient.password);
        patientToken = patData.tokens.accessToken;
        const pUser = patData.user;

        // Manually create Patient record
        const patient = new Patient({
            userId: pUser._id,
            demographics: {
                dateOfBirth: new Date(testUsers.patient.profile.dateOfBirth),
                gender: 'other',
                emergencyContact: { name: 'Emergency', relationship: 'None', phone: '000' }
            }
        });
        await patient.save();
        patientId = patient._id;
    });

    it('should complete the full receptionist -> doctor complaint lifecycle', async () => {
        // 1. Receptionist registers complaint
        const regRes = await request(app)
            .post('/api/receptionist/register-complaint')
            .set('Authorization', `Bearer ${receptionistToken}`)
            .set('User-Agent', 'jest-test')
            .send({
                patientId: patientId.toString(),
                assignedDoctorId: doctorId.toString(),
                description: 'Persistent headache and fever',
                priority: 'high'
            })
            .expect(201);

        complaintId = regRes.body.data.complaint._id;

        // 2. Doctor views complaints
        const listRes = await request(app)
            .get('/api/receptionist/complaints')
            .set('Authorization', `Bearer ${doctorToken}`)
            .set('User-Agent', 'jest-test')
            .expect(200);

        const found = listRes.body.data.some(c => c._id.toString() === complaintId.toString());
        expect(found).toBe(true);

        // 3. Doctor updates status
        await request(app)
            .put(`/api/receptionist/complaints/${complaintId}/status`)
            .set('Authorization', `Bearer ${doctorToken}`)
            .set('User-Agent', 'jest-test')
            .send({
                status: 'in_progress',
                resolution: 'Prescribed paracetamol.'
            })
            .expect(200);

        // 4. Patient attempts to update status (should fail)
        await request(app)
            .put(`/api/receptionist/complaints/${complaintId}/status`)
            .set('Authorization', `Bearer ${patientToken}`)
            .set('User-Agent', 'jest-test')
            .send({ status: 'resolved' })
            .expect(403);
    });
});
