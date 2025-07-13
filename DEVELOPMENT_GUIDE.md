# Development Guide - Todo Assignment Feature

## Overview

This guide provides comprehensive information for developers working on the Todo Assignment Feature in the Digital Tracking Merchandising platform.

## 🎯 Feature Overview

The Todo Assignment Feature enables administrators and team leaders to create and assign tasks to specific employees, providing better task distribution and accountability tracking.

### Key Components

1. **Frontend (React/TypeScript)**
   - `src/components/Todo/TodoPage.tsx` - Main todo management interface
   - Assignment dropdown for admins
   - User loading and management
   - Optimistic updates

2. **Backend (Node.js/Express)**
   - Todo API endpoints with assignment support
   - User filtering and authorization
   - Assignment tracking metadata

3. **Mobile (React Native)**
   - `mobile/src/screens/tasks/TasksScreen.tsx` - Mobile todo interface
   - Assigned todos display
   - Pull-to-refresh functionality

## 🏗️ Architecture

### Data Flow
```
Admin Creates Todo → Backend API → Database → Mobile App Sync → Employee Views
     ↓
Assignment Tracking → Completion → Status Update → Real-time Sync
```

### Database Schema
```javascript
// Todo Object Structure
{
  id: string,              // Unique todo identifier
  title: string,           // Todo title
  description?: string,    // Optional description
  priority: 'low' | 'medium' | 'high',
  completed: boolean,      // Completion status
  createdAt: string,       // Creation timestamp
  completedAt?: string,    // Completion timestamp
  userId: string,          // Creator ID
  assignedTo: string,      // Assigned user ID
  assignedBy: string,      // Assigner ID
  assignedAt: string       // Assignment timestamp
}
```

## 🚀 Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- Modern web browser
- Mobile device or emulator (for mobile development)

### Environment Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd Digital_Tracking_Merchandising
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd .. && npm install
   
   # Mobile
   cd mobile && npm install
   ```

3. **Environment Variables**
   ```bash
   # Backend (.env)
   PORT=5000
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   
   # Frontend (.env)
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend && npm start
   
   # Frontend (Terminal 2)
   npm start
   
   # Mobile (Terminal 3)
   cd mobile && npx expo start
   ```

## 💻 Development Workflow

### Frontend Development

#### TodoPage Component Structure
```typescript
// Main component with assignment functionality
const TodoPage: React.FC<TodoPageProps> = ({ userRole }) => {
  // State management
  const [todos, setTodos] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({...});

  // API functions
  const getTodos = async () => { ... };
  const createTodo = async (todoData: any) => { ... };
  const updateTodo = async (id: string, updates: any) => { ... };
  const deleteTodo = async (id: string) => { ... };

  // Event handlers
  const handleCreateTodo = async (e: React.FormEvent) => { ... };
  const handleUpdateTodo = async (id: string, updates: any) => { ... };
  const handleDeleteTodo = async (id: string) => { ... };
  const handleToggleComplete = async (todo: any) => { ... };

  // Utility functions
  const loadTodos = async () => { ... };
  const loadUsers = async () => { ... };
  const getPriorityBadge = (priority: string) => { ... };
  const formatDuration = (minutes: number) => { ... };
};
```

#### Key Development Patterns

1. **Optimistic Updates**
   ```typescript
   // Update UI immediately, then sync with backend
   setTodos(prev => [...prev, newTodo]);
   const response = await createTodo(formData);
   ```

2. **Error Handling**
   ```typescript
   try {
     const response = await apiRequest('/todos', options);
     // Handle success
   } catch (error) {
     console.error('API Error:', error);
     toast.error('Failed to create todo');
   }
   ```

3. **Role-Based Rendering**
   ```typescript
   {userRole === 'admin' && (
     <select value={formData.assignedTo} onChange={handleAssignmentChange}>
       {users.map(user => (
         <option key={user.id} value={user.id}>{user.name}</option>
       ))}
     </select>
   )}
   ```

### Backend Development

#### API Endpoint Structure
```javascript
// GET /api/todos - Get user's assigned todos
app.get('/api/todos', authenticateToken, (req, res) => {
  try {
    // Filter todos assigned to current user
    const userTodos = todos.filter(todo => todo.assignedTo === req.user.id);
    res.json({ todos: userTodos });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/todos - Create todo with assignment
app.post('/api/todos', authenticateToken, (req, res) => {
  try {
    const { title, description, priority = 'medium', assignedTo } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Create todo with assignment tracking
    const newTodo = {
      id: uuidv4(),
      title,
      description,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      userId: req.user.id,        // Creator
      assignedTo: assignedTo || req.user.id,  // Assigned user
      assignedBy: req.user.id,    // Who assigned it
      assignedAt: new Date().toISOString()
    };

    todos.push(newTodo);
    res.status(201).json({ 
      message: 'Todo created successfully',
      todo: newTodo 
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

#### Authentication Middleware
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

### Mobile Development

#### TasksScreen Component
```typescript
const TasksScreen: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load assigned todos
  const loadTodos = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/todos');
      setTodos(response.data.todos || []);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodos();
    setRefreshing(false);
  };

  // Toggle completion
  const toggleComplete = async (todoId: string, completed: boolean) => {
    try {
      await apiClient.put(`/todos/${todoId}`, { completed });
      await loadTodos(); // Refresh list
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };
};
```

## 🧪 Testing

### Running Tests

1. **Frontend Tests**
   ```bash
   npm test -- src/components/Todo/__tests__/TodoPage.test.tsx
   ```

2. **Backend Tests**
   ```bash
   cd backend && npm test -- __tests__/todo-assignment.test.js
   ```

3. **Mobile Tests**
   ```bash
   cd mobile && npm test -- src/screens/tasks/__tests__/TasksScreen.test.tsx
   ```

4. **Integration Tests**
   ```bash
   npm test -- __tests__/integration/todo-assignment-workflow.test.tsx
   ```

### Test Structure

#### Frontend Test Example
```typescript
describe('TodoPage Component', () => {
  test('should render assignment dropdown for admin', () => {
    renderWithProviders(<TodoPage userRole="admin" />);
    expect(screen.getByLabelText(/assign to/i)).toBeInTheDocument();
  });

  test('should create todo with assignment', async () => {
    mockApi.createTodo.mockResolvedValue({
      message: 'Todo created successfully',
      todo: { id: '1', assignedTo: 'user-2', assignedBy: 'admin-1' }
    });

    renderWithProviders(<TodoPage userRole="admin" />);
    
    // Fill form and submit
    fireEvent.change(screen.getByPlaceholderText(/title/i), {
      target: { value: 'New Task' }
    });
    fireEvent.click(screen.getByText(/create/i));

    expect(mockApi.createTodo).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Task',
        assignedTo: 'user-2'
      })
    );
  });
});
```

#### Backend Test Example
```javascript
describe('Todo Assignment API', () => {
  test('should create todo with assignment tracking', async () => {
    const todoData = {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'high',
      assignedTo: employeeId
    };

    const response = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(todoData);

    expect(response.status).toBe(201);
    expect(response.body.todo).toHaveProperty('assignedTo', employeeId);
    expect(response.body.todo).toHaveProperty('assignedBy', adminId);
    expect(response.body.todo).toHaveProperty('assignedAt');
  });
});
```

## 🔧 Common Development Tasks

### Adding New Assignment Features

1. **Update Data Model**
   ```typescript
   interface Todo {
     // ... existing fields
     assignedTo: string;
     assignedBy: string;
     assignedAt: string;
   }
   ```

2. **Update API Endpoint**
   ```javascript
   app.post('/api/todos', authenticateToken, (req, res) => {
     const { assignedTo } = req.body;
     // Add assignment logic
   });
   ```

3. **Update Frontend Component**
   ```typescript
   const [assignedTo, setAssignedTo] = useState('');
   // Add assignment dropdown
   ```

4. **Add Tests**
   ```typescript
   test('should handle assignment feature', () => {
     // Test assignment functionality
   });
   ```

### Debugging Tips

1. **API Debugging**
   ```bash
   # Check API logs
   cd backend && npm start
   
   # Test API endpoints
   curl -H "Authorization: Bearer <token>" http://localhost:5000/api/todos
   ```

2. **Frontend Debugging**
   ```bash
   # Check browser console
   # Use React DevTools
   # Check network tab for API calls
   ```

3. **Mobile Debugging**
   ```bash
   # Use Expo DevTools
   # Check device logs
   # Use React Native Debugger
   ```

## 📚 Resources

### Documentation
- [API Documentation](http://localhost:5000/api/docs)
- [Complete Documentation](DOCUMENTATION.md)
- [Testing Guide](TESTING_GUIDE.md)

### Code Examples
- [TodoPage Component](src/components/Todo/TodoPage.tsx)
- [TasksScreen Component](mobile/src/screens/tasks/TasksScreen.tsx)
- [Todo API Endpoints](backend/server.js)

### Testing Examples
- [Frontend Tests](src/components/Todo/__tests__/TodoPage.test.tsx)
- [Backend Tests](backend/__tests__/todo-assignment.test.js)
- [Mobile Tests](mobile/src/screens/tasks/__tests__/TasksScreen.test.tsx)
- [Integration Tests](__tests__/integration/todo-assignment-workflow.test.tsx)

## 🤝 Contributing

When contributing to the todo assignment feature:

1. **Follow the existing code patterns**
2. **Add comprehensive tests**
3. **Update documentation**
4. **Use TypeScript for type safety**
5. **Follow the commit message format**
6. **Test on both web and mobile**

## 🐛 Known Issues

1. **User List Loading** - Sometimes user list doesn't load in assignment dropdown
   - **Solution**: Check network connectivity and API response
   
2. **Assignment Sync** - Assignment changes may not sync immediately
   - **Solution**: Implement real-time updates or manual refresh

3. **Mobile Performance** - Large todo lists may cause performance issues
   - **Solution**: Implement pagination or virtualization

## 📈 Future Enhancements

1. **Bulk Assignment** - Assign multiple todos at once
2. **Assignment Templates** - Predefined assignment patterns
3. **Assignment Analytics** - Track assignment patterns and completion rates
4. **Real-time Notifications** - Notify users of new assignments
5. **Assignment History** - Track assignment changes over time 