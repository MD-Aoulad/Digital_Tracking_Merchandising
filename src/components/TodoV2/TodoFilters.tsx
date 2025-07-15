import React from 'react';

export interface TodoFiltersState {
  dateFrom: string;
  dateTo: string;
  category: string;
  status: string;
}

interface TodoFiltersProps {
  filters: TodoFiltersState;
  onChange: (filters: TodoFiltersState) => void;
  categories: string[];
  statuses: string[];
}

export default function TodoFilters({ filters, onChange, categories, statuses }: TodoFiltersProps) {
  // Handle input changes
  const handleChange = (field: keyof TodoFiltersState, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <form className="flex flex-wrap items-center gap-4 mb-4">
      {/* Date range */}
      <input
        type="date"
        value={filters.dateFrom}
        onChange={e => handleChange('dateFrom', e.target.value)}
        className="border rounded px-2 py-1 text-sm"
        placeholder="From"
      />
      <span>-</span>
      <input
        type="date"
        value={filters.dateTo}
        onChange={e => handleChange('dateTo', e.target.value)}
        className="border rounded px-2 py-1 text-sm"
        placeholder="To"
      />
      {/* Category */}
      <select
        value={filters.category}
        onChange={e => handleChange('category', e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="">Category</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      {/* Status */}
      <select
        value={filters.status}
        onChange={e => handleChange('status', e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="">Status</option>
        {statuses.map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
    </form>
  );
} 