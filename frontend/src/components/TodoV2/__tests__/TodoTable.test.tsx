import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoTable from '../TodoTable';
import { mockTodos } from '../mockData';

describe('TodoTable', () => {
  it('renders all columns and rows', () => {
    render(<TodoTable todos={mockTodos} />);
    // Check column headers
    expect(screen.getByText('No.')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Start date')).toBeInTheDocument();
    expect(screen.getByText('End date')).toBeInTheDocument();
    expect(screen.getByText('Repeat')).toBeInTheDocument();
    expect(screen.getByText('Assigned to')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Task completed')).toBeInTheDocument();
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Creator')).toBeInTheDocument();
    // Check rows
    mockTodos.forEach(todo => {
      expect(screen.getByText(todo.title)).toBeInTheDocument();
      expect(screen.getByText(todo.category)).toBeInTheDocument();
    });
  });

  it('calls onRowClick when a row is clicked', () => {
    const handleClick = jest.fn();
    render(<TodoTable todos={mockTodos} onRowClick={handleClick} />);
    const firstRow = screen.getByTestId(`todo-row-${mockTodos[0].id}`);
    fireEvent.click(firstRow);
    expect(handleClick).toHaveBeenCalledWith(mockTodos[0]);
  });
}); 