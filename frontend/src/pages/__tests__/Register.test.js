import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';
import { authAPI } from '../../services/api';

// Mock the API and router
jest.mock('../../services/api', () => ({
    authAPI: {
        register: jest.fn(),
    },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Register Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    const renderRegister = () => {
        return render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Register />
            </BrowserRouter>
        );
    };

    it('renders register form correctly', () => {
        renderRegister();
        expect(screen.getAllByText('Create account')[0]).toBeInTheDocument();
        expect(screen.getByLabelText(/First name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getAllByLabelText(/Password/i)[0]).toBeInTheDocument();
    });

    it('submits form successfully and navigates to login on success', async () => {
        // We mock success scenario
        authAPI.register.mockResolvedValueOnce({
            success: true,
            data: { user: { role: 'patient' } }
        });

        renderRegister();

        // Fill form minimum requirements
        fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/Last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/^Date of birth.*/i), { target: { value: '2000-01-01' } });
        fireEvent.change(screen.getAllByLabelText(/^Password/i)[0], { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByLabelText(/^Confirm password/i), { target: { value: 'Password123!' } });

        // Tick the consent box
        const checkbox = screen.getByRole('checkbox', { name: /I agree to the processing of my personal data/i });
        fireEvent.click(checkbox);

        // Click submit
        const submitButton = screen.getByRole('button', { name: /Create Account/i });

        // We may need to un-disable it before click if it's disabled.
        // The component might do local validation, let's just click it
        fireEvent.click(submitButton);

        // It shows a success screen with "Go to Login" button instead of immediate navigation
        const goToLoginBtn = await screen.findByRole('button', { name: /Go to Login/i });
        fireEvent.click(goToLoginBtn);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });
});
