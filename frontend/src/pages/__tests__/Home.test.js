import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Home Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderHome = () => {
        return render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Home />
            </BrowserRouter>
        );
    };

    it('renders correctly', () => {
        renderHome();
        expect(screen.getByText('Secure Healthcare Management')).toBeInTheDocument();
        expect(screen.getByText('Platform Features')).toBeInTheDocument();
        expect(screen.getByText('User Roles')).toBeInTheDocument();
    });

    it('navigates to login when Sign In buttons are clicked', () => {
        renderHome();
        const loginButtons = screen.getAllByText('Sign In');
        fireEvent.click(loginButtons[0]);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('navigates to register when Get Started buttons are clicked', () => {
        renderHome();
        const getStartedButtons = screen.getAllByText('Get Started');
        fireEvent.click(getStartedButtons[0]);
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
});
