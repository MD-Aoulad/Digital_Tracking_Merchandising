import { getApprovalStats, getApprovalSettings, updateApprovalSettings, getApprovalRequests, createApprovalRequest, updateApprovalRequest, deleteApprovalRequest, getApprovalDelegations, createApprovalDelegation, updateApprovalDelegation, deleteApprovalDelegation, getApprovalWorkflows, createApprovalWorkflow, updateApprovalWorkflow, deleteApprovalWorkflow } from '../../services/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('Approval API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('Approval Statistics', () => {
    test('fetches approval statistics successfully', async () => {
      const mockStats = {
        totalRequests: 100,
        pendingRequests: 25,
        approvedRequests: 60,
        rejectedRequests: 15,
        averageResponseTime: 2.5
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      });

      const result = await getApprovalStats();

      expect(fetch).toHaveBeenCalledWith('/api/approval/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      expect(result).toEqual(mockStats);
    });

    test('handles approval statistics error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getApprovalStats()).rejects.toThrow('Network error');
    });
  });

  describe('Approval Settings', () => {
    test('fetches approval settings successfully', async () => {
      const mockSettings = {
        general: {
          enabled: true,
          requireApproval: true,
          autoApprove: false,
          maxApprovers: 2,
          approvalTimeout: 7
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings
      });

      const result = await getApprovalSettings();

      expect(fetch).toHaveBeenCalledWith('/api/approval/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      expect(result).toEqual(mockSettings);
    });

    test('updates approval settings successfully', async () => {
      const updatedSettings = {
        general: {
          enabled: false,
          requireApproval: true,
          autoApprove: false,
          maxApprovers: 3,
          approvalTimeout: 14
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await updateApprovalSettings(updatedSettings);

      expect(fetch).toHaveBeenCalledWith('/api/approval/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedSettings)
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('Approval Requests', () => {
    test('fetches approval requests successfully', async () => {
      const mockRequests = [
        {
          id: '1',
          title: 'Test Request',
          description: 'Test description',
          type: 'leave',
          status: 'pending',
          priority: 'medium',
          requesterId: 'user1',
          requesterName: 'John Doe',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRequests
      });

      const result = await getApprovalRequests();

      expect(fetch).toHaveBeenCalledWith('/api/approval/requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      expect(result).toEqual(mockRequests);
    });

    test('creates approval request successfully', async () => {
      const newRequest = {
        title: 'New Request',
        description: 'New description',
        type: 'leave',
        priority: 'high'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, id: '2' })
      });

      const result = await createApprovalRequest(newRequest);

      expect(fetch).toHaveBeenCalledWith('/api/approval/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newRequest)
      });
      expect(result).toEqual({ success: true, id: '2' });
    });

    test('updates approval request successfully', async () => {
      const updateData = {
        status: 'approved',
        comment: 'Approved by manager'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await updateApprovalRequest('1', updateData);

      expect(fetch).toHaveBeenCalledWith('/api/approval/requests/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      expect(result).toEqual({ success: true });
    });

    test('deletes approval request successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await deleteApprovalRequest('1');

      expect(fetch).toHaveBeenCalledWith('/api/approval/requests/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('Approval Delegations', () => {
    test('fetches approval delegations successfully', async () => {
      const mockDelegations = [
        {
          id: '1',
          delegatorId: 'user1',
          delegatorName: 'John Doe',
          delegateId: 'user2',
          delegateName: 'Jane Smith',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T00:00:00Z',
          status: 'active'
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDelegations
      });

      const result = await getApprovalDelegations();

      expect(fetch).toHaveBeenCalledWith('/api/approval/delegations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      expect(result).toEqual(mockDelegations);
    });

    test('creates approval delegation successfully', async () => {
      const newDelegation = {
        delegateId: 'user2',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T00:00:00Z',
        reason: 'Vacation'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, id: '2' })
      });

      const result = await createApprovalDelegation(newDelegation);

      expect(fetch).toHaveBeenCalledWith('/api/approval/delegations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newDelegation)
      });
      expect(result).toEqual({ success: true, id: '2' });
    });

    test('updates approval delegation successfully', async () => {
      const updateData = {
        endDate: '2024-02-15T00:00:00Z',
        status: 'inactive'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await updateApprovalDelegation('1', updateData);

      expect(fetch).toHaveBeenCalledWith('/api/approval/delegations/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      expect(result).toEqual({ success: true });
    });

    test('deletes approval delegation successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await deleteApprovalDelegation('1');

      expect(fetch).toHaveBeenCalledWith('/api/approval/delegations/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('Approval Workflows', () => {
    test('fetches approval workflows successfully', async () => {
      const mockWorkflows = [
        {
          id: '1',
          name: 'Leave Approval Workflow',
          description: 'Workflow for leave requests',
          steps: [
            {
              id: '1',
              name: 'Manager Approval',
              approverRole: 'manager',
              order: 1
            }
          ],
          enabled: true
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkflows
      });

      const result = await getApprovalWorkflows();

      expect(fetch).toHaveBeenCalledWith('/api/approval/workflows', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      expect(result).toEqual(mockWorkflows);
    });

    test('creates approval workflow successfully', async () => {
      const newWorkflow = {
        name: 'New Workflow',
        description: 'New workflow description',
        steps: [
          {
            name: 'First Approval',
            approverRole: 'manager',
            order: 1
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, id: '2' })
      });

      const result = await createApprovalWorkflow(newWorkflow);

      expect(fetch).toHaveBeenCalledWith('/api/approval/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newWorkflow)
      });
      expect(result).toEqual({ success: true, id: '2' });
    });

    test('updates approval workflow successfully', async () => {
      const updateData = {
        name: 'Updated Workflow',
        enabled: false
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await updateApprovalWorkflow('1', updateData);

      expect(fetch).toHaveBeenCalledWith('/api/approval/workflows/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      expect(result).toEqual({ success: true });
    });

    test('deletes approval workflow successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await deleteApprovalWorkflow('1');

      expect(fetch).toHaveBeenCalledWith('/api/approval/workflows/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('Error Handling', () => {
    test('handles 401 unauthorized error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(getApprovalStats()).rejects.toThrow('Unauthorized');
    });

    test('handles 403 forbidden error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      await expect(getApprovalStats()).rejects.toThrow('Forbidden');
    });

    test('handles 500 server error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(getApprovalStats()).rejects.toThrow('Internal Server Error');
    });

    test('handles network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getApprovalStats()).rejects.toThrow('Network error');
    });
  });

  describe('Authentication', () => {
    test('includes authorization header with token', async () => {
      localStorage.setItem('token', 'test-token');

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await getApprovalStats();

      expect(fetch).toHaveBeenCalledWith('/api/approval/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
    });

    test('handles missing token', async () => {
      localStorage.removeItem('token');

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await getApprovalStats();

      expect(fetch).toHaveBeenCalledWith('/api/approval/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer null'
        }
      });
    });
  });
}); 