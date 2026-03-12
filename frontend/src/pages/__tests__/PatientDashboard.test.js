import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientDashboard from '../PatientDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';

// Mock the Auth Context
jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock react-query
jest.mock('react-query', () => ({
    useQuery: jest.fn(),
}));

describe('PatientDashboard Component', () => {
    beforeEach(() => {
        useAuth.mockReturnValue({
            user: {
                _id: '12345',
                profile: { firstName: 'TestPatient', lastName: 'User' },
            },
        });

        // We have to mock useQuery behavior properly since it's called multiple times
        useQuery.mockImplementation((queryKey) => {
            if (queryKey === 'patientProfile') {
                return { data: { data: { profile: {} } }, isLoading: false };
            }
            return { data: { data: [] }, isLoading: false };
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders patient dashboard components', () => {
        render(<PatientDashboard />);
        // Tab text
        expect(screen.getByText('Upcoming Visits')).toBeInTheDocument();
        expect(screen.getByText('Medical Records')).toBeInTheDocument();
        expect(screen.getByText('Active Medications')).toBeInTheDocument();

        // Check loading complete output string
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
});
