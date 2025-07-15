# PROFESSIONAL DATABASE & UI INTEGRATION DOCUMENTATION

## 1. Database Design (PostgreSQL Example)

### users
| Field        | Type           | Notes                        |
|--------------|----------------|------------------------------|
| id           | SERIAL PRIMARY | PK, auto-increment           |
| email        | VARCHAR(255)   | Unique, indexed              |
| password     | VARCHAR(255)   | bcrypt hash                  |
| name         | VARCHAR(255)   |                              |
| role         | VARCHAR(50)    | admin, leader, employee      |
| department   | VARCHAR(100)   |                              |
| status       | VARCHAR(50)    | active, inactive, etc.       |
| created_at   | TIMESTAMP      | default NOW()                |

### todos
| Field         | Type           | Notes                        |
|---------------|----------------|------------------------------|
| id            | SERIAL PRIMARY | PK, auto-increment           |
| title         | VARCHAR(255)   |                              |
| description   | TEXT           |                              |
| priority      | VARCHAR(20)    | low, medium, high, urgent    |
| completed     | BOOLEAN        | default FALSE                |
| created_at    | TIMESTAMP      | default NOW()                |
| completed_at  | TIMESTAMP      | nullable                     |
| assigned_to   | INTEGER        | FK → users(id)               |
| assigned_by   | INTEGER        | FK → users(id)               |
| category      | VARCHAR(100)   |                              |
| start_date    | DATE           |                              |
| end_date      | DATE           |                              |
| repeat        | VARCHAR(100)   |                              |
| status        | VARCHAR(50)    | pending, in-progress, etc.   |

---

## 2. Backend API Design (Express + pg)
- All CRUD operations use SQL queries.
- No in-memory arrays.
- Endpoints return JSON and proper HTTP status codes.
- Passwords are always hashed with bcrypt.

**Example Endpoints:**
- POST /api/auth/register
- POST /api/auth/login
- GET /api/users
- PUT /api/users/:id
- DELETE /api/users/:id
- GET /api/todos
- POST /api/todos
- PUT /api/todos/:id
- DELETE /api/todos/:id

---

## 3. Frontend (React) Integration
- All UI actions call the backend API.
- UI state is always synced with the database via API responses.
- Use React Query or SWR for data fetching and cache invalidation.
- Show loading, error, and success states in the UI.

**Example Flow:**
- User clicks “Add Todo” → Form submits to POST /api/todos → On success, UI updates with new todo from API response.
- User edits a user → PUT /api/users/:id → UI updates with new user data from API.

---

## 4. Change Management & Maintainability
- Single Source of Truth: All persistent data lives in the database.
- API-Driven UI: UI never assumes state; always fetches from API after changes.
- Schema Migrations: Use tools like knex, sequelize, or raw SQL for DB migrations.
- Documentation: Keep API and DB schema docs up to date.

---

## 5. Professional Documentation Example

### Database Schema
```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50),
  department VARCHAR(100),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- todos table
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  assigned_to INTEGER REFERENCES users(id),
  assigned_by INTEGER REFERENCES users(id),
  category VARCHAR(100),
  start_date DATE,
  end_date DATE,
  repeat VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending'
);
```

### API Contract Example
#### Create Todo
- POST /api/todos
- Request Body:
```json
{
  "title": "New Task",
  "description": "Details...",
  "priority": "high",
  "assigned_to": 2,
  "assigned_by": 1,
  "category": "IT",
  "start_date": "2024-07-01",
  "end_date": "2024-07-02"
}
```
- Response:
```json
{
  "todo": {
    "id": 1,
    "title": "New Task",
    ...
  }
}
```

### Frontend Integration Example (React + Fetch)
```js
// Create Todo
async function createTodo(todoData) {
  const res = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todoData)
  });
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}
```

### Change Management
- To add a new field:
  1. Update the DB schema (migration).
  2. Update backend API to handle the new field.
  3. Update frontend forms and API calls.
  4. Test end-to-end.
- To change UI logic:
  - Always ensure the UI calls the API and updates state from the API response.

---

## 6. Execution Plan
1. Migrate all backend endpoints to use the database.
2. Ensure all frontend actions call the backend API and update UI from API responses.
3. Document all endpoints and DB schema.
4. Test all CRUD operations from the UI and verify DB updates.
5. Automate DB migrations and seed scripts for sample data.

---

## 7. Ongoing Best Practices
- Use version control for both code and DB migrations.
- Keep API and DB schema docs up to date.
- Use environment variables for DB connection strings.
- Never store plain text passwords.
- Use error boundaries and loading states in the UI. 