# Core Module Architecture

This directory contains the core modular architecture for the Digital Tracking Merchandising application. The structure is designed for scalability, maintainability, and reusability.

## 📁 Directory Structure

```
src/core/
├── api/                    # API layer
│   ├── client.ts          # HTTP client and request handling
│   └── hooks.ts           # React hooks for API operations
├── components/            # Reusable UI components
│   └── Layout/           # Layout components
│       └── AppLayout.tsx # Main application layout
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── hooks/                # Custom React hooks
│   └── useTodos.ts       # Todo-specific hooks
├── services/             # Business logic services
│   ├── auth.ts          # Authentication service
│   └── todo.ts          # Todo management service
├── types/                # TypeScript type definitions
│   └── index.ts         # All shared types
└── index.ts             # Main export file
```

## 🏗️ Architecture Overview

### 1. **Types Layer** (`/types`)
- Centralized type definitions
- Shared interfaces and enums
- Type safety across the application

### 2. **API Layer** (`/api`)
- **Client**: HTTP client with authentication, error handling, and retry logic
- **Hooks**: Reusable React hooks for API operations (queries, mutations, pagination)

### 3. **Services Layer** (`/services`)
- Business logic and API operations
- Authentication, todo management, etc.
- Pure functions with no React dependencies

### 4. **Contexts Layer** (`/contexts`)
- React context providers
- Global state management
- Authentication state and session management

### 5. **Hooks Layer** (`/hooks`)
- Custom React hooks for specific features
- Combines services and contexts
- Provides clean APIs for components

### 6. **Components Layer** (`/components`)
- Reusable UI components
- Layout components
- Feature-agnostic components

## 🚀 Usage Examples

### Authentication

```typescript
import { useAuth, login, logout } from '@/core';

// In a component
const { user, isAuthenticated, login, logout } = useAuth();

// Login
await login({ email: 'user@example.com', password: 'password' });

// Logout
await logout();
```

### Todo Operations

```typescript
import { useTodos, useCreateTodo, useUpdateTodo } from '@/core';

// Fetch todos
const { todos, loading, error, refetch } = useTodos(1, 10, 'search', { priority: 'high' });

// Create todo
const { create, loading: createLoading } = useCreateTodo();
await create({ title: 'New Todo', description: 'Description', priority: 'medium' });

// Update todo
const { update } = useUpdateTodo();
await update('todo-id', { completed: true });
```

### API Operations

```typescript
import { useApiQuery, useApiMutation } from '@/core';

// Query data
const { data, loading, error } = useApiQuery('/api/endpoint');

// Mutate data
const { mutate, loading } = useApiMutation('/api/endpoint', 'POST');
await mutate({ key: 'value' });
```

## 🔧 Key Features

### 1. **Type Safety**
- Full TypeScript support
- Shared type definitions
- Compile-time error checking

### 2. **Error Handling**
- Centralized error handling
- Rate limiting protection
- Automatic retry logic

### 3. **Authentication**
- JWT token management
- Session timeout handling
- Automatic token refresh

### 4. **Performance**
- Request cancellation
- Optimistic updates
- Efficient re-rendering

### 5. **Modularity**
- Loose coupling between modules
- Easy to test and maintain
- Scalable architecture

## 📋 Best Practices

### 1. **Import Structure**
```typescript
// ✅ Good - Import from core index
import { useAuth, useTodos } from '@/core';

// ❌ Bad - Direct imports
import { useAuth } from '@/core/contexts/AuthContext';
```

### 2. **Service Usage**
```typescript
// ✅ Good - Use hooks for React components
const { todos } = useTodos();

// ✅ Good - Use services for non-React code
import { getTodos } from '@/core';
const todos = await getTodos();
```

### 3. **Error Handling**
```typescript
// ✅ Good - Handle errors in components
const { data, error } = useApiQuery('/api/endpoint');
if (error) {
  // Handle error
}

// ✅ Good - Use try-catch for mutations
try {
  await createTodo(data);
} catch (error) {
  // Handle error
}
```

### 4. **Type Safety**
```typescript
// ✅ Good - Use proper types
const { user } = useAuth();
if (user?.role === UserRole.ADMIN) {
  // Admin logic
}

// ❌ Bad - String comparison
if (user?.role === 'admin') {
  // Admin logic
}
```

## 🔄 Migration Guide

### From Old Structure to New

1. **Update Imports**
```typescript
// Old
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/services/api';

// New
import { useAuth, apiRequest } from '@/core';
```

2. **Update Service Calls**
```typescript
// Old
import { login } from '@/services/api';

// New
import { login } from '@/core';
```

3. **Update Type Imports**
```typescript
// Old
import { User } from '@/types';

// New
import { User } from '@/core';
```

## 🧪 Testing

### Unit Testing Services
```typescript
import { login, validatePassword } from '@/core';

describe('Auth Service', () => {
  it('should validate password correctly', () => {
    const result = validatePassword('Password123!');
    expect(result.isValid).toBe(true);
  });
});
```

### Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/core';

const TestComponent = () => {
  const { user } = useAuth();
  return <div>{user?.name}</div>;
};

render(
  <AuthProvider>
    <TestComponent />
  </AuthProvider>
);
```

## 🔮 Future Enhancements

1. **Caching Layer**
   - React Query integration
   - Optimistic updates
   - Background refetching

2. **State Management**
   - Redux Toolkit integration
   - Persistent state
   - DevTools support

3. **Performance**
   - Code splitting
   - Lazy loading
   - Bundle optimization

4. **Monitoring**
   - Error tracking
   - Performance monitoring
   - Analytics integration

## 📚 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks Documentation](https://react.dev/reference/react/hooks)
- [React Context Documentation](https://react.dev/reference/react/createContext)
- [HTTP Client Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 🤝 Contributing

When adding new features to the core module:

1. **Follow the existing structure**
2. **Add proper TypeScript types**
3. **Include error handling**
4. **Write unit tests**
5. **Update documentation**
6. **Export from index.ts**

This modular architecture provides a solid foundation for building scalable, maintainable applications while ensuring type safety and good developer experience. 