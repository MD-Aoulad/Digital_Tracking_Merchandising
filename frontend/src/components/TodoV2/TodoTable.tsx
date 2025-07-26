import React from 'react';
import { Todo } from './api';

interface TodoTableProps {
  todos: Todo[];
  onRowClick?: (todo: Todo) => void;
  onView?: (todo: Todo) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (todo: Todo) => void;
}

export default function TodoTable({ todos, onRowClick, onView, onEdit, onDelete }: TodoTableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase">No.</th>
          <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase">Title</th>
          <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase">Category</th>
          <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase">Start date</th>
          <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase">End date</th>
          <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase">Repeat</th>
          <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase">Assigned to</th>
          <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase">Task completed</th>
          <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase">Confirmation</th>
          <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase">Creator</th>
          <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {todos.map((todo, idx) => (
          <tr
            key={todo.id}
            className="hover:bg-blue-50 cursor-pointer"
            onClick={() => onRowClick && onRowClick(todo)}
            data-testid={`todo-row-${todo.id}`}
          >
            <td className="px-2 py-2 text-center text-sm text-gray-700">{idx + 1}</td>
            <td className="px-2 py-2 text-sm font-medium text-blue-900">{todo.title}</td>
            <td className="px-2 py-2 text-sm text-gray-700">{todo.category}</td>
            <td className="px-2 py-2 text-sm text-gray-700">{todo.startDate}</td>
            <td className="px-2 py-2 text-sm text-gray-700">{todo.endDate}</td>
            <td className="px-2 py-2 text-sm text-gray-700">{todo.repeat}</td>
            <td className="px-2 py-2 text-sm text-gray-700">{todo.assignedTo}</td>
            <td className="px-2 py-2 text-sm">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${todo.completed ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>{todo.completed ? 'Closed' : 'Ongoing'}</span>
            </td>
            <td className="px-2 py-2 text-sm text-gray-700">{todo.taskCompleted}</td>
            <td className="px-2 py-2 text-sm text-gray-700">{todo.confirmation}</td>
            <td className="px-2 py-2 text-sm text-gray-700">{todo.creator}</td>
            {/* Actions column */}
            <td className="px-2 py-2 text-sm flex gap-2">
              <button
                type="button"
                title="View"
                className="text-blue-600 hover:underline"
                onClick={e => { e.stopPropagation(); onView && onView(todo); }}
              >
                👁️
              </button>
              <button
                type="button"
                title="Edit"
                className="text-yellow-600 hover:underline"
                onClick={e => { e.stopPropagation(); onEdit && onEdit(todo); }}
              >
                ✏️
              </button>
              <button
                type="button"
                title="Delete"
                className="text-red-600 hover:underline"
                onClick={e => { e.stopPropagation(); onDelete && onDelete(todo); }}
              >
                🗑️
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 