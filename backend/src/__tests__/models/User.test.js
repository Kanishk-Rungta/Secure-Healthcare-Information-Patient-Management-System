const mongoose = require('mongoose');
const User = require('../../models/User');

describe('User Model', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    const validUserData = {
        email: 'test@example.com',
        password: 'Password123!',
        role: 'patient',
        profile: {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: new Date('1990-01-01')
        },
        privacy: {
            dataProcessingConsent: true
        }
    };

    test('should create user successfully with valid data', async () => {
        const user = new User(validUserData);
        await user.save();

        expect(user._id).toBeDefined();
        expect(user.email).toBe(validUserData.email);
        expect(user.role).toBe(validUserData.role);
        expect(user.status).toBe('active');
    });

    test('should hash the password before saving', async () => {
        const user = new User(validUserData);
        await user.save();

        // We shouldn't be able to retrieve the password by default, 
        // but we can query it explicitly or just use the saved doc.
        const savedUser = await User.findById(user._id).select('+password');
        expect(savedUser.password).toBeDefined();
        expect(savedUser.password).not.toBe(validUserData.password);
    });

    test('should correctly compare valid and invalid passwords', async () => {
        const user = new User(validUserData);
        await user.save();

        const savedUser = await User.findById(user._id).select('+password');
        const isMatch = await savedUser.comparePassword('Password123!');
        const isInvalid = await savedUser.comparePassword('WrongPassword');

        expect(isMatch).toBe(true);
        expect(isInvalid).toBe(false);
    });

    test('should not allow user creation without email', async () => {
        const invalidData = { ...validUserData };
        delete invalidData.email;
        const noEmailUser = new User(invalidData);

        let error;
        try {
            await noEmailUser.save();
        } catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error.errors.email).toBeDefined();
    });

    test('should implement account lockout logic', async () => {
        const user = new User(validUserData);
        await user.save();

        // Increment 4 times
        await user.incLoginAttempts();
        await user.incLoginAttempts();
        await user.incLoginAttempts();
        await user.incLoginAttempts();

        let updatedUser = await User.findById(user._id).select('+security.loginAttempts +security.lockUntil');
        expect(updatedUser.isLocked).toBe(false);

        // 5th time should lock the account
        await updatedUser.incLoginAttempts();
        updatedUser = await User.findById(user._id).select('+security.loginAttempts +security.lockUntil');
        expect(updatedUser.isLocked).toBe(true);
        expect(updatedUser.security.lockUntil).toBeDefined();
    });
});
