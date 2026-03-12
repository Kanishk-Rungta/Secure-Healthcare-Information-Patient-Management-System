import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { authAPI } from '../../services/api';

// Mock the API and router
jest.mock('../../services/api', () => ({
    authAPI: {
        login: jest.fn(),
    },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    const renderLogin = () => {
        return render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Login />
            </BrowserRouter>
        );
    };

    it('renders login form correctly', () => {
        renderLogin();
        expect(screen.getByText('Sign in')).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    it('validates required fields immediately', async () => {
        renderLogin();

        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        // Focus and blur to trigger touched state
        fireEvent.focus(emailInput);
        fireEvent.blur(emailInput);

        expect(screen.getByText(/Enter a valid email address/i)).toBeInTheDocument();

        fireEvent.focus(passwordInput);
        fireEvent.blur(passwordInput);

        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });

    it('submits form successfully and navigates based on role', async () => {
        authAPI.login.mockResolvedValueOnce({
            success: true,
            data: {
                user: { role: 'patient' },
                tokens: { accessToken: 'fake-token' }
            }
        });

        renderLogin();

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123!' } });

        const submitButton = screen.getByRole('button', { name: /Next|Signing in/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(authAPI.login).toHaveBeenCalledWith(
                { email: 'test@example.com', password: 'Password123!' },
                expect.any(Object)
            );
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/patient');
        });
    });

    it('shows error message on failed login', async () => {
        authAPI.login.mockResolvedValueOnce({
            success: false,
            message: 'Invalid email or password'
        });

        renderLogin();

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'WrongPassword' } });

        fireEvent.click(screen.getByRole('button', { name: /Next|Signing in/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
        });
    });
});
