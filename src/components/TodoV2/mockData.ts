// Mock types (simplified for demo)
export type Todo = {
  id: string;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  repeat: string;
  assignedTo: number;
  status: 'Ongoing' | 'Closed';
  taskCompleted: string;
  confirmation: string;
  creator: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
};

export type User = {
  id: number;
  name: string;
  role: string;
};

export type TodoSettings = {
  allowSelfAssign: boolean;
  defaultPriority: 'low' | 'medium' | 'high' | 'urgent';
};

// Mock todos (matches screenshot)
export const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Mystore Zugang',
    category: 'Promoter ToDo (TV | HA)',
    startDate: '2025.07.14 (Mo) 00:00',
    endDate: '2025.07.18 (Fr) 23:59',
    repeat: 'None',
    assignedTo: 256,
    status: 'Ongoing',
    taskCompleted: '11.7% (30/256)',
    confirmation: '-',
    creator: 'C_20',
    priority: 'medium',
  },
  {
    id: '2',
    title: 'VSX Lifestyle Weeks 7. Juli bis zu m 10. August II',
    category: 'BA - ToDo (TV & Promoter ToDo (TV)',
    startDate: '2025.07.14 (Mo) 00:00',
    endDate: '2025.07.20 (So) 23:59',
    repeat: 'None',
    assignedTo: 213,
    status: 'Ongoing',
    taskCompleted: '0.0% (0/213)',
    confirmation: '-',
    creator: 'C_20',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Weekly Report Feedbackbogen',
    category: 'Promoter ToDo (TV)',
    startDate: '2025.07.14 (Mo) 00:00',
    endDate: '2025.07.20 (So) 23:59',
    repeat: 'Every week - Mo',
    assignedTo: 404,
    status: 'Ongoing',
    taskCompleted: '2.2% (9/404)',
    confirmation: '-',
    creator: 'C_20',
    priority: 'medium',
  },
  {
    id: '4',
    title: '98 Zoll - MSD Eingangsbereich, Gewinnspiel Update',
    category: 'BA - ToDo (TV)',
    startDate: '2025.07.11 (Fr) 00:00',
    endDate: '2025.07.31 (Th) 23:59',
    repeat: 'None',
    assignedTo: 39,
    status: 'Ongoing',
    taskCompleted: '87.2% (34/39)',
    confirmation: '0.0% (0/39)',
    creator: 'Backoffice',
    priority: 'high',
  },
  {
    id: '5',
    title: 'Jet Qualitätssicherung',
    category: 'Promoter ToDo (HA)',
    startDate: '2025.07.11 (Fr) 00:00',
    endDate: '2025.07.31 (Th) 23:59',
    repeat: 'Every week - Fr',
    assignedTo: 88,
    status: 'Closed',
    taskCompleted: '38.6% (34/88)',
    confirmation: '-',
    creator: 'Backoffice',
    priority: 'high',
  },
  {
    id: '6',
    title: 'Roll-Out: Buying Guide',
    category: 'Promoter ToDo (TV)',
    startDate: '2025.07.14 (Mo) 00:00',
    endDate: '2025.07.19 (Sa) 23:59',
    repeat: 'None',
    assignedTo: 217,
    status: 'Ongoing',
    taskCompleted: '16.6% (36/217)',
    confirmation: '0.0% (0/217)',
    creator: 'C_80',
    priority: 'medium',
  },
];

// Mock users
export const mockUsers: User[] = [
  { id: 256, name: 'Team 256', role: 'employee' },
  { id: 213, name: 'Team 213', role: 'employee' },
  { id: 404, name: 'Team 404', role: 'employee' },
  { id: 39, name: 'Team 39', role: 'employee' },
  { id: 88, name: 'Team 88', role: 'employee' },
  { id: 217, name: 'Team 217', role: 'employee' },
  { id: 1, name: 'Backoffice', role: 'admin' },
  { id: 2, name: 'C_20', role: 'admin' },
  { id: 3, name: 'C_80', role: 'admin' },
];

// Mock settings
export const mockSettings: TodoSettings = {
  allowSelfAssign: true,
  defaultPriority: 'medium',
}; 