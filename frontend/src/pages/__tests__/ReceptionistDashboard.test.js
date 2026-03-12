import React from 'react';
import { render, screen } from '@testing-library/react';
import ReceptionistDashboard from '../ReceptionistDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation } from 'react-query';

// Mock dependencies
jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('react-query', () => ({
    useQuery: jest.fn(),
    useMutation: jest.fn(),
    useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

describe('ReceptionistDashboard Component', () => {
    beforeEach(() => {
        useAuth.mockReturnValue({
            user: {
                _id: '67890',
                profile: { firstName: 'Receptionist', lastName: 'Staff' },
            },
        });

        useQuery.mockReturnValue({ data: { data: [] }, isLoading: false });
        useMutation.mockReturnValue({ mutate: jest.fn(), isLoading: false });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders receptionist dashboard properly', () => {
        render(<ReceptionistDashboard />);
        expect(screen.getByText(/Receptionist Dashboard/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Today's Appointments/i)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Active Assignments/i)[0]).toBeInTheDocument();
    });
});
