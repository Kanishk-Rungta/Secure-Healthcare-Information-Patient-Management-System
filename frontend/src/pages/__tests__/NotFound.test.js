import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from '../NotFound';

describe('NotFound', () => {
    it('renders the 404 text', () => {
        render(<NotFound />);
        expect(screen.getByText('NotFound')).toBeInTheDocument();
    });
});
