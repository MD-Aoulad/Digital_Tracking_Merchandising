# 📊 **PHASE 7: REPORTING SYSTEM (Priority: MEDIUM)**

## **7.1 Report Service API**

**Frontend Requirements**: Comprehensive reporting and analytics

**Required Endpoints**: 20 comprehensive endpoints for report management

---

## 🔧 **TECHNICAL REQUIREMENTS**

### **Database Schema Updates**

```sql
-- Report Templates Table
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(100) NOT NULL, -- 'form', 'report', 'dashboard', 'analytics'
    category VARCHAR(100), -- 'attendance', 'performance', 'safety', 'inventory', 'financial'
    template_config JSONB NOT NULL, -- Template configuration and fields
    data_source JSONB, -- Data source configuration
    permissions JSONB, -- Required permissions to access
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES report_templates(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    generated_by UUID NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_snapshot JSONB, -- Snapshot of data at generation time
    report_data JSONB, -- Actual report data
    file_path VARCHAR(500), -- Path to generated file
    file_size INTEGER,
    status VARCHAR(50) DEFAULT 'generated', -- 'generating', 'generated', 'failed'
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Comments Table
CREATE TABLE report_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled Reports Table
CREATE TABLE scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES report_templates(id),
    name VARCHAR(255) NOT NULL,
    schedule_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    schedule_config JSONB NOT NULL, -- Cron-like schedule configuration
    recipients JSONB, -- Array of recipient user IDs
    delivery_method VARCHAR(50) DEFAULT 'email', -- 'email', 'system', 'api'
    is_active BOOLEAN DEFAULT TRUE,
    last_generated_at TIMESTAMP WITH TIME ZONE,
    next_generation_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Analytics Table
CREATE TABLE report_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id),
    template_id UUID REFERENCES report_templates(id),
    user_id UUID,
    action VARCHAR(50), -- 'viewed', 'downloaded', 'shared', 'commented'
    action_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_report_templates_type ON report_templates(template_type);
CREATE INDEX idx_report_templates_category ON report_templates(category);
CREATE INDEX idx_report_templates_active ON report_templates(is_active);
CREATE INDEX idx_reports_template_id ON reports(template_id);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);
CREATE INDEX idx_reports_generated_at ON reports(generated_at);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_scheduled_reports_template_id ON scheduled_reports(template_id);
CREATE INDEX idx_scheduled_reports_active ON scheduled_reports(is_active);
CREATE INDEX idx_report_analytics_report_id ON report_analytics(report_id);
CREATE INDEX idx_report_analytics_user_id ON report_analytics(user_id);
```

### **Error Handling Standards**

```javascript
// Standard error response format
{
  "error": "Error message",
  "details": "Detailed error information",
  "timestamp": "2025-01-19T10:30:00Z",
  "requestId": "unique-request-id"
}

// HTTP Status Codes
200: Success
201: Created
400: Bad Request (validation errors)
401: Unauthorized (missing/invalid token)
403: Forbidden (insufficient permissions)
404: Not Found
500: Internal Server Error
```

### **Authentication Middleware**

```javascript
// JWT Token verification
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Role-based authorization
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

---

## 📋 **API ENDPOINTS IMPLEMENTATION**

### **1. Report Templates Management**

#### **GET /api/reports/templates**
Get all report templates with filtering and pagination.

**Query Parameters**:
- `templateType` (string): Filter by template type
- `category` (string): Filter by category
- `isActive` (boolean): Filter by active status
- `page` (number): Page number for pagination
- `limit` (number): Number of items per page

**Response**:
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Attendance Report Template",
      "description": "Template for attendance reports",
      "template_type": "report",
      "category": "attendance",
      "template_config": {
        "fields": ["employee_id", "date", "hours_worked"],
        "format": "pdf"
      },
      "is_active": true,
      "created_by": "user-uuid",
      "created_at": "2025-01-19T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### **POST /api/reports/templates** (Admin only)
Create a new report template.

**Request Body**:
```json
{
  "name": "Attendance Report Template",
  "description": "Template for generating attendance reports",
  "templateType": "report",
  "category": "attendance",
  "templateConfig": {
    "fields": ["employee_id", "date", "hours_worked", "status"],
    "format": "pdf",
    "layout": "table"
  },
  "dataSource": {
    "type": "database",
    "query": "SELECT * FROM attendance WHERE date >= :start_date"
  },
  "permissions": ["admin", "manager"]
}
```

#### **PUT /api/reports/templates/:id** (Admin only)
Update an existing report template.

#### **DELETE /api/reports/templates/:id** (Admin only)
Delete a report template (only if not used by any reports).

### **2. Report Generation**

#### **GET /api/reports**
Get all generated reports with filtering and pagination.

**Query Parameters**:
- `templateId` (string): Filter by template ID
- `status` (string): Filter by report status
- `generatedBy` (string): Filter by generator
- `startDate` (string): Filter by start date
- `endDate` (string): Filter by end date
- `page` (number): Page number
- `limit` (number): Items per page

#### **POST /api/reports**
Generate a new report.

**Request Body**:
```json
{
  "templateId": "template-uuid",
  "title": "Monthly Performance Report",
  "description": "Performance report for January 2025",
  "reportData": {
    "period": "2025-01",
    "department": "Sales",
    "metrics": {
      "total_tasks": 150,
      "completed_tasks": 142,
      "completion_rate": 94.7
    }
  },
  "expiresAt": "2025-02-19T10:30:00Z"
}
```

#### **GET /api/reports/:id**
Get specific report details.

#### **DELETE /api/reports/:id**
Delete a report (owner or admin only).

#### **GET /api/reports/:id/download**
Download report file.

### **3. Report Comments**

#### **POST /api/reports/:id/comments**
Add a comment to a report.

**Request Body**:
```json
{
  "comment": "This report shows excellent performance trends"
}
```

#### **GET /api/reports/:id/comments**
Get all comments for a report.

### **4. Scheduled Reports**

#### **GET /api/reports/scheduled**
Get all scheduled reports.

#### **POST /api/reports/scheduled** (Admin only)
Create a scheduled report.

**Request Body**:
```json
{
  "templateId": "template-uuid",
  "name": "Weekly Performance Report",
  "scheduleType": "weekly",
  "scheduleConfig": {
    "dayOfWeek": 1,
    "time": "09:00",
    "timezone": "UTC"
  },
  "recipients": ["user-123", "user-456"],
  "deliveryMethod": "email"
}
```

#### **PUT /api/reports/scheduled/:id** (Admin only)
Update a scheduled report.

#### **DELETE /api/reports/scheduled/:id** (Admin only)
Delete a scheduled report.

### **5. Analytics and Reporting**

#### **GET /api/reports/analytics** (Admin only)
Get comprehensive report analytics.

**Query Parameters**:
- `startDate` (string): Start date for analytics
- `endDate` (string): End date for analytics
- `groupBy` (string): Grouping method (day, week, month)

#### **GET /api/reports/analytics/user/:userId**
Get user-specific analytics.

#### **GET /api/reports/analytics/template/:templateId**
Get template-specific analytics.

#### **POST /api/reports/export** (Admin only)
Export reports data.

**Request Body**:
```json
{
  "format": "json",
  "filters": {
    "status": "generated",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }
}
```

#### **GET /api/reports/dashboard**
Get dashboard data for reporting overview.

---

## 🔍 **FEATURE DETAILS**

### **Report Template Types**
- ✅ **Form Templates**: Data collection forms
- ✅ **Report Templates**: Standard report layouts
- ✅ **Dashboard Templates**: Interactive dashboard layouts
- ✅ **Analytics Templates**: Data visualization templates

### **Report Categories**
- ✅ **Attendance**: Time tracking and attendance reports
- ✅ **Performance**: Employee performance metrics
- ✅ **Safety**: Workplace safety reports
- ✅ **Inventory**: Stock and asset reports
- ✅ **Financial**: Budget and expense reports

### **Schedule Types**
- ✅ **Daily**: Daily report generation
- ✅ **Weekly**: Weekly summary reports
- ✅ **Monthly**: Monthly performance reports
- ✅ **Quarterly**: Quarterly business reviews
- ✅ **Yearly**: Annual reports

### **Delivery Methods**
- ✅ **Email**: Email delivery to recipients
- ✅ **System**: Internal system notification
- ✅ **API**: Webhook delivery to external systems

### **Analytics Actions**
- ✅ **Viewed**: Report view tracking
- ✅ **Downloaded**: Download tracking
- ✅ **Shared**: Share action tracking
- ✅ **Commented**: Comment activity tracking

---

## 📊 **REPORTING CAPABILITIES**

### **Data Visualization**
- ✅ **Charts and Graphs**: Bar, line, pie charts
- ✅ **Tables**: Structured data presentation
- ✅ **Maps**: Geographic data visualization
- ✅ **Dashboards**: Interactive performance dashboards

### **Export Formats**
- ✅ **PDF**: Portable document format
- ✅ **Excel**: Spreadsheet format
- ✅ **CSV**: Comma-separated values
- ✅ **JSON**: Structured data format

### **Filtering and Search**
- ✅ **Date Range**: Time-based filtering
- ✅ **Category**: Report type filtering
- ✅ **Status**: Report status filtering
- ✅ **User**: User-specific filtering
- ✅ **Template**: Template-based filtering

### **Pagination and Sorting**
- ✅ **Page-based**: Configurable page size
- ✅ **Sorting**: Multiple sort criteria
- ✅ **Search**: Full-text search capabilities
- ✅ **Filtering**: Advanced filter combinations

---

## 🔒 **SECURITY FEATURES**

### **Authentication**
- ✅ **JWT Tokens**: Secure token-based authentication
- ✅ **Token Validation**: Automatic token verification
- ✅ **Session Management**: Secure session handling

### **Authorization**
- ✅ **Role-based Access**: Admin, manager, user roles
- ✅ **Permission-based**: Granular permission control
- ✅ **Resource Ownership**: User-specific data access

### **Data Protection**
- ✅ **Input Validation**: Comprehensive input sanitization
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **XSS Protection**: Cross-site scripting prevention
- ✅ **CSRF Protection**: Cross-site request forgery protection

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **Database Optimization**
- ✅ **Indexing**: Strategic database indexing
- ✅ **Query Optimization**: Efficient SQL queries
- ✅ **Connection Pooling**: Database connection management
- ✅ **Caching**: Redis-based caching

### **Response Optimization**
- ✅ **Pagination**: Large dataset handling
- ✅ **Compression**: Response compression
- ✅ **Caching**: API response caching
- ✅ **Async Processing**: Background report generation

---

## 🧪 **TESTING AND VERIFICATION**

### **Comprehensive Test Suite**
```bash
# Run report system tests
./scripts/test-report-system.sh
```

### **Test Coverage**
- ✅ **Service Health**: Report Service health checks
- ✅ **Authentication**: Token validation and permissions
- ✅ **Template Management**: CRUD operations and validation
- ✅ **Report Generation**: Report creation and retrieval
- ✅ **Comments System**: Comment functionality
- ✅ **Scheduled Reports**: Automation and scheduling
- ✅ **Analytics**: Data analytics and reporting
- ✅ **Export Functionality**: Data export capabilities
- ✅ **Dashboard**: Dashboard data retrieval
- ✅ **Error Handling**: Validation and error responses
- ✅ **Pagination**: Page-based results
- ✅ **Filtering**: Advanced filtering capabilities
- ✅ **Permission Validation**: Role-based access control

---

## 🎨 **FRONTEND INTEGRATION GUIDE**

### **Report Management Flow**

```javascript
// 1. Get available templates
const templatesResponse = await fetch('/api/reports/templates', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 2. Create report template (admin only)
const templateData = {
  name: 'Custom Report Template',
  templateType: 'report',
  category: 'performance',
  templateConfig: {
    fields: ['employee_id', 'performance_score', 'goals_met'],
    format: 'pdf'
  }
};

const createTemplateResponse = await fetch('/api/reports/templates', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(templateData)
});

// 3. Generate report
const reportData = {
  templateId: templateId,
  title: 'Q1 Performance Report',
  description: 'First quarter performance analysis',
  reportData: {
    quarter: 'Q1',
    year: '2025',
    metrics: {
      average_score: 8.5,
      goals_achieved: 85
    }
  }
};

const generateResponse = await fetch('/api/reports', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(reportData)
});

// 4. Get user's reports
const reportsResponse = await fetch('/api/reports', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 5. Download report
const downloadResponse = await fetch(`/api/reports/${reportId}/download`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 6. Add comment to report
const commentResponse = await fetch(`/api/reports/${reportId}/comments`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    comment: 'Excellent performance this quarter!'
  })
});

// 7. Get dashboard data
const dashboardResponse = await fetch('/api/reports/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 8. Export reports data
const exportResponse = await fetch('/api/reports/export', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    format: 'json',
    filters: {
      status: 'generated',
      startDate: '2025-01-01',
      endDate: '2025-01-31'
    }
  })
});
```

---

## 📊 **REPORTING DASHBOARD**

### **Dashboard Components**
- ✅ **Total Reports**: Count of generated reports
- ✅ **Reports by Status**: Status distribution chart
- ✅ **Reports by Template**: Template usage analytics
- ✅ **Recent Reports**: Latest report activity
- ✅ **Analytics Summary**: User interaction metrics

### **Real-time Updates**
- ✅ **Live Data**: Real-time dashboard updates
- ✅ **Auto-refresh**: Automatic data refresh
- ✅ **Notifications**: Real-time notifications
- ✅ **Status Updates**: Live status monitoring

---

## 🔧 **DEPLOYMENT AND MONITORING**

### **Service Configuration**
```javascript
// Environment variables
PORT=3006
REPORT_DB_URL=postgresql://report_user:report_password@localhost:5432/report_db
JWT_SECRET=your-secret-key
NODE_ENV=production

// Health check endpoint
GET /health
{
  "status": "OK",
  "service": "Report Generation",
  "timestamp": "2025-01-19T10:30:00Z",
  "uptime": 3600,
  "database": "connected"
}
```

### **Monitoring Metrics**
- ✅ **Response Time**: API response time monitoring
- ✅ **Error Rate**: Error rate tracking
- ✅ **Throughput**: Request throughput monitoring
- ✅ **Database Performance**: Database query performance
- ✅ **Memory Usage**: Memory consumption tracking

---

## 🚀 **FUTURE ENHANCEMENTS**

### **Advanced Features**
- ✅ **AI-Powered Insights**: Machine learning analytics
- ✅ **Predictive Reporting**: Future trend predictions
- ✅ **Custom Visualizations**: User-defined charts
- ✅ **Real-time Streaming**: Live data streaming
- ✅ **Mobile Optimization**: Mobile-friendly reports

### **Integration Capabilities**
- ✅ **Third-party APIs**: External data integration
- ✅ **Data Warehouses**: Enterprise data warehouse integration
- ✅ **Business Intelligence**: BI tool integration
- ✅ **Cloud Storage**: Cloud-based report storage
- ✅ **API Webhooks**: Event-driven reporting

---

## 📋 **IMPLEMENTATION STATUS**

### **✅ COMPLETED FEATURES**
- ✅ **Report Service API**: Full implementation with 20 endpoints
- ✅ **Database Schema**: Complete schema with indexes
- ✅ **Authentication**: JWT-based authentication and authorization
- ✅ **Template Management**: CRUD operations for report templates
- ✅ **Report Generation**: Comprehensive report creation and management
- ✅ **Comments System**: Report commenting functionality
- ✅ **Scheduled Reports**: Automated report scheduling
- ✅ **Analytics**: Comprehensive analytics and reporting
- ✅ **Export Functionality**: Data export capabilities
- ✅ **Dashboard**: Real-time dashboard data
- ✅ **Error Handling**: Comprehensive error handling and validation
- ✅ **Testing**: Complete test suite with 13 test categories
- ✅ **Documentation**: Comprehensive API documentation

### **🔧 TECHNICAL IMPLEMENTATION**
- ✅ **Microservice Architecture**: Standalone report service
- ✅ **Database Integration**: PostgreSQL with connection pooling
- ✅ **Security**: JWT authentication and role-based authorization
- ✅ **Performance**: Optimized queries and pagination
- ✅ **Monitoring**: Health checks and error tracking
- ✅ **Testing**: Automated test suite with curl and jq

### **📊 API ENDPOINTS SUMMARY**
- ✅ **Templates**: 4 endpoints (GET, POST, PUT, DELETE)
- ✅ **Reports**: 5 endpoints (GET, POST, GET/:id, DELETE, GET/:id/download)
- ✅ **Comments**: 2 endpoints (POST, GET)
- ✅ **Scheduled Reports**: 4 endpoints (GET, POST, PUT, DELETE)
- ✅ **Analytics**: 3 endpoints (GET, GET/user/:id, GET/template/:id)
- ✅ **Export & Dashboard**: 2 endpoints (POST/export, GET/dashboard)

### **🎯 READY FOR PRODUCTION**
The Report Service API is fully implemented and ready for production deployment with comprehensive testing, documentation, and security features. 