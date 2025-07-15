import React, { useState, useEffect } from 'react';
import { createTodo, getUsers, User, Todo } from './api';

interface TodoManagementTabProps {
  userRole: string;
}

type Priority = 'low' | 'medium' | 'high' | 'urgent';

const initialForm: Omit<Todo, 'id'> = {
  title: '',
  description: '',
  category: '',
  startDate: '',
  endDate: '',
  repeat: '',
  assignedTo: '',
  priority: 'medium',
  taskCompleted: '',
  confirmation: '',
  creator: '',
};

export default function TodoManagementTab({ userRole }: TodoManagementTabProps) {
  const [form, setForm] = useState<Omit<Todo, 'id'>>(initialForm);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch users for assignment (admin only)
  useEffect(() => {
    if (userRole === 'admin') {
      getUsers().then(setUsers).catch(() => setUsers([]));
    }
  }, [userRole]);

  // Handle input changes
  const handleChange = (field: keyof Omit<Todo, 'id'>, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createTodo(form);
      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Create / Assign Task</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading && <div className="text-gray-500 mb-2">Loading...</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            type="text"
            value={form.category}
            onChange={e => handleChange('category', e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="text"
              value={form.startDate}
              onChange={e => handleChange('startDate', e.target.value)}
              className="border rounded px-3 py-2 w-full"
              placeholder="YYYY.MM.DD (Day) HH:mm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="text"
              value={form.endDate}
              onChange={e => handleChange('endDate', e.target.value)}
              className="border rounded px-3 py-2 w-full"
              placeholder="YYYY.MM.DD (Day) HH:mm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Repeat</label>
          <input
            type="text"
            value={form.repeat}
            onChange={e => handleChange('repeat', e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="e.g., None, Every week - Mo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Assign to</label>
          <select
            value={form.assignedTo}
            onChange={e => handleChange('assignedTo', e.target.value)}
            className="border rounded px-3 py-2 w-full"
            required
            disabled={userRole !== 'admin'}
          >
            <option value="">Select user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={e => handleChange('priority', e.target.value as Priority)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Task Completed</label>
          <input
            type="text"
            value={form.taskCompleted}
            onChange={e => handleChange('taskCompleted', e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="e.g., 11.7% (30/256)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirmation</label>
          <input
            type="text"
            value={form.confirmation}
            onChange={e => handleChange('confirmation', e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Creator</label>
          <input
            type="text"
            value={form.creator}
            onChange={e => handleChange('creator', e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="e.g., C_20"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold" disabled={loading}>Create Task</button>
        {success && <div className="text-green-600 mt-2">Task created!</div>}
      </form>
    </div>
  );
} 