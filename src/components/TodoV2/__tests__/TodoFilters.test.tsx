import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoFilters, { TodoFiltersState } from '../TodoFilters';

describe('TodoFilters', () => {
  const categories = ['Cat1', 'Cat2'];
  const statuses = ['Ongoing', 'Closed'];
  const initialFilters: TodoFiltersState = {
    dateFrom: '',
    dateTo: '',
    category: '',
    status: '',
  };

  it('renders all filter inputs', () => {
    render(
      <TodoFilters
        filters={initialFilters}
        onChange={() => {}}
        categories={categories}
        statuses={statuses}
      />
    );
    expect(screen.getByPlaceholderText('From')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('To')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('calls onChange when inputs change', () => {
    const handleChange = jest.fn();
    render(
      <TodoFilters
        filters={initialFilters}
        onChange={handleChange}
        categories={categories}
        statuses={statuses}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('From'), { target: { value: '2025-07-01' } });
    expect(handleChange).toHaveBeenCalledWith({ ...initialFilters, dateFrom: '2025-07-01' });
    fireEvent.change(screen.getByPlaceholderText('To'), { target: { value: '2025-07-31' } });
    expect(handleChange).toHaveBeenCalledWith({ ...initialFilters, dateTo: '2025-07-31' });
    fireEvent.change(screen.getByText('Category').closest('select'), { target: { value: 'Cat2' } });
    expect(handleChange).toHaveBeenCalledWith({ ...initialFilters, category: 'Cat2' });
    fireEvent.change(screen.getByText('Status').closest('select'), { target: { value: 'Closed' } });
    expect(handleChange).toHaveBeenCalledWith({ ...initialFilters, status: 'Closed' });
  });
}); 