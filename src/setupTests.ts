// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Mock API services - comprehensive mock for all exports
const mockAuthAPI = {
  login: jest.fn().mockResolvedValue({
    message: 'Login successful',
    user: {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      department: 'IT',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z'
    },
    token: 'mock-jwt-token'
  }),
  logout: jest.fn(),
  register: jest.fn(),
  getProfile: jest.fn().mockResolvedValue({
    user: {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      department: 'IT',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z'
    }
  }),
  refreshToken: jest.fn(),
  validateToken: jest.fn().mockResolvedValue(true),
  isAuthenticated: jest.fn().mockReturnValue(false)
};

const mockTodoAPI = {
  getTodos: jest.fn().mockResolvedValue([]),
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
  toggleTodo: jest.fn()
};

const mockApprovalAPI = {
  getApprovalRequests: jest.fn().mockResolvedValue([]),
  createApprovalRequest: jest.fn(),
  updateApprovalRequest: jest.fn(),
  deleteApprovalRequest: jest.fn(),
  approveRequest: jest.fn(),
  rejectRequest: jest.fn(),
  getApprovalSettings: jest.fn().mockResolvedValue({}),
  updateApprovalSettings: jest.fn(),
  getApprovalDelegations: jest.fn().mockResolvedValue([]),
  createApprovalDelegation: jest.fn(),
  updateApprovalDelegation: jest.fn(),
  deleteApprovalDelegation: jest.fn(),
  getApprovalWorkflows: jest.fn().mockResolvedValue([]),
  createApprovalWorkflow: jest.fn(),
  updateApprovalWorkflow: jest.fn(),
  deleteApprovalWorkflow: jest.fn(),
  getApprovalStatistics: jest.fn().mockResolvedValue({})
};

const mockChatAPI = {
  getChatSettings: jest.fn().mockResolvedValue({}),
  updateChatSettings: jest.fn(),
  getChatChannels: jest.fn().mockResolvedValue([]),
  createChatChannel: jest.fn(),
  getChatMessages: jest.fn().mockResolvedValue([]),
  sendChatMessage: jest.fn(),
  getHelpDeskChannels: jest.fn().mockResolvedValue([]),
  getHelpDeskRequests: jest.fn().mockResolvedValue([]),
  createHelpDeskRequest: jest.fn(),
  sendHelpDeskMessage: jest.fn()
};

// Mock the entire API module
jest.mock('./services/api', () => ({
  authAPI: mockAuthAPI,
  todoAPI: mockTodoAPI,
  approvalAPI: mockApprovalAPI,
  chatAPI: mockChatAPI,
  // Also mock any default exports
  default: {
    authAPI: mockAuthAPI,
    todoAPI: mockTodoAPI,
    approvalAPI: mockApprovalAPI,
    chatAPI: mockChatAPI
  }
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  Link: ({ children, to, ...props }: any) => {
    const React = require('react');
    return React.createElement('a', { href: to, ...props }, children);
  },
  NavLink: ({ children, to, ...props }: any) => {
    const React = require('react');
    return React.createElement('a', { href: to, ...props }, children);
  },
  Outlet: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'outlet' });
  },
  Routes: ({ children }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'routes' }, children);
  },
  Route: ({ children }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'route' }, children);
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
global.sessionStorage = sessionStorageMock;

// Mock WebSocket
const WebSocketMock = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1
}));

// Add static properties to WebSocket mock
WebSocketMock.CONNECTING = 0;
WebSocketMock.OPEN = 1;
WebSocketMock.CLOSING = 2;
WebSocketMock.CLOSED = 3;

global.WebSocket = WebSocketMock as any;

// Mock fetch
global.fetch = jest.fn();

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn(),
    randomUUID: jest.fn(() => 'mock-uuid'),
    subtle: {
      digest: jest.fn(),
      generateKey: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn()
    }
  }
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
