import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Filter,
  FileText,
  Clipboard,
  Calendar,
  User,
  MapPin,
  Camera,
  Send,
  Archive,
  Search,
  Settings,
  BarChart3,
  Clock,
  XCircle
} from 'lucide-react';

// Types for Operations Management
interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  category: string;
  assignedTo: string;
  dueDate: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

interface Checklist {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: string[];
  notes?: string;
}

interface Audit {
  id: string;
  title: string;
  type: 'safety' | 'quality' | 'compliance' | 'maintenance' | 'inventory';
  location: string;
  auditor: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed';
  score?: number;
  maxScore: number;
  findings: string[];
  recommendations: string[];
  attachments?: string[];
  nextAuditDate?: string;
}

interface CustomForm {
  id: string;
  title: string;
  description: string;
  category: string;
  fields: FormField[];
  isActive: boolean;
  createdAt: string;
  submissions: FormSubmission[];
}

interface FormField {
  id: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'file';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: string;
}

interface FormSubmission {
  id: string;
  formId: string;
  submittedBy: string;
  submittedAt: string;
  data: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

const OperationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checklists' | 'audits' | 'forms'>('checklists');
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data
  const [checklists, setChecklists] = useState<Checklist[]>([
    {
      id: '1',
      title: 'Daily Safety Inspection',
      description: 'Complete safety checks for all equipment and work areas',
      category: 'Safety',
      location: 'Main Warehouse',
      assignedTo: 'John Smith',
      dueDate: '2024-01-15',
      status: 'in-progress',
      priority: 'high',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12',
      items: [
        { id: '1', title: 'Check fire extinguishers', description: 'Verify all fire extinguishers are properly charged', completed: true, required: true, category: 'Safety', assignedTo: 'John Smith', dueDate: '2024-01-15', completedAt: '2024-01-12T09:00:00', completedBy: 'John Smith' },
        { id: '2', title: 'Inspect emergency exits', description: 'Ensure all emergency exits are clear and accessible', completed: false, required: true, category: 'Safety', assignedTo: 'John Smith', dueDate: '2024-01-15' },
        { id: '3', title: 'Check first aid kits', description: 'Verify first aid kits are fully stocked', completed: true, required: true, category: 'Safety', assignedTo: 'John Smith', dueDate: '2024-01-15', completedAt: '2024-01-12T09:30:00', completedBy: 'John Smith' }
      ]
    },
    {
      id: '2',
      title: 'Equipment Maintenance',
      description: 'Routine maintenance checks for production equipment',
      category: 'Maintenance',
      location: 'Production Floor',
      assignedTo: 'Mike Johnson',
      dueDate: '2024-01-16',
      status: 'pending',
      priority: 'medium',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10',
      items: [
        { id: '1', title: 'Check oil levels', description: 'Verify oil levels in all machinery', completed: false, required: true, category: 'Maintenance', assignedTo: 'Mike Johnson', dueDate: '2024-01-16' },
        { id: '2', title: 'Clean filters', description: 'Clean and replace air filters', completed: false, required: true, category: 'Maintenance', assignedTo: 'Mike Johnson', dueDate: '2024-01-16' }
      ]
    }
  ]);

  const [audits, setAudits] = useState<Audit[]>([
    {
      id: '1',
      title: 'Quality Control Audit',
      type: 'quality',
      location: 'Production Line A',
      auditor: 'Sarah Wilson',
      date: '2024-01-14',
      status: 'completed',
      score: 85,
      maxScore: 100,
      findings: ['Minor quality issues found in batch #1234', 'Documentation needs improvement'],
      recommendations: ['Implement additional quality checks', 'Update documentation procedures']
    },
    {
      id: '2',
      title: 'Safety Compliance Audit',
      type: 'safety',
      location: 'Warehouse B',
      auditor: 'David Brown',
      date: '2024-01-16',
      status: 'scheduled',
      maxScore: 100,
      findings: [],
      recommendations: []
    }
  ]);

  const [customForms, setCustomForms] = useState<CustomForm[]>([
    {
      id: '1',
      title: 'Incident Report Form',
      description: 'Report any workplace incidents or near-misses',
      category: 'Safety',
      isActive: true,
      createdAt: '2024-01-01',
      fields: [
        { id: '1', type: 'text', label: 'Incident Location', required: true, placeholder: 'Enter incident location' },
        { id: '2', type: 'date', label: 'Incident Date', required: true },
        { id: '3', type: 'textarea', label: 'Description', required: true, placeholder: 'Describe what happened' },
        { id: '4', type: 'select', label: 'Severity', required: true, options: ['Low', 'Medium', 'High', 'Critical'] },
        { id: '5', type: 'file', label: 'Photos/Documents', required: false }
      ],
      submissions: [
        {
          id: '1',
          formId: '1',
          submittedBy: 'John Smith',
          submittedAt: '2024-01-12T10:00:00',
          status: 'approved',
          data: {
            'Incident Location': 'Warehouse A',
            'Incident Date': '2024-01-12',
            'Description': 'Minor spill in aisle 3',
            'Severity': 'Low'
          },
          reviewedBy: 'Manager',
          reviewedAt: '2024-01-12T14:00:00'
        }
      ]
    }
  ]);

  const handleChecklistItemToggle = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: checklist.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                completed: !item.completed,
                completedAt: !item.completed ? new Date().toISOString() : undefined,
                completedBy: !item.completed ? 'Current User' : undefined
              };
            }
            return item;
          })
        };
      }
      return checklist;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredChecklists = checklists.filter(checklist => 
    checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || checklist.category === filterCategory)
  );

  const filteredAudits = audits.filter(audit => 
    audit.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || audit.type === filterCategory)
  );

  const filteredForms = customForms.filter(form => 
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || form.category === filterCategory)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Operations Management</h1>
          <p className="text-gray-600">Manage checklists, audits, and custom forms for field operations</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search operations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Safety">Safety</option>
                <option value="Quality">Quality</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Compliance">Compliance</option>
                <option value="Inventory">Inventory</option>
              </select>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Create New
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'checklists', label: 'Checklists', icon: CheckSquare },
                { id: 'audits', label: 'Audits', icon: FileText },
                { id: 'forms', label: 'Custom Forms', icon: Clipboard }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'checklists' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredChecklists.map((checklist) => (
                    <motion.div
                      key={checklist.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedChecklist(checklist)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{checklist.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{checklist.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(checklist.status)}`}>
                            {checklist.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(checklist.priority)}`}>
                            {checklist.priority}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={16} />
                          <span>{checklist.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={16} />
                          <span>{checklist.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          <span>Due: {new Date(checklist.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckSquare size={16} />
                          <span>
                            {checklist.items.filter(item => item.completed).length} / {checklist.items.length} completed
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'audits' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAudits.map((audit) => (
                    <motion.div
                      key={audit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedAudit(audit)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{audit.title}</h3>
                          <p className="text-sm text-gray-600 capitalize">{audit.type} Audit</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                          {audit.status}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={16} />
                          <span>{audit.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={16} />
                          <span>{audit.auditor}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          <span>{new Date(audit.date).toLocaleDateString()}</span>
                        </div>
                        {audit.score && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BarChart3 size={16} />
                            <span>Score: {audit.score}/{audit.maxScore}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'forms' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredForms.map((form) => (
                    <motion.div
                      key={form.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedForm(form)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{form.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{form.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${form.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {form.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clipboard size={16} />
                          <span>{form.fields.length} fields</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText size={16} />
                          <span>{form.submissions.length} submissions</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          <span>Created: {new Date(form.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checklist Detail Modal */}
      {selectedChecklist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{selectedChecklist.title}</h2>
                <button
                  onClick={() => setSelectedChecklist(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <p className="text-gray-600 mt-2">{selectedChecklist.description}</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {selectedChecklist.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                    <button
                      onClick={() => handleChecklistItemToggle(selectedChecklist.id, item.id)}
                      className="mt-1"
                    >
                      {item.completed ? (
                        <CheckSquare className="text-green-600" size={20} />
                      ) : (
                        <Square className="text-gray-400" size={20} />
                      )}
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {item.title}
                      </h4>
                      <p className={`text-sm ${item.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                      {item.completed && item.completedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Completed by {item.completedBy} on {new Date(item.completedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OperationsPage;
