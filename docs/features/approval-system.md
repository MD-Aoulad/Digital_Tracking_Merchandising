# Approval System Feature Documentation

### Service Port Mapping
| Service              | External Port | Internal Port | Protocol | Purpose                  |
|----------------------|--------------|--------------|----------|--------------------------|
| Frontend             | 3000         | 3000         | HTTP     | React Web Application    |
| API Gateway          | 8080         | 3000         | HTTP     | Microservices Router     |
| Auth Service         | 3010         | 3001         | HTTP     | Authentication           |
| User Service         | 3002         | 3002         | HTTP     | User Management          |
| Chat Service         | 3003         | 3003         | HTTP/WS  | Real-time Chat           |
| Attendance Service   | 3007         | 3007         | HTTP     | Attendance Tracking      |
| Todo Service         | 3005         | 3005         | HTTP     | Task Management          |
| Report Service       | 3006         | 3006         | HTTP     | Reporting                |
| Approval Service     | 3011         | 3011         | HTTP     | Approval Workflows       |
| Workplace Service    | 3008         | 3008         | HTTP     | Workplace Management     |
| Notification Service | 3009         | 3009         | HTTP     | Notifications            |
| Mobile App           | 3003         | 3002         | HTTP     | Mobile API Gateway       |
| Grafana              | 3002         | 3000         | HTTP     | Monitoring Dashboard     |
| Prometheus           | 9090         | 9090         | HTTP     | Metrics Collection       |
| Redis                | 6379         | 6379         | TCP      | Caching & Sessions       |
| Nginx (Load Balancer)| 80           | 80           | HTTP     | Reverse Proxy            |

# Approval System Feature

## Overview

The Approval System is a comprehensive workflow management feature that allows organizations to manage approval processes for various types of requests. It includes self-approval settings, delegation capabilities, workflow configuration, and detailed analytics.

## Key Features

### 1. Self-Approval Management
- **Allow Self-Approval**: Administrators can configure whether approvers can approve their own requests
- **Policy Control**: Only administrators can set self-approval permissions
- **Status Indicators**: Clear visual indicators showing whether self-approval is enabled or disabled

### 2. Delegation System
- **Approval Authority Delegation**: Approvers can delegate their approval authority to other managers or leaders
- **Flexible Delegation Scope**: Configurable options for who can delegate and who can receive delegation
- **Delegation Approval Process**: Multiple options for who approves delegation requests
- **Time-Limited Delegations**: Set maximum delegation duration
- **Multiple Delegation Support**: Option to allow multiple active delegations

### 3. Approval Workflows
- **Multi-Step Workflows**: Configure complex approval processes with multiple steps
- **Flexible Approver Types**: Support for various approver types (specific users, roles, groups, managers)
- **Conditional Steps**: Steps can be made conditional based on request criteria
- **Action Configuration**: Customizable actions for each workflow step
- **Auto-Approval Rules**: Configure automatic approval for certain conditions

### 4. Request Management
- **Multiple Request Types**: Support for various approval request types
- **Status Tracking**: Comprehensive status tracking (pending, in review, approved, rejected, etc.)
- **Bulk Operations**: Support for bulk approval/rejection operations
- **Search and Filtering**: Advanced search and filtering capabilities
- **Priority Levels**: Request priority management

### 5. Statistics and Analytics
- **Comprehensive Metrics**: Detailed approval statistics and performance metrics
- **Performance Tracking**: Track approval times and approver performance
- **Trend Analysis**: Approval trends and patterns
- **Activity Monitoring**: Recent approval activity tracking

## User Interface

### Main Approval Page
The main approval page is organized into five main tabs:

1. **Approval Requests**: View and manage approval requests
2. **Approval Settings**: Configure self-approval and delegation policies (admin only)
3. **Delegation Management**: Manage approval authority delegations
4. **Approval Workflows**: Configure approval workflows and templates (admin only)
5. **Approval Statistics**: View approval metrics and reports

### Navigation
- Accessible via the "Approval" menu item in the main navigation
- Available to all authenticated users
- Admin-only features are properly restricted

## API Endpoints

### Statistics
- `GET /api/approvals/stats` - Get approval statistics

### Settings
- `GET /api/approvals/settings` - Get approval settings (admin only)
- `PUT /api/approvals/settings` - Update approval settings (admin only)

### Requests
- `GET /api/approvals/requests` - Get approval requests
- `POST /api/approvals/requests/:id/approve` - Approve a request
- `POST /api/approvals/requests/:id/reject` - Reject a request
- `POST /api/approvals/requests/:id/delegate` - Delegate a request

### Delegations
- `GET /api/approvals/delegations` - Get delegations
- `POST /api/approvals/delegations/request` - Request delegation

### Workflows
- `GET /api/approvals/workflows` - Get approval workflows (admin only)
- `POST /api/approvals/workflows` - Create approval workflow (admin only)

## Configuration Options

### Self-Approval Settings
- **Enable/Disable**: Toggle self-approval functionality
- **Scope**: Apply to all approval workflows
- **Visual Feedback**: Clear indicators of current status

### Delegation Settings
- **Who Can Delegate**: Configure who can delegate approval authority
  - All managers and leaders
  - Specific managers and leaders
  - Group leaders
  - Upper group leaders
  - Top group leaders

- **Who Can Be Delegated**: Configure who can receive delegation
  - All managers and leaders
  - Specific managers and leaders
  - Group leaders
  - Same group leaders
  - Upper group leaders
  - Top group leaders

- **Delegation Approval**: Configure who approves delegation requests
  - Delegate directly approves
  - Upper group leader approves
  - Top group leader approves
  - Administrator approves

- **Additional Settings**:
  - Maximum delegation duration (days)
  - Require approval for delegation
  - Auto-approve for upper leaders
  - Allow multiple delegations
  - Delegation history retention

### Auto-Approval Settings
- **Enable/Disable**: Toggle auto-approval functionality
- **Maximum Amount**: Set maximum amount for auto-approval
- **Maximum Days**: Set maximum days for auto-approval
- **Allowed Types**: Configure which request types are eligible

### Escalation Settings
- **Enable/Disable**: Toggle escalation functionality
- **Default Timeout**: Set default timeout in hours
- **Escalation Levels**: Configure number of escalation levels

### Notification Settings
- **Email Notifications**: Enable/disable email notifications
- **Push Notifications**: Enable/disable push notifications
- **SMS Notifications**: Enable/disable SMS notifications
- **Approval Reminders**: Enable/disable approval reminders
- **Escalation Notifications**: Enable/disable escalation notifications
- **Delegation Notifications**: Enable/disable delegation notifications

## Request Types

The system supports various approval request types:

- **Leave Request**: Vacation, sick leave, personal leave
- **Schedule Change**: Work schedule modifications
- **Overtime Request**: Overtime work requests
- **Attendance Correction**: Attendance record corrections
- **Report Submission**: Report approvals
- **Task Completion**: Task completion approvals
- **Expense Claim**: Expense reimbursement requests
- **Purchase Request**: Purchase order approvals
- **Delegation Request**: Approval authority delegation
- **Group Change**: Group membership changes
- **Role Change**: Role assignment changes
- **Workplace Change**: Workplace assignment changes
- **Custom Request**: Custom approval requests

## Workflow Configuration

### Workflow Steps
Each workflow can have multiple steps with the following configuration:

- **Step Name**: Descriptive name for the step
- **Description**: Detailed description of the step
- **Approver Type**: Type of approver for this step
  - Specific users
  - Users with specific roles
  - Group leaders
  - Direct manager
  - Upper-level manager
  - Group leader
  - Upper group leader
  - Top group leader
  - Administrators
  - Any leader
  - Any manager

- **Step Settings**:
  - Required/Optional
  - Can delegate
  - Time limit (optional)
  - Auto-approve after (optional)

- **Actions**: Available actions for this step
  - Approve
  - Reject
  - Delegate
  - Request information
  - Escalate

## Security and Permissions

### Role-Based Access Control
- **Administrators**: Full access to all approval features
- **Managers/Leaders**: Can approve requests, manage delegations
- **Employees**: Can submit requests, view their own requests

### Authentication
- All endpoints require valid JWT authentication
- Role-based authorization for admin-only features
- Secure token validation

## Data Storage

### In-Memory Storage (Development)
- Approval requests
- Approval settings
- Delegations
- Approval workflows
- Statistics and metrics

### Production Considerations
- Replace with database storage
- Implement data persistence
- Add backup and recovery procedures
- Consider data archival policies

## Integration Points

### Existing Features
- **Leave Management**: Integration with leave request approvals
- **Schedule Management**: Integration with schedule change approvals
- **Report System**: Integration with report submission approvals
- **Attendance System**: Integration with attendance correction approvals

### Future Enhancements
- **Email Integration**: Automated email notifications
- **Mobile App Integration**: Mobile approval capabilities
- **Third-Party Integrations**: HR system integrations
- **Advanced Analytics**: Machine learning insights

## Usage Examples

### Setting Up Self-Approval
1. Navigate to Approval > Approval Settings
2. Enable "Allow Self-Approval" setting
3. Save settings
4. Approvers can now approve their own requests

### Creating a Delegation
1. Navigate to Approval > Delegation Management
2. Click "Request Delegation"
3. Select delegate and set parameters
4. Submit delegation request
5. Wait for approval (if required)

### Configuring a Workflow
1. Navigate to Approval > Approval Workflows
2. Click "Create Workflow"
3. Configure workflow steps and approvers
4. Set workflow settings
5. Save workflow

### Approving Requests
1. Navigate to Approval > Approval Requests
2. View pending requests
3. Select request to approve/reject
4. Add notes (if required)
5. Submit decision

## Troubleshooting

### Common Issues
- **Permission Denied**: Check user role and permissions
- **Request Not Found**: Verify request ID and user access
- **Delegation Failed**: Check delegation settings and approval requirements

### Support
- Check system logs for detailed error information
- Verify API endpoint documentation
- Contact system administrator for assistance

## Future Roadmap

### Planned Features
- **Advanced Workflow Designer**: Visual workflow builder
- **Conditional Logic**: Complex conditional approval paths
- **Integration APIs**: Third-party system integrations
- **Advanced Analytics**: Predictive analytics and insights
- **Mobile Optimization**: Enhanced mobile experience

### Performance Improvements
- **Caching**: Implement request caching
- **Database Optimization**: Optimize database queries
- **Real-time Updates**: WebSocket-based real-time updates
- **Batch Processing**: Efficient batch operations

## Conclusion

The Approval System provides a comprehensive solution for managing approval workflows in workforce management. With its flexible configuration options, robust delegation system, and detailed analytics, it supports organizations of all sizes in streamlining their approval processes while maintaining proper oversight and control. 