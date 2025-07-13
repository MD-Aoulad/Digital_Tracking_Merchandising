import React from 'react';

export const BrowserRouter = ({ children }: { children: React.ReactNode }) => 
  React.createElement('div', {}, children);

export const Routes = ({ children }: { children: React.ReactNode }) => 
  React.createElement('div', {}, children);

export const Route = ({ children }: { children: React.ReactNode }) => 
  React.createElement('div', {}, children);

export const Link = ({ children, to }: { children: React.ReactNode; to: string }) => 
  React.createElement('a', { href: to }, children);

export const useLocation = () => ({ 
  pathname: '/', 
  search: '', 
  hash: '', 
  state: null 
});

export const Navigate = ({ to }: { to: string }) => 
  React.createElement('div', { 'data-testid': 'navigate', 'data-to': to });

export const useNavigate = () => jest.fn();

export const Outlet = () => 
  React.createElement('div', { 'data-testid': 'outlet' }); 