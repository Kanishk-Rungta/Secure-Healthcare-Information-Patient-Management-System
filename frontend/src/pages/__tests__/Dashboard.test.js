import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Dashboard Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    const renderDashboard = () => {
        return render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Dashboard />
            </BrowserRouter>
        );
    };

    it('navigates to logic if user is not in localStorage', () => {
        renderDashboard();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('renders dashboard with user data', async () => {
        localStorage.setItem('user', JSON.stringify({
            firstName: 'John',
            lastName: 'Doe',
            role: 'DOCTOR'
        }));

        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText(/Welcome back, John/i)).toBeInTheDocument();
        });

        expect(screen.getAllByText(/John Doe/i)[0]).toBeInTheDocument();
    });

    it('handles logout flow correctly', async () => {
        localStorage.setItem('user', JSON.stringify({ firstName: 'John' }));
        renderDashboard();

        const logoutBtn = await screen.findByText('Logout');
        fireEvent.click(logoutBtn);

        expect(localStorage.getItem('user')).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});
