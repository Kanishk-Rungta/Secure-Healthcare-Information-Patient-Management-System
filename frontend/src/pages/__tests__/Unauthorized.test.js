import React from 'react';
import { render, screen } from '@testing-library/react';
import Unauthorized from '../Unauthorized';

describe('Unauthorized Component', () => {
    it('renders the unauthorized placeholder', () => {
        render(<Unauthorized />);
        expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    });
});
