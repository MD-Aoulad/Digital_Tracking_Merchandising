import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// Create a wrapper component with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

test('renders App component without crashing', () => {
  render(
    <TestWrapper>
      <App />
    </TestWrapper>
  );
  
  // Just check that something is rendered
  expect(document.body).not.toBeEmptyDOMElement();
});

test('App component renders successfully', () => {
  const { container } = render(
    <TestWrapper>
      <App />
    </TestWrapper>
  );
  
  // Check that the component renders without throwing errors
  expect(container.firstChild).toBeInTheDocument();
});
