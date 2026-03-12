import React from 'react';
import { render, screen } from '@testing-library/react';
import PharmacyDashboard from '../PharmacyDashboard';

describe('PharmacyDashboard Component', () => {
    it('renders the pharmacy dashboard placeholder', () => {
        render(<PharmacyDashboard />);
        expect(screen.getByText('PharmacyDashboard')).toBeInTheDocument();
    });
});
