import React, { useState } from 'react';
import { Member, MemberRole, Group } from '../../types';

interface MemberManagementProps {
  member?: Member;
  groups: Group[];
  onSave: (member: Member) => void;
  onCancel: () => void;
  userRole: string;
}

const MemberManagement: React.FC<MemberManagementProps> = ({
  member,
  groups,
  onSave,
  onCancel,
  userRole
}) => {
  const isEditing = !!member;
  const [formData, setFormData] = useState<Partial<Member>>(
    member || {
      name: '',
      email: '',
      phone: '',
      role: MemberRole.EMPLOYEE,
      department: '',
      position: '',
      employeeId: '',
      hireDate: '',
      groups: [],
      isLeader: false,
      isAdmin: false,
      approvalAuthority: false,
      status: 'active',
      workplaceId: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      },
      permissions: {
        canManageAllGroups: false,
        canManageAllMembers: false,
        canViewAllData: false,
        canApproveAllRequests: false,
        canManageSystemSettings: false,
        canManageAssignedGroups: false,
        canViewGroupMembers: false,
        canViewGroupReports: false,
        canViewGroupAttendance: false,
        canViewGroupSchedules: false,
        canApproveGroupRequests: false,
        canCreateGroupTasks: false,
        canManageGroupSettings: false,
        canViewOwnData: true,
        canSubmitRequests: true,
        canCreateReports: true,
        canUseAttendance: true,
        canViewOwnSchedule: true,
        canUseChat: true,
        canUsePostingBoard: true
      }
    }
  );

  // 1. Add state for new fields and settings (assume all are enabled for now)
  const [nationalId, setNationalId] = useState('');
  const [showNationalId, setShowNationalId] = useState(true); // Assume enabled
  const [jobTitle, setJobTitle] = useState('');
  const [jobTitleOptions] = useState(['Sales Manager', 'Developer', 'Designer', 'HR']); // Example
  const [grade, setGrade] = useState('');
  const [showGrade, setShowGrade] = useState(true); // Assume enabled
  const [gradeOptions] = useState(['A', 'B', 'C', 'D']); // Example
  const [customProperties, setCustomProperties] = useState<{ [key: string]: string }>({});
  const [showCustomProperties, setShowCustomProperties] = useState(true); // Assume enabled
  const [viewAttendanceHistory, setViewAttendanceHistory] = useState(true);
  const [defaultWorkSchedule, setDefaultWorkSchedule] = useState<{
    startTime: string;
    endTime: string;
    breakMinutes: string;
    daysOff: string[];
    workplace: string;
  }>({
    startTime: '',
    endTime: '',
    breakMinutes: '',
    daysOff: [],
    workplace: '',
  });
  const [showDefaultWorkSchedule, setShowDefaultWorkSchedule] = useState(true); // Assume enabled

  // 2. Restrict group selection based on userRole (assume leaders can only assign to their managed groups)
  const availableGroups = userRole === 'admin' ? groups : groups.filter(g => g.leaderId === formData.userId || g.leaderId === undefined);

  // 3. Masked National ID input handler
  const handleNationalIdChange = (value: string) => {
    // Only allow numbers, mask except last 4 digits
    const clean = value.replace(/[^0-9]/g, '');
    setNationalId(clean);
  };
  const getMaskedNationalId = () => {
    if (nationalId.length <= 4) return nationalId.replace(/./g, '•');
    return nationalId.slice(0, -4).replace(/./g, '•') + nationalId.slice(-4);
  };

  // 4. Custom property handler (assume 2 custom fields for demo)
  const customPropertyFields = [
    { key: 'custom1', label: 'Custom Property 1', type: 'text' },
    { key: 'custom2', label: 'Custom Property 2', type: 'text' },
  ];

  const handleInputChange = (field: keyof Member, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof Member, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleChange = (role: MemberRole) => {
    const isAdmin = role === MemberRole.ADMIN;
    const isLeader = role === MemberRole.LEADER || role === MemberRole.ADMIN;
    
    setFormData(prev => ({
      ...prev,
      role,
      isAdmin,
      isLeader,
      permissions: {
        ...prev.permissions!,
        canManageAllGroups: isAdmin,
        canManageAllMembers: isAdmin,
        canViewAllData: isAdmin,
        canApproveAllRequests: isAdmin,
        canManageSystemSettings: isAdmin,
        canManageAssignedGroups: isLeader,
        canViewGroupMembers: isLeader,
        canViewGroupReports: isLeader,
        canViewGroupAttendance: isLeader,
        canViewGroupSchedules: isLeader,
        canApproveGroupRequests: isLeader && (prev.approvalAuthority || false),
        canCreateGroupTasks: isLeader,
        canManageGroupSettings: isLeader
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const memberToSave: Member = {
      id: formData.id || `member-${Date.now()}`,
      userId: formData.userId || `user-${Date.now()}`,
      name: formData.name!,
      email: formData.email!,
      phone: formData.phone || '',
      role: formData.role!,
      department: formData.department || '',
      position: formData.position || '',
      employeeId: formData.employeeId || '',
      hireDate: formData.hireDate!,
      groups: formData.groups || [],
      isLeader: formData.isLeader || false,
      isAdmin: formData.isAdmin || false,
      approvalAuthority: formData.approvalAuthority || false,
      status: formData.status || 'active',
      managerId: formData.managerId,
      workplaceId: formData.workplaceId || '',
      emergencyContact: formData.emergencyContact!,
      permissions: formData.permissions!,
      lastLoginAt: formData.lastLoginAt,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(memberToSave);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Member' : 'Add New Member'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Member Basic Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                  <span className="ml-1 text-gray-400" title="Enter the employee's full legal name.">?</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                  <span className="ml-1 text-gray-400" title="Enter the employee's phone number. This will be used for registration.">?</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter phone number"
                />
              </div>
              {showNationalId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    National ID
                    <span className="ml-1 text-gray-400" title="Sensitive information. Will be masked and securely processed.">?</span>
                  </label>
                  <input
                    type="text"
                    value={getMaskedNationalId()}
                    onChange={(e) => handleNationalIdChange(e.target.value)}
                    maxLength={20}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter national ID number"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Number
                  <span className="ml-1 text-gray-400" title="If your company uses employee numbers, enter it here.">?</span>
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter employee number"
                />
              </div>
            </div>
          </div>

          {/* Section: Assignment & Role */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Assignment & Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                  <span className="ml-1 text-gray-400" title="Select the member's role.">?</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value as MemberRole)}
                  required
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value={MemberRole.EMPLOYEE}>Employee</option>
                  <option value={MemberRole.LEADER}>Leader</option>
                  <option value={MemberRole.ADMIN}>Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                  <span className="ml-1 text-gray-400" title="Select the job title.">?</span>
                </label>
                <select
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select job title</option>
                  {jobTitleOptions.map((title) => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>
              {showGrade && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade
                    <span className="ml-1 text-gray-400" title="Select the employee's grade.">?</span>
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select grade</option>
                    {gradeOptions.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Assignment
                <span className="ml-1 text-gray-400" title="Select the group(s) for this member. Leaders can only assign to their managed groups.">?</span>
              </label>
              <select
                multiple
                value={formData.groups}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  handleArrayChange('groups', selected);
                }}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                size={4}
              >
                {availableGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} - {group.description}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple groups</p>
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isLeader}
                  onChange={(e) => handleInputChange('isLeader', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Leader in Assigned Group</span>
              </label>
              {formData.isLeader && (
                <label className="flex items-center ml-6">
                  <input
                    type="checkbox"
                    checked={formData.approvalAuthority}
                    onChange={(e) => handleInputChange('approvalAuthority', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Approval Authority</span>
                </label>
              )}
            </div>
          </div>

          {/* Section: Permissions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Permissions</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={viewAttendanceHistory}
                onChange={(e) => setViewAttendanceHistory(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Allow viewing personal attendance history in app</span>
            </label>
          </div>

          {/* Section: Employment Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hire Date *
                  <span className="ml-1 text-gray-400" title="Enter the employment start date.">?</span>
                </label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  required
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                  <span className="ml-1 text-gray-400" title="Set the member's employment status.">?</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Custom Properties */}
          {showCustomProperties && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Custom Properties</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customPropertyFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      <span className="ml-1 text-gray-400" title="Custom property.">?</span>
                    </label>
                    <input
                      type={field.type}
                      value={customProperties[field.key] || ''}
                      onChange={(e) => setCustomProperties({ ...customProperties, [field.key]: e.target.value })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Default Work Schedule */}
          {showDefaultWorkSchedule && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Default Work Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                    <span className="ml-1 text-gray-400" title="Default work start time.">?</span>
                  </label>
                  <input
                    type="time"
                    value={defaultWorkSchedule.startTime}
                    onChange={(e) => setDefaultWorkSchedule({ ...defaultWorkSchedule, startTime: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                    <span className="ml-1 text-gray-400" title="Default work end time.">?</span>
                  </label>
                  <input
                    type="time"
                    value={defaultWorkSchedule.endTime}
                    onChange={(e) => setDefaultWorkSchedule({ ...defaultWorkSchedule, endTime: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Break (minutes)
                    <span className="ml-1 text-gray-400" title="Default break duration in minutes.">?</span>
                  </label>
                  <input
                    type="number"
                    value={defaultWorkSchedule.breakMinutes}
                    onChange={(e) => setDefaultWorkSchedule({ ...defaultWorkSchedule, breakMinutes: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days Off
                    <span className="ml-1 text-gray-400" title="Select days off.">?</span>
                  </label>
                  <select
                    multiple
                    value={defaultWorkSchedule.daysOff}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setDefaultWorkSchedule({ ...defaultWorkSchedule, daysOff: selected });
                    }}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple days</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workplace
                    <span className="ml-1 text-gray-400" title="Select the default workplace.">?</span>
                  </label>
                  <input
                    type="text"
                    value={defaultWorkSchedule.workplace}
                    onChange={(e) => setDefaultWorkSchedule({ ...defaultWorkSchedule, workplace: e.target.value })}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter workplace name"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Emergency Contact */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact?.name}
                  onChange={(e) => handleInputChange('emergencyContact', {
                    ...formData.emergencyContact,
                    name: e.target.value
                  })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact?.relationship}
                  onChange={(e) => handleInputChange('emergencyContact', {
                    ...formData.emergencyContact,
                    relationship: e.target.value
                  })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Spouse, Parent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact?.phone}
                  onChange={(e) => handleInputChange('emergencyContact', {
                    ...formData.emergencyContact,
                    phone: e.target.value
                  })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter contact phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.emergencyContact?.email}
                  onChange={(e) => handleInputChange('emergencyContact', {
                    ...formData.emergencyContact,
                    email: e.target.value
                  })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter contact email"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditing ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberManagement; 