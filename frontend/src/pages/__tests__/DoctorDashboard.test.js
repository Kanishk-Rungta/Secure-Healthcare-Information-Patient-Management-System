import React from 'react';
import { render, screen } from '@testing-library/react';
import DoctorDashboard from '../DoctorDashboard';

describe('DoctorDashboard Component', () => {
    it('renders doc dashboard elements correctly', () => {
        render(<DoctorDashboard />);
        expect(screen.getByText('Doctor Overview')).toBeInTheDocument();
        expect(screen.getByText('Today’s Patients')).toBeInTheDocument();
        expect(screen.getByText('Priority Tasks')).toBeInTheDocument();
    });
});
