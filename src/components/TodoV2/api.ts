// src/components/TodoV2/api.ts
// API utility for TodoV2 feature

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  completed?: boolean;
  assignedTo?: string;
  assignedBy?: string;
  createdAt?: string;
  completedAt?: string | null;
  category?: string;
  startDate?: string;
  endDate?: string;
  repeat?: string;
  taskCompleted?: string;
  confirmation?: string;
  creator?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  status?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function handleError(response: Response) {
  if (!response.ok) {
    return response.json().then(err => {
      // Handle rate limiting specifically
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      throw new Error(err.error || `API error (${response.status})`);
    });
  }
  return response;
}

export async function getTodos(): Promise<Todo[]> {
  const res = await fetch(`${API_BASE_URL}/todos`, {
    headers: getAuthHeaders(),
  });
  await handleError(res);
  const data = await res.json();
  return data.todos || [];
}

export async function createTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
  const res = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(todo),
  });
  await handleError(res);
  const data = await res.json();
  return data.todo;
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
  const res = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  await handleError(res);
  const data = await res.json();
  return data.todo;
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleError(res);
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: getAuthHeaders(),
  });
  await handleError(res);
  const data = await res.json();
  return data.users || [];
} 