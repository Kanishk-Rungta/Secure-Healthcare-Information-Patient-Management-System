import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders correctly', () => {
        const { container } = render(<LoadingSpinner />);
        expect(container.firstChild).toHaveClass('flex justify-center items-center');
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
});
