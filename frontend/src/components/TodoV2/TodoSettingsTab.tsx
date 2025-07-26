import React, { useState } from 'react';
import { mockSettings, TodoSettings } from './mockData';

interface TodoSettingsTabProps {
  userRole: string;
}

export default function TodoSettingsTab({ userRole }: TodoSettingsTabProps) {
  const [settings, setSettings] = useState<TodoSettings>(mockSettings);
  const [success, setSuccess] = useState(false);

  if (userRole !== 'admin') {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 py-12">
        [Settings are only available to administrators]
      </div>
    );
  }

  // Handle input changes
  const handleChange = (field: keyof TodoSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Handle save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    // In real app, call API here
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Todo Settings</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.allowSelfAssign}
            onChange={e => handleChange('allowSelfAssign', e.target.checked)}
            className="mr-2"
            id="allowSelfAssign"
          />
          <label htmlFor="allowSelfAssign" className="text-sm font-medium">Allow self-assign</label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Default Priority</label>
          <select
            value={settings.defaultPriority}
            onChange={e => handleChange('defaultPriority', e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">Save Settings</button>
        {success && <div className="text-green-600 mt-2">Settings saved (mock)!</div>}
      </form>
    </div>
  );
} 