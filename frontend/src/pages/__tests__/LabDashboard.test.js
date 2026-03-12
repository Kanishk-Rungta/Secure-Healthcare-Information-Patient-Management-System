import React from 'react';
import { render, screen } from '@testing-library/react';
import LabDashboard from '../LabDashboard';

describe('LabDashboard Component', () => {
    it('renders the lab dashboard placeholder', () => {
        render(<LabDashboard />);
        expect(screen.getByText('LabDashboard')).toBeInTheDocument();
    });
});
