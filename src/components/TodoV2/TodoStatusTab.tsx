import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getTodos, updateTodo, deleteTodo, Todo } from './api';
import TodoTable from './TodoTable';
import TodoFilters, { TodoFiltersState } from './TodoFilters';

interface TodoStatusTabProps {
  userRole: string;
}

const getUnique = (arr: string[]) => Array.from(new Set(arr));

export default function TodoStatusTab({ userRole }: TodoStatusTabProps) {
  // State for todos, loading, error
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<TodoFiltersState>({
    dateFrom: '',
    dateTo: '',
    category: '',
    status: '',
  });

  // Modal state
  const [viewTodo, setViewTodo] = useState<Todo | null>(null);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [deleteTodoObj, setDeleteTodoObj] = useState<Todo | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; category: string }>({ title: '', category: '' });

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load todos';
      setError(errorMessage);
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Unique categories and statuses for dropdowns
  const categories = useMemo(() => getUnique(todos.map(t => t.category || '')), [todos]);
  const statuses = useMemo(() => getUnique(todos.map(t => t.completed ? 'Closed' : 'Ongoing')), [todos]);

  // Filtering logic
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      // Date filtering (simple string match for demo)
      if (filters.dateFrom && todo.createdAt && todo.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && todo.createdAt && todo.createdAt > filters.dateTo) return false;
      if (filters.category && todo.category !== filters.category) return false;
      if (filters.status) {
        const status = todo.completed ? 'Closed' : 'Ongoing';
        if (filters.status !== status) return false;
      }
      return true;
    });
  }, [filters, todos]);

  // Summary counts
  const summary = useMemo(() => ({
    ongoing: todos.filter(t => !t.completed).length,
    closed: todos.filter(t => t.completed).length,
    notCompleted: 0, // Placeholder
    notConfirmed: 0, // Placeholder
    total: todos.length,
  }), [todos]);

  // Handlers for actions
  const handleView = (todo: Todo) => setViewTodo(todo);
  const handleEdit = (todo: Todo) => {
    setEditTodo(todo);
    setEditForm({ title: todo.title, category: todo.category || '' });
  };
  const handleDelete = (todo: Todo) => setDeleteTodoObj(todo);

  // Handler for closing modals
  const closeModals = () => {
    setViewTodo(null);
    setEditTodo(null);
    setDeleteTodoObj(null);
  };

  // Handler for edit form change (mock, no save)
  const handleEditFormChange = (field: 'title' | 'category', value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Handler for confirming edit (calls API)
  const confirmEdit = async () => {
    if (!editTodo) return;
    setLoading(true);
    try {
      await updateTodo(editTodo.id, { title: editForm.title, category: editForm.category });
      await fetchTodos();
      alert('Saved!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
      closeModals();
    }
  };

  // Handler for confirming delete (calls API)
  const confirmDelete = async () => {
    if (!deleteTodoObj) return;
    setLoading(true);
    try {
      await deleteTodo(deleteTodoObj.id);
      await fetchTodos();
      alert('Todo deleted!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setLoading(false);
      closeModals();
    }
  };

  return (
    <div>
      {/* Summary Cards */}
      <div className="flex space-x-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 flex-1 text-center">
          <div className="text-2xl font-bold text-blue-700">{summary.ongoing}</div>
          <div className="text-sm text-blue-700 font-semibold">Ongoing</div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 flex-1 text-center">
          <div className="text-2xl font-bold text-gray-700">{summary.closed}</div>
          <div className="text-sm text-gray-700 font-semibold">Closed</div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 flex-1 text-center">
          <div className="text-2xl font-bold text-gray-700">{summary.notCompleted}</div>
          <div className="text-sm text-gray-700 font-semibold">Not completed</div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 flex-1 text-center">
          <div className="text-2xl font-bold text-gray-700">{summary.notConfirmed}</div>
          <div className="text-sm text-gray-700 font-semibold">Not confirmed</div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="text-red-800">{error}</div>
              <button
                onClick={fetchTodos}
                disabled={loading}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          </div>
        )}
        {loading && <div className="text-gray-500 mb-2">Loading...</div>}
        <TodoFilters
          filters={filters}
          onChange={setFilters}
          categories={categories}
          statuses={statuses}
        />
        <TodoTable
          todos={filteredTodos}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* View Modal */}
      {viewTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-md">
            <h3 className="text-lg font-bold mb-2">View Todo</h3>
            <div className="mb-2"><b>Title:</b> {viewTodo.title}</div>
            <div className="mb-2"><b>Category:</b> {viewTodo.category}</div>
            <div className="mb-2"><b>Status:</b> {viewTodo.completed ? 'Closed' : 'Ongoing'}</div>
            <div className="mb-2"><b>Assigned to:</b> {viewTodo.assignedTo}</div>
            <div className="mb-2"><b>Creator:</b> {viewTodo.assignedBy}</div>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={closeModals}>Close</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-md">
            <h3 className="text-lg font-bold mb-2">Edit Todo</h3>
            <form className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => handleEditFormChange('title', e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={e => handleEditFormChange('category', e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded" onClick={closeModals}>Close</button>
                <button type="button" className="px-4 py-2 bg-green-600 text-white rounded" onClick={confirmEdit} disabled={loading}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTodoObj && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-md">
            <h3 className="text-lg font-bold mb-2">Delete Todo</h3>
            <div className="mb-4">Are you sure you want to delete <b>{deleteTodoObj.title}</b>?</div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={closeModals}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={confirmDelete} disabled={loading}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 