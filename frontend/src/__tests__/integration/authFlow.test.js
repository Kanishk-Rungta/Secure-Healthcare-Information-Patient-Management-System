import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import { authAPI } from '../../services/api';

// Mock the API calls
jest.mock('../../services/api', () => ({
    authAPI: {
        login: jest.fn(),
    },
}));

// We need to override the top-level Router since App.js uses BrowserRouter by default
// But a better way is to test a container or mock it.
// If App.js already has a <Router> internally, we can't easily wrap it in MemoryRouter.

describe('Authentication Integration Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('Full login flow redirects user to their dashboard (Integration)', async () => {
        // Mock successful login for a patient role
        authAPI.login.mockResolvedValueOnce({
            success: true,
            data: {
                user: {
                    _id: 'mock-id-123',
                    email: 'integration@example.com',
                    role: 'patient',
                    profile: { firstName: 'Integration', lastName: 'User' }
                },
                tokens: { accessToken: 'fake-jwt-token' }
            }
        });

        // Use MemoryRouter to control the initial entry point if App didn't have its own router inside
        // But since App.js has its own <Router>, we just render it.
        // If we want to start at /login specifically for a cleaner test, we could modify App to accept props or export just the routes.

        render(<App />);

        // Assume default route is Home, then we navigate to Login
        // Or we can just visit /login if the router was external.
        // Let's assume we use the UI to navigate.

        // 1. Visit Home -> Click Login
        const loginButtons = screen.getAllByRole('button', { name: /Sign In/i });
        fireEvent.click(loginButtons[0]);

        // 2. We should be on the Login page now
        expect(screen.getByText('Sign in')).toBeInTheDocument();

        // 3. Fill the form
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'integration@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123!' } });

        // 4. Submit
        const submitButton = screen.getByRole('button', { name: /Next|Signing in/i });
        fireEvent.click(submitButton);

        // 5. Verify the API call was made
        await waitFor(() => {
            expect(authAPI.login).toHaveBeenCalledWith(
                { email: 'integration@example.com', password: 'Password123!' },
                expect.any(Object)
            );
        });

        // 6. Verify we are now on the Patient Dashboard
        await waitFor(() => {
            expect(screen.getByText(/Manage your medical records/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Medical Records/i })).toBeInTheDocument();
        });
    });
});
