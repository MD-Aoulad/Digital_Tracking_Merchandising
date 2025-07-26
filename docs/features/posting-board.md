# Posting Board Feature Documentation

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

## Overview

The Posting Board feature serves as a comprehensive team communication and collaboration platform within the workforce management system. It allows team members to share updates, feedback, and resolve issues through various types of boards tailored to different organizational needs.

## Key Features

### 1. Multiple Board Types
- **General Bulletin Board**: For sharing and exchanging work-related updates
- **Issue & Resolution Board**: For managing the entire process from reporting issues to resolving them

### 2. Board Categories
- **End-of-Day Report Board**: For employees to summarize and report their daily tasks
- **Handover Board**: For sharing notifications and updates during task transitions
- **Voice of the Customer Board**: For gathering feedback from on-site employees
- **Team Social Board**: For sharing praise and feedback among team members
- **Custom Board**: For organization-specific purposes

### 3. Post Management
- Create, edit, and delete posts
- File and image attachments
- Anonymous posting option
- Post pinning for important announcements
- Tag-based organization
- Location-based posting with GPS coordinates

### 4. Interaction Features
- Comments and replies
- Reaction system (like, love, laugh, wow, sad, angry, thumbs-up, thumbs-down)
- Post views tracking
- Mention notifications

### 5. Moderation & Approval
- Post approval workflow
- Auto-moderation with keyword filtering
- Spam protection
- Profanity filtering
- Manual moderation by board moderators

### 6. File Management
- Multiple file type support
- Configurable file size limits
- Image thumbnails
- File type restrictions per board

## Technical Implementation

### TypeScript Types

```typescript
// Main board interface
export interface PostingBoard {
  id: string;
  name: string;
  description: string;
  type: 'general' | 'issue-resolution';
  category: 'end-of-day' | 'handover' | 'voice-of-customer' | 'team-social' | 'custom';
  isActive: boolean;
  isDefault: boolean;
  allowFileUploads: boolean;
  allowedFileTypes: string[];
  maxFileSize: number;
  requireApproval: boolean;
  allowComments: boolean;
  allowReactions: boolean;
  assignedRoles: string[];
  assignedEmployees?: string[];
  moderators: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Post interface
export interface PostingBoardPost {
  id: string;
  boardId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  type: 'general' | 'issue' | 'resolution';
  status: 'draft' | 'published' | 'pending-approval' | 'rejected' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: PostingBoardAttachment[];
  tags: string[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  isPinned: boolean;
  isAnonymous: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}
```

### Components Structure

```
src/components/PostingBoard/
├── PostingBoardPage.tsx          # Main page with tabs
├── PostingBoardSettings.tsx      # Admin settings configuration
└── BoardManagement.tsx           # Board creation/editing
```

### Routes

- `/posting-board` - Main posting board page
- `/posting-board/settings` - Admin settings (accessible via tabs)

## User Guide

### For Administrators

#### 1. Enabling the Feature
1. Navigate to Dashboard > Feature settings
2. Select "Posting Board"
3. Set the feature to "Use"
4. A default posting board is automatically created

#### 2. Creating New Boards
1. Go to Menu > [Posting Board]
2. Click the [+] button in the top-left corner
3. Fill in board details:
   - Name and description
   - Board type (General or Issue & Resolution)
   - Category selection
   - File upload settings
   - Access control settings
4. Save the board

#### 3. Configuring Board Settings
1. Select the desired board
2. Navigate to the [Settings] tab
3. Configure:
   - Approval requirements
   - File upload permissions
   - Comment and reaction settings
   - Access control
   - Moderation settings

#### 4. Global Settings Configuration
1. Access the Settings tab in the main posting board page
2. Configure global settings:
   - Feature enable/disable
   - Anonymous posting
   - File upload limits
   - Notification preferences
   - Moderation settings

### For Users

#### 1. Creating Posts
1. Navigate to the desired board
2. Click "Create Post" button
3. Fill in:
   - Post title
   - Content
   - Tags (optional)
   - Attachments (if allowed)
   - Location (optional)
4. Choose posting options:
   - Anonymous posting (if enabled)
   - Post type (for issue-resolution boards)
   - Priority level
5. Submit for approval (if required) or publish directly

#### 2. Interacting with Posts
- **Comments**: Add comments and replies to posts
- **Reactions**: Use reaction buttons to express emotions
- **Views**: Posts automatically track view counts
- **Tags**: Use tags to categorize and search posts

#### 3. Issue Resolution (Issue & Resolution Boards)
1. **Report Issue**: Create a post with type "issue"
2. **Track Progress**: Monitor issue status updates
3. **Provide Resolution**: Create resolution posts
4. **Close Issues**: Mark issues as resolved

## Configuration Options

### Board-Level Settings
- **File Uploads**: Enable/disable and configure limits
- **Approval Workflow**: Require approval for all posts
- **Comments**: Enable/disable commenting
- **Reactions**: Enable/disable reaction system
- **Access Control**: Role-based permissions
- **Moderation**: Auto-moderation and keyword filtering

### Global Settings
- **Feature Toggle**: Enable/disable entire feature
- **Anonymous Posts**: Allow anonymous posting
- **Notification Settings**: Email, push, SMS notifications
- **Moderation**: Global spam and profanity protection
- **Usage Limits**: Posts per day, comments per post
- **Auto-archiving**: Automatic post archiving after specified days

## Security & Permissions

### Role-Based Access
- **Administrators**: Full access to all features and settings
- **Editors**: Can create, edit, and moderate posts
- **Viewers**: Can view and interact with posts (comments, reactions)

### Data Protection
- Anonymous posting option for sensitive feedback
- Moderation tools to prevent inappropriate content
- File upload restrictions and virus scanning
- Audit trails for all actions

## Integration Points

### With Other Features
- **Attendance**: Post daily reports and updates
- **Schedule**: Share schedule changes and handovers
- **Leave Management**: Announce leave approvals and coverage
- **Journey Plans**: Share location-based updates
- **Reports**: Post report summaries and findings

### Notifications
- Email notifications for new posts and comments
- Push notifications for mobile users
- SMS notifications for urgent announcements
- Mention notifications for tagged users

## Best Practices

### For Administrators
1. **Board Organization**: Create specific boards for different purposes
2. **Moderation**: Set up appropriate approval workflows
3. **File Management**: Configure reasonable file size limits
4. **Access Control**: Assign appropriate roles and permissions
5. **Monitoring**: Regularly review board activity and engagement

### For Users
1. **Clear Communication**: Use descriptive titles and clear content
2. **Tagging**: Use relevant tags for better organization
3. **File Attachments**: Only attach necessary files within size limits
4. **Engagement**: Participate in discussions and provide feedback
5. **Privacy**: Use anonymous posting when appropriate

## Troubleshooting

### Common Issues
1. **Post Not Appearing**: Check approval status and board permissions
2. **File Upload Failed**: Verify file type and size restrictions
3. **Comments Not Working**: Check board comment settings
4. **Access Denied**: Verify user role and board permissions

### Support
- Check board settings and permissions
- Verify user role assignments
- Review system logs for errors
- Contact system administrator for technical issues

## Future Enhancements

### Planned Features
- **Advanced Search**: Full-text search with filters
- **Post Templates**: Predefined templates for common posts
- **Analytics Dashboard**: Engagement metrics and insights
- **Mobile App**: Native mobile application
- **API Integration**: Third-party system integration
- **Advanced Moderation**: AI-powered content moderation
- **Workflow Automation**: Automated approval and notification workflows

### Technical Improvements
- **Performance Optimization**: Faster loading and search
- **Real-time Updates**: WebSocket-based live updates
- **Offline Support**: Offline posting and synchronization
- **Advanced Security**: Enhanced encryption and access controls
- **Scalability**: Support for large organizations and high traffic

## API Reference

### Endpoints (Future Implementation)
```
GET    /api/posting-boards          # List all boards
POST   /api/posting-boards          # Create new board
GET    /api/posting-boards/:id      # Get board details
PUT    /api/posting-boards/:id      # Update board
DELETE /api/posting-boards/:id      # Delete board

GET    /api/posting-boards/:id/posts    # List board posts
POST   /api/posting-boards/:id/posts    # Create new post
GET    /api/posts/:id                   # Get post details
PUT    /api/posts/:id                   # Update post
DELETE /api/posts/:id                   # Delete post

POST   /api/posts/:id/comments      # Add comment
POST   /api/posts/:id/reactions     # Add reaction
GET    /api/posting-board/settings  # Get global settings
PUT    /api/posting-board/settings  # Update global settings
```

## Version History

### v1.0.0 (Current)
- Initial implementation
- Basic board management
- Post creation and interaction
- File upload support
- Moderation features
- Admin settings configuration

---

*This documentation is maintained by the Workforce Management Team. For questions or suggestions, please contact the development team.* 