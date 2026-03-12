import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminDashboard from '../AdminDashboard';

describe('AdminDashboard Component', () => {
    it('renders the admin dashboard text and overviews', () => {
        render(<AdminDashboard />);
        expect(screen.getByText('System Overview')).toBeInTheDocument();
        expect(screen.getByText('Active Users')).toBeInTheDocument();
        expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
        expect(screen.getByText('Security Alerts')).toBeInTheDocument();
        expect(screen.getByText('System Uptime')).toBeInTheDocument();
    });
});
