import React from 'react';
import { render, screen } from '@testing-library/react';
import TodoStatusTab from '../TodoStatusTab';

describe('TodoStatusTab', () => {
  it('renders summary cards and table', () => {
    render(<TodoStatusTab userRole="admin" />);
    expect(screen.getByText('Ongoing')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
    expect(screen.getByText('Not completed')).toBeInTheDocument();
    expect(screen.getByText('Not confirmed')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<TodoStatusTab userRole="admin" />);
    expect(asFragment()).toMatchSnapshot();
  });
}); 