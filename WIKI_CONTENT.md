# FlowForge Wiki Content
## Copy each section below into separate GitHub wiki pages

---

# PAGE 1: Home

## ISYS 54203 Group Project - FlowForge Project Management Tool

**Last Updated:** November 17, 2025
**Project Status:** Active Development
**Current Version:** 1.0 (Beta)
**Development Branch:** SavedSearchFeature

---

## Vision

FlowForge is a comprehensive project management platform designed to empower teams to manage any business process through customizable forms, reusable workflows, and flexible project structures. Built with modern web technologies, FlowForge adapts to your business needs rather than forcing you into rigid templates.

---

## Core Features

### 1. Custom Form Builder
Create dynamic, reusable forms with custom attributes tailored to your business processes.

**Features:**
- Visual form builder with drag-and-drop attribute selection
- Reusable attribute library (text, number, date, status, dropdown, etc.)
- Form templates that can be attached to multiple projects
- Form submission tracking and history
- Field validation and required field support

**Status:** ✅ Fully Implemented

---

### 2. Visual Workflow Designer
Design complex approval and routing workflows with a drag-and-drop canvas.

**Features:**
- Node-based workflow editor with visual connections
- Multiple step types:
  - Approval steps
  - Review steps
  - Signature steps
  - Notification steps
  - Assignment steps
  - Delay/timer steps
  - Conditional branching
- Workflow templates that can be reused across projects
- Workflow execution tracking

**Status:** ✅ Fully Implemented

---

### 3. Project Management
Flexible project creation and management with team collaboration.

**Features:**
- Create projects with custom metadata (name, description, status, due date, team size)
- Project status tracking (Planning, Active, On-Hold, Completed)
- Assign multiple users to projects
- Attach forms and workflows to projects
- Project ownership and permissions
- Project dashboard with statistics

**Status:** ✅ Fully Implemented

---

### 4. Advanced Search & Saved Searches
Create, save, and execute complex searches with smart filters.

**Features:**
- Visual search builder with multiple filter types
- Smart values: @me, @my-team, @today, @this-week, @this-month, @this-year
- Comprehensive operators: contains, equals, starts with, ends with, is empty, etc.
- Saved search library with visibility controls (Private, Shared, Team, Public)
- Dynamic field selection for customized result views
- Delete saved searches with confirmation
- Search result tables with sortable columns

**Recent Updates (November 2025):**
- ✅ Smart value processing for dynamic date ranges
- ✅ Field mapping for user lookups (created_by → username)
- ✅ Search visibility permissions
- ✅ Delete functionality with confirmation
- ✅ Alphabetical sorting of saved searches
- ✅ Table-based results with custom column visibility

**Status:** ✅ Mostly Complete (see [[Saved Search Feature]] for pending enhancements)

---

### 5. User Management & Authentication
Comprehensive user administration with role-based access control.

**Features:**
- Session-based authentication with secure password hashing
- Three user roles: Admin, User, Viewer
- Granular permission system
- Admin panel for user creation and management
- Account activation/deactivation
- Password reset functionality
- Audit logging for admin actions

**Status:** ✅ Fully Implemented

---

### 6. Dashboard & Analytics
Centralized overview of projects, tasks, and workflows.

**Features:**
- Project statistics and counts
- Recent projects display
- Task management view
- Quick access to saved searches
- Status-based filtering

**Status:** ✅ Implemented (enhancements planned)

---

## Technical Stack

### Frontend
- **Framework:** React 18.3.1 with TypeScript 5.6.3
- **Build Tool:** Vite 5.4.20
- **Routing:** Wouter 3.3.5
- **State Management:** TanStack React Query 5.60.5
- **Forms:** React Hook Form 7.55.0 + Zod 3.24.2
- **UI Library:** Shadcn/UI (Radix UI primitives)
- **Styling:** Tailwind CSS 3.4.17
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 22+ with Express 4.21.2
- **Database:** Neon Serverless PostgreSQL
- **ORM:** Drizzle ORM 0.39.1
- **Authentication:** Passport + express-session
- **Validation:** Zod 3.24.2

### Infrastructure
- **Hosting:** Replit
- **Database:** Neon (Serverless PostgreSQL)
- **Development:** Hot Module Reloading (Vite + tsx)

See [[Architecture]] for detailed technical architecture.

---

## Key Definitions

### Form
A reusable template containing custom attributes (fields) that can be attached to projects. Forms collect structured data through submissions.

### Project
A container for managing business processes, containing forms, workflows, assigned users, and metadata like status and due dates.

### Task
Work items within projects that can be assigned to users and tracked through completion. *(Planned feature)*

### Workflow
A visual, node-based process definition that automates routing, approvals, and actions within projects.

### Attribute
A reusable field definition (text, number, date, status, etc.) that can be added to forms. Attributes are stored in a central library.

### Saved Search
A stored search query with filters and field visibility settings that can be executed on-demand to find projects, tasks, or files matching specific criteria.

### Smart Values
Dynamic placeholders that resolve at search execution time:
- **@me** - Current user
- **@my-team** - Current user's team members
- **@today** - Current date (00:00 to 23:59)
- **@this-week** - Current week (Sunday to Saturday)
- **@this-month** - Current month (1st to last day)
- **@this-year** - Current year (Jan 1 to Dec 31)

---

## Quick Links

- [[Getting Started]] - Setup and installation guide
- [[Architecture]] - System architecture and design
- [[Database Schema]] - Database structure and relationships
- [[API Documentation]] - REST API endpoints
- [[Saved Search Feature]] - Advanced search capabilities
- [[User Guide]] - End-user documentation
- [[Development Guide]] - Developer contribution guide

---

## Project Team

**Repository:** [sarahlawlis/ISYS-54203-team-project](https://github.com/sarahlawlis/ISYS-54203-team-project)
**Course:** ISYS 54203
**Development Status:** Active
**License:** Academic Project
**Members::** Thomas Burns, Sarah Lawlis, Avery Thomas

---

## Recent Activity

**November 15, 2025:**
- Implemented search visibility permissions (Private, Shared, Team, Public)
- Added required field validation for search creation
- Improved UX with alphabetical sorting and descriptions

**November 14, 2025:**
- Implemented table-based search results with custom field visibility
- Added description field to saved searches
- Fixed date field mapping for search execution
- Consolidated smart value UI

**November 13, 2025:**
- Implemented delete functionality for saved searches
- Added smart value processing (@me, @today, etc.)
- Enhanced backend filtering with date range support

See [AverysLog.md](https://github.com/sarahlawlis/ISYS-54203-team-project/blob/main/AverysLog.md) for detailed development history.

---

# PAGE 2: Architecture

## System Architecture

### Overview

FlowForge follows a modern **full-stack monorepo architecture** with clear separation between client, server, and shared code. The application uses a traditional client-server model with RESTful APIs.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Application (Vite)                              │ │
│  │  ├── Pages (Routes)                                    │ │
│  │  ├── Components (UI)                                   │ │
│  │  ├── Hooks (React Query)                               │ │
│  │  └── Lib (Auth, Permissions, Utils)                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                         SERVER                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express Application (Node.js)                         │ │
│  │  ├── Routes (API Endpoints)                            │ │
│  │  ├── Auth (Passport, Sessions)                         │ │
│  │  ├── Permissions (RBAC)                                │ │
│  │  └── Storage (Database Abstraction)                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (Neon PostgreSQL)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Drizzle ORM                                           │ │
│  │  ├── Tables (users, projects, forms, workflows, etc.)  │ │
│  │  ├── Migrations                                        │ │
│  │  └── Schemas (Zod validation)                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
ISYS-54203-team-project-2/
├── client/                    # Frontend React application
│   └── src/
│       ├── pages/            # Route components
│       ├── components/       # Reusable UI components
│       │   ├── ui/          # Shadcn/UI primitives
│       │   └── *.tsx        # Feature components
│       ├── hooks/           # Custom React hooks
│       ├── lib/             # Utilities and helpers
│       ├── App.tsx          # Main app component
│       ├── Router.tsx       # Route definitions
│       └── main.tsx         # Entry point
├── server/                   # Backend Express application
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API route definitions
│   ├── auth.ts              # Authentication logic
│   ├── permissions.ts       # RBAC system
│   ├── storage.ts           # Database abstraction
│   ├── db.ts                # Drizzle connection
│   ├── vite.ts              # Dev server integration
│   └── types.ts             # TypeScript extensions
├── shared/                   # Shared between client/server
│   └── schema.ts            # Database schema + Zod types
├── migrations/              # Database migrations
├── scripts/                 # Utility scripts
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
├── drizzle.config.ts        # Drizzle ORM configuration
└── tailwind.config.ts       # Tailwind CSS configuration
```

---

## Frontend Architecture

### Technology Choices

- **React 18.3.1:** Component-based UI with hooks
- **TypeScript:** Type safety across the application
- **Vite:** Fast build tool with HMR
- **Wouter:** Lightweight routing (2KB alternative to React Router)
- **TanStack React Query:** Server state management with caching
- **React Hook Form + Zod:** Form handling with validation
- **Shadcn/UI:** Accessible, customizable component library
- **Tailwind CSS:** Utility-first styling

### State Management Strategy

1. **Server State:** TanStack React Query
   - API data fetching and caching
   - Automatic refetching and invalidation
   - Optimistic updates

2. **Form State:** React Hook Form
   - Form validation with Zod schemas
   - Error handling
   - Submission state

3. **Local UI State:** useState/useReducer
   - Component-level state
   - View preferences (card/table)
   - Modal visibility

### Routing

Protected routes with authentication checks:
```typescript
// All routes require authentication except /login
<Route path="/" component={Dashboard} />
<Route path="/projects" component={Projects} />
<Route path="/forms" component={Forms} />
// etc.
```

---

## Backend Architecture

### Technology Choices

- **Express 4.21.2:** Web framework
- **Passport + express-session:** Authentication
- **Drizzle ORM:** Type-safe SQL queries
- **Zod:** Runtime validation
- **bcrypt:** Password hashing

### API Design

RESTful API with the following conventions:

```
GET    /api/resource      # List all
GET    /api/resource/:id  # Get one
POST   /api/resource      # Create
PUT    /api/resource/:id  # Update
DELETE /api/resource/:id  # Delete
```

### Middleware Stack

1. **CORS:** Cross-origin resource sharing
2. **express.json():** JSON body parsing
3. **express-session:** Session management
4. **Passport:** Authentication
5. **requireAuth:** Route protection
6. **requireAdmin:** Admin-only routes
7. **requirePermission:** Granular permissions

### Database Abstraction

The `IStorage` interface provides a clean abstraction:

```typescript
interface IStorage {
  // Users
  getUsers(): Promise<User[]>
  getUser(id: string): Promise<User | undefined>
  createUser(user: InsertUser): Promise<User>

  // Projects
  getProjects(): Promise<Project[]>
  getProject(id: string): Promise<Project | undefined>

  // etc.
}
```

This allows for:
- Easy testing with mock implementations
- Database swapping if needed
- Clear API boundaries

---

## Database Architecture

### ORM Choice: Drizzle

**Why Drizzle:**
- Type-safe SQL queries
- Automatic TypeScript type inference
- Minimal runtime overhead
- SQL-like syntax (easier migration from raw SQL)
- Excellent PostgreSQL support

### Schema Design

Tables use UUID primary keys and include audit fields:

```typescript
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Migration Strategy

- Database migrations stored in `migrations/` directory
- Applied using Drizzle Kit
- Versioned and tracked in git
- Support for up/down migrations

See [[Database Schema]] for detailed schema documentation.

---

## Authentication & Authorization

### Authentication Flow

1. User submits credentials to `/api/auth/login`
2. Server validates password using bcrypt
3. Passport creates session and stores userId
4. Session cookie sent to client
5. Subsequent requests include session cookie
6. Server validates session on each request

### Session Management

- **Storage:** PostgreSQL (connect-pg-simple)
- **Duration:** 1 week
- **Security:** HTTP-only cookies, secure flag in production

### Authorization (RBAC)

Three roles with granular permissions:

**Admin:**
- All permissions

**User:**
- `create_projects`
- `edit_own_projects`
- `delete_own_projects`
- `view_projects`
- `view_reports`

**Viewer:**
- `view_projects`
- `view_reports`

Permissions checked via middleware:
```typescript
router.get('/api/projects', requireAuth, requirePermission('view_projects'), ...)
```

---

## Data Flow Examples

### Creating a Project

```
1. User fills out form in CreateProjectDialog component
2. Form validation with Zod schema
3. React Hook Form handles submission
4. POST /api/projects with project data
5. Server validates request body (Zod)
6. Server checks permissions (requireAuth + create_projects)
7. Server creates project via storage.createProject()
8. Drizzle inserts row into projects table
9. Server returns created project
10. React Query invalidates projects cache
11. UI updates automatically
```

### Executing a Saved Search

```
1. User clicks on saved search card
2. Navigate to /search/results/:id
3. GET /api/search/execute/:id
4. Server loads saved search from database
5. Server resolves smart values (@me → userId, @today → date range)
6. Server applies field mapping (created_by → ownerId)
7. Server filters projects in memory
8. Server builds metadata with visible fields only
9. Server returns filtered results
10. Frontend displays results in sortable table
```

---

## Performance Considerations

### Frontend Optimization

- **Code Splitting:** Route-based code splitting with Vite
- **React Query Caching:** Reduces redundant API calls
- **Optimistic Updates:** Immediate UI feedback
- **Lazy Loading:** Images and heavy components

### Backend Optimization

- **Database Indexing:** UUID primary keys indexed
- **Connection Pooling:** Neon serverless handles automatically
- **Parallel Processing:** Promise.all() for concurrent operations
- **In-Memory Filtering:** For searches (trade-off for flexibility)

### Known Limitations

1. **Search filtering happens in-memory** - not optimized for large datasets (>10,000 projects)
2. **No pagination** - all results returned at once
3. **User lookups not cached** - potential optimization opportunity

---

## Deployment Architecture

### Development Environment

- **Local:** `npm run dev` starts both client (Vite) and server (tsx)
- **Port:** 5000 (server serves Vite app in dev mode)
- **Hot Reload:** Vite HMR for client, tsx watch for server

### Production Environment (Replit)

- **Build:** `npm run build` creates production bundles
- **Start:** `npm start` serves built client + API server
- **Database:** Neon Serverless PostgreSQL (cloud-hosted)
- **Port:** 5000

---

## Security Architecture

### Security Measures

1. **Password Security:**
   - bcrypt hashing (10 salt rounds)
   - No plain-text passwords stored

2. **Session Security:**
   - HTTP-only cookies
   - Secure flag in production
   - 1-week expiration

3. **Input Validation:**
   - Zod schemas on all API endpoints
   - XSS protection via React
   - SQL injection prevention via Drizzle ORM

4. **Authorization:**
   - Role-based access control
   - Permission checks on all routes
   - Ownership validation for modifications

5. **Audit Logging:**
   - Admin actions logged to audit_logs table
   - Tracks user creation, role changes, etc.

---

## Future Architecture Considerations

### Scalability Improvements

1. **Database Query Optimization:**
   - Move search filtering to SQL WHERE clauses
   - Add database indexes for common queries
   - Implement pagination

2. **Caching Layer:**
   - Redis for session storage
   - Cache user lookups
   - Cache search results with TTL

3. **Microservices (if needed):**
   - Separate search service
   - Workflow execution service
   - File storage service

### Feature Enhancements

1. **Real-time Updates:**
   - WebSocket support for live collaboration
   - Notification system

2. **File Storage:**
   - S3 integration for file uploads
   - Document management

3. **Teams Feature:**
   - Team-based permissions
   - @my-team smart value implementation

---

# PAGE 3: Database Schema

## Database Schema Documentation

**Database:** Neon Serverless PostgreSQL
**ORM:** Drizzle ORM 0.39.1
**Schema Version:** 1.0
**Last Updated:** November 17, 2025

---

## Schema Overview

The FlowForge database uses a relational schema with the following table categories:

1. **Core Entities:** users, projects, forms, workflows, attributes
2. **Junction Tables:** projectUsers, projectForms, projectWorkflows
3. **Data Storage:** formSubmissions, savedSearches
4. **Audit:** auditLogs

---

## Entity Relationship Diagram

```
┌──────────────┐
│    users     │
└──────┬───────┘
       │ 1
       │
       │ N
┌──────▼───────┐      N ┌───────────────┐ N      ┌──────────┐
│   projects   ├────────┤ projectUsers  ├────────┤  users   │
└──────┬───────┘        └───────────────┘        └──────────┘
       │
       │ N
       ├──────────┬───────────────┬─────────────┐
       │          │               │             │
┌──────▼──────┐ ┌▼─────────────┐ ┌▼───────────┐ ┌▼──────────────┐
│projectForms │ │projectWorkflows│savedSearches││formSubmissions│
└──────┬──────┘ └┬─────────────┘ └────────────┘ └┬──────────────┘
       │         │                                 │
       │ N       │ N                               │ N
┌──────▼──────┐ ┌▼───────────┐                   ┌▼──────┐
│    forms    │ │  workflows │                   │ forms │
└─────────────┘ └────────────┘                   └───────┘
```

---

## Table Definitions

### users

Stores user accounts and authentication information.

```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // bcrypt hashed
  role: text('role').notNull(), // 'admin' | 'user' | 'viewer'
  isActive: text('is_active').notNull().default('true'), // 'true' | 'false'
  lastLogin: timestamp('last_login'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Indexes:**
- Primary key on `id`
- Unique index on `username`

**Relationships:**
- `createdBy` → `users.id` (self-reference for audit trail)
- One-to-many with `projects` (as owner)
- Many-to-many with `projects` via `projectUsers` (as assignee)

**Notes:**
- Passwords hashed with bcrypt (10 salt rounds)
- `isActive` stored as text for compatibility
- `role` determines permissions (see [[Architecture]])

---

### projects

Core project entities with metadata and status tracking.

```typescript
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull(), // 'planning' | 'active' | 'on-hold' | 'completed'
  dueDate: timestamp('due_date'),
  teamSize: integer('team_size'),
  ownerId: uuid('owner_id').notNull(), // references users.id
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**Indexes:**
- Primary key on `id`
- Foreign key on `ownerId` → `users.id`

**Relationships:**
- Many-to-one with `users` (owner)
- Many-to-many with `users` via `projectUsers` (assigned users)
- Many-to-many with `forms` via `projectForms`
- Many-to-many with `workflows` via `projectWorkflows`
- One-to-many with `formSubmissions`
- One-to-many with `savedSearches` (via createdBy filter)

**Status Values:**
- `planning` - Project in planning phase
- `active` - Project actively being worked on
- `on-hold` - Project temporarily paused
- `completed` - Project finished

---

### forms

Reusable form templates with custom attributes.

```typescript
export const forms = pgTable('forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull().default('project'), // Future: 'task', 'file'
  attributes: text('attributes').notNull(), // JSON array of attribute IDs
  attributeCount: integer('attribute_count').notNull().default(0),
  usageCount: integer('usage_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Indexes:**
- Primary key on `id`

**Relationships:**
- Many-to-many with `projects` via `projectForms`
- One-to-many with `formSubmissions`
- References `attributes` via JSON array (soft relationship)

**Notes:**
- `attributes` stores JSON array of attribute IDs: `["attr-1", "attr-2"]`
- `attributeCount` cached count for performance
- `usageCount` tracks how many projects use this form

---

### workflows

Visual workflow definitions with nodes and connections.

```typescript
export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  nodes: text('nodes').notNull(), // JSON array of workflow nodes
  edges: text('edges').notNull(), // JSON array of connections
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Indexes:**
- Primary key on `id`

**Relationships:**
- Many-to-many with `projects` via `projectWorkflows`

**Notes:**
- `nodes` stores JSON array of workflow steps with types (approval, review, etc.)
- `edges` stores JSON array of connections between nodes
- Visual workflow canvas data persisted as JSON

**Example Node Structure:**
```json
{
  "id": "node-1",
  "type": "approval",
  "data": { "label": "Manager Approval", "assignedTo": "user-id" },
  "position": { "x": 100, "y": 200 }
}
```

---

### attributes

Reusable form field definitions.

```typescript
export const attributes = pgTable('attributes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'text' | 'number' | 'date' | 'status' | etc.
  description: text('description'),
  icon: text('icon'), // Lucide icon name
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Indexes:**
- Primary key on `id`

**Relationships:**
- Referenced by `forms.attributes` (JSON array)

**Supported Types:**
- `text` - Single-line text input
- `number` - Numeric input
- `date` - Date picker
- `status` - Status dropdown
- `dropdown` - Custom dropdown
- `checkbox` - Boolean checkbox
- `textarea` - Multi-line text

---

### projectUsers

Junction table linking users to projects (many-to-many).

```typescript
export const projectUsers = pgTable('project_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(), // references projects.id
  userId: uuid('user_id').notNull(), // references users.id
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
});
```

**Indexes:**
- Primary key on `id`
- Composite unique index on `(projectId, userId)`
- Foreign keys on `projectId` and `userId`

**Relationships:**
- Many-to-one with `projects`
- Many-to-one with `users`

---

### projectForms

Junction table linking forms to projects.

```typescript
export const projectForms = pgTable('project_forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  formId: uuid('form_id').notNull(),
  assignedUserId: uuid('assigned_user_id'), // Optional: user responsible for form
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
});
```

**Indexes:**
- Primary key on `id`
- Foreign keys on `projectId`, `formId`, `assignedUserId`

**Relationships:**
- Many-to-one with `projects`
- Many-to-one with `forms`
- Many-to-one with `users` (optional assignee)

---

### projectWorkflows

Junction table linking workflows to projects with execution status.

```typescript
export const projectWorkflows = pgTable('project_workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  workflowId: uuid('workflow_id').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'running' | 'completed'
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
});
```

**Indexes:**
- Primary key on `id`
- Foreign keys on `projectId`, `workflowId`

**Relationships:**
- Many-to-one with `projects`
- Many-to-one with `workflows`

**Status Values:**
- `pending` - Workflow assigned but not started
- `running` - Workflow currently executing
- `completed` - Workflow finished

---

### formSubmissions

Stores form data submissions.

```typescript
export const formSubmissions = pgTable('form_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').notNull(),
  projectId: uuid('project_id'),
  projectWorkflowId: uuid('project_workflow_id'),
  submittedBy: uuid('submitted_by').notNull(),
  data: text('data').notNull(), // JSON object with form field values
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});
```

**Indexes:**
- Primary key on `id`
- Foreign keys on `formId`, `projectId`, `projectWorkflowId`, `submittedBy`

**Relationships:**
- Many-to-one with `forms`
- Many-to-one with `projects` (optional)
- Many-to-one with `projectWorkflows` (optional)
- Many-to-one with `users` (submitter)

**Notes:**
- `data` stores JSON object with form field values
- Can be linked to project, workflow, or standalone

**Example Data Structure:**
```json
{
  "attr-1": "Project Alpha",
  "attr-2": "High Priority",
  "attr-3": "2025-12-31"
}
```

---

### savedSearches

Stores saved search queries with filters and visibility.

```typescript
export const savedSearches = pgTable('saved_searches', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  visibility: text('visibility').notNull(), // 'private' | 'shared' | 'team' | 'public'
  createdBy: uuid('created_by').notNull(),
  filters: text('filters').notNull(), // JSON object with search filters
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**Indexes:**
- Primary key on `id`
- Foreign key on `createdBy` → `users.id`

**Relationships:**
- Many-to-one with `users` (creator)

**Visibility Levels:**
- `private` - Only creator can view
- `shared` - Creator chooses who can view (future enhancement)
- `team` - All team members (users and admins) can view
- `public` - Everyone can view

**Filter Structure:**
```json
{
  "entity": "projects",
  "projectFilters": [
    {
      "field": "created_by",
      "operator": "is",
      "value": "",
      "smartValue": "@me",
      "visible": true
    }
  ],
  "taskFilters": [],
  "fileFilters": [],
  "attributeFilters": []
}
```

---

### auditLogs

Tracks admin actions for security and compliance.

```typescript
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  action: text('action').notNull(), // 'create_user' | 'update_role' | etc.
  targetUserId: uuid('target_user_id'),
  performedBy: uuid('performed_by').notNull(),
  details: text('details'), // JSON object with action details
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
```

**Indexes:**
- Primary key on `id`
- Foreign keys on `targetUserId`, `performedBy`

**Relationships:**
- Many-to-one with `users` (target)
- Many-to-one with `users` (performer)

**Tracked Actions:**
- `create_user`
- `update_role`
- `activate_user`
- `deactivate_user`
- `reset_password`

---

## Common Query Patterns

### Get Projects with Owner Names

```typescript
const projectsWithOwners = await db
  .select({
    project: projects,
    owner: users,
  })
  .from(projects)
  .leftJoin(users, eq(projects.ownerId, users.id));
```

### Get Project with All Assigned Users

```typescript
const projectUsers = await db
  .select({
    user: users,
  })
  .from(projectUsers)
  .leftJoin(users, eq(projectUsers.userId, users.id))
  .where(eq(projectUsers.projectId, projectId));
```

### Get Forms Attached to Project

```typescript
const projectForms = await db
  .select({
    form: forms,
  })
  .from(projectForms)
  .leftJoin(forms, eq(projectForms.formId, forms.id))
  .where(eq(projectForms.projectId, projectId));
```

---

## Migration History

| Date | Migration | Description |
|------|-----------|-------------|
| Oct 2025 | Initial schema | Created core tables |
| Nov 13, 2025 | Add savedSearches | Saved search feature |
| Nov 14, 2025 | Add description to savedSearches | Search descriptions |
| Nov 15, 2025 | Add visibility to savedSearches | Privacy controls |

---

## Future Schema Enhancements

### Planned Tables

1. **tasks** - Task management within projects
2. **files** - File attachments and document management
3. **teams** - Team grouping and permissions
4. **notifications** - User notification system
5. **sharedSearches** - Junction table for shared search access

### Planned Columns

- `projects.completedAt` - Completion timestamp
- `forms.version` - Form versioning
- `workflows.version` - Workflow versioning

---

# PAGE 4: API Documentation

## API Documentation

**Base URL:** `http://localhost:5000/api`
**Authentication:** Session-based (cookie)
**Content-Type:** `application/json`

---

## Authentication

All API endpoints (except `/api/auth/login` and `/api/auth/register`) require authentication via session cookie.

### POST /api/auth/register

Create a new user account.

**Request:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "username": "johndoe",
  "role": "user",
  "isActive": "true"
}
```

**Errors:**
- `400` - Username already exists
- `400` - Invalid request body

---

### POST /api/auth/login

Authenticate and create session.

**Request:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "username": "johndoe",
  "role": "user",
  "isActive": "true",
  "createdAt": "2025-10-15T12:00:00Z"
}
```

**Errors:**
- `401` - Invalid credentials
- `403` - Account is inactive

---

### POST /api/auth/logout

Destroy session and log out.

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/me

Get current authenticated user.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "username": "johndoe",
  "role": "user",
  "isActive": "true",
  "createdAt": "2025-10-15T12:00:00Z"
}
```

**Errors:**
- `401` - Not authenticated

---

### PUT /api/auth/password

Change current user's password.

**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password updated successfully"
}
```

**Errors:**
- `401` - Current password incorrect
- `400` - Invalid request body

---

## Users (Admin Only)

### GET /api/users

List all users.

**Permissions:** Admin only

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "username": "johndoe",
    "role": "user",
    "isActive": "true",
    "createdAt": "2025-10-15T12:00:00Z"
  }
]
```

---

### POST /api/users

Create a new user (admin only).

**Permissions:** Admin only

**Request:**
```json
{
  "username": "newuser",
  "password": "initialpassword",
  "role": "user"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "username": "newuser",
  "role": "user",
  "isActive": "true",
  "createdBy": "admin-uuid"
}
```

---

### PUT /api/users/:id/role

Change user's role.

**Permissions:** Admin only

**Request:**
```json
{
  "role": "admin"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "username": "johndoe",
  "role": "admin"
}
```

---

### PUT /api/users/:id/active

Activate or deactivate user account.

**Permissions:** Admin only

**Request:**
```json
{
  "isActive": "false"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "isActive": "false"
}
```

---

### POST /api/users/:id/reset-password

Reset user's password (admin only).

**Permissions:** Admin only

**Request:**
```json
{
  "newPassword": "temporarypassword"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successfully"
}
```

---

## Projects

### GET /api/projects

List all projects.

**Permissions:** Any authenticated user

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Project Alpha",
    "description": "First project",
    "status": "active",
    "dueDate": "2025-12-31T00:00:00Z",
    "teamSize": 5,
    "ownerId": "uuid",
    "createdAt": "2025-10-15T12:00:00Z",
    "updatedAt": "2025-10-15T12:00:00Z"
  }
]
```

---

### GET /api/projects/:id

Get single project with details.

**Permissions:** Any authenticated user

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Project Alpha",
  "description": "First project",
  "status": "active",
  "dueDate": "2025-12-31T00:00:00Z",
  "teamSize": 5,
  "ownerId": "uuid",
  "createdAt": "2025-10-15T12:00:00Z",
  "updatedAt": "2025-10-15T12:00:00Z"
}
```

**Errors:**
- `404` - Project not found

---

### POST /api/projects

Create a new project.

**Permissions:** User or Admin

**Request:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "planning",
  "dueDate": "2025-12-31",
  "teamSize": 3
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "New Project",
  "ownerId": "current-user-uuid",
  "status": "planning",
  "createdAt": "2025-11-17T10:00:00Z"
}
```

---

### PUT /api/projects/:id

Update project.

**Permissions:** Project owner or Admin

**Request:**
```json
{
  "name": "Updated Name",
  "status": "active"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Updated Name",
  "status": "active",
  "updatedAt": "2025-11-17T10:30:00Z"
}
```

**Errors:**
- `403` - Not authorized to modify this project
- `404` - Project not found

---

### DELETE /api/projects/:id

Delete project.

**Permissions:** Project owner or Admin

**Response:** `200 OK`
```json
{
  "message": "Project deleted successfully"
}
```

**Errors:**
- `403` - Not authorized to delete this project
- `404` - Project not found

---

### POST /api/projects/:id/users

Assign user to project.

**Permissions:** Project owner or Admin

**Request:**
```json
{
  "userId": "user-uuid"
}
```

**Response:** `200 OK`
```json
{
  "message": "User assigned to project"
}
```

---

### DELETE /api/projects/:id/users/:userId

Remove user from project.

**Permissions:** Project owner or Admin

**Response:** `200 OK`
```json
{
  "message": "User removed from project"
}
```

---

### GET /api/projects/:id/users

Get users assigned to project.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "username": "johndoe",
    "assignedAt": "2025-10-20T12:00:00Z"
  }
]
```

---

## Forms

### GET /api/forms

List all forms.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Project Intake Form",
    "description": "Initial project details",
    "type": "project",
    "attributes": "[\"attr-1\", \"attr-2\"]",
    "attributeCount": 2,
    "usageCount": 5,
    "createdAt": "2025-10-10T12:00:00Z"
  }
]
```

---

### GET /api/forms/:id

Get single form.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Project Intake Form",
  "attributes": "[\"attr-1\", \"attr-2\"]",
  "createdAt": "2025-10-10T12:00:00Z"
}
```

---

### POST /api/forms

Create new form.

**Permissions:** Admin only

**Request:**
```json
{
  "name": "New Form",
  "description": "Form description",
  "type": "project",
  "attributes": "[\"attr-1\", \"attr-2\"]"
}
```

**Response:** `201 Created`

---

### PUT /api/forms/:id

Update form.

**Permissions:** Admin only

**Request:**
```json
{
  "name": "Updated Form Name",
  "attributes": "[\"attr-1\", \"attr-2\", \"attr-3\"]"
}
```

**Response:** `200 OK`

---

### DELETE /api/forms/:id

Delete form.

**Permissions:** Admin only

**Response:** `200 OK`

---

## Workflows

### GET /api/workflows

List all workflows.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Approval Workflow",
    "description": "Standard approval process",
    "nodes": "[...]",
    "edges": "[...]",
    "createdAt": "2025-10-12T12:00:00Z"
  }
]
```

---

### GET /api/workflows/:id

Get single workflow.

**Response:** `200 OK`

---

### POST /api/workflows

Create workflow.

**Permissions:** Admin only

**Request:**
```json
{
  "name": "New Workflow",
  "description": "Workflow description",
  "nodes": "[...]",
  "edges": "[...]"
}
```

**Response:** `201 Created`

---

### PUT /api/workflows/:id

Update workflow.

**Permissions:** Admin only

**Response:** `200 OK`

---

### DELETE /api/workflows/:id

Delete workflow.

**Permissions:** Admin only

**Response:** `200 OK`

---

## Attributes

### GET /api/attributes

List all attributes.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Project Name",
    "type": "text",
    "description": "Name of the project",
    "icon": "FileText",
    "createdAt": "2025-10-01T12:00:00Z"
  }
]
```

---

### POST /api/attributes

Create attribute.

**Permissions:** Admin only

**Request:**
```json
{
  "name": "Priority",
  "type": "status",
  "description": "Project priority level",
  "icon": "AlertCircle"
}
```

**Response:** `201 Created`

---

## Saved Searches

### GET /api/saved-searches

List saved searches (filtered by permissions).

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "My Projects",
    "description": "Projects I own",
    "visibility": "private",
    "createdBy": "uuid",
    "filters": "{...}",
    "createdAt": "2025-11-13T12:00:00Z"
  }
]
```

**Filtering Rules:**
- User always sees their own searches
- Admin sees all searches
- Public searches visible to all
- Team searches visible to users and admins (not viewers)
- Private/shared only visible to creator

---

### GET /api/saved-searches/:id

Get single saved search.

**Response:** `200 OK`

---

### POST /api/saved-searches

Create saved search.

**Request:**
```json
{
  "name": "Active Projects",
  "description": "All active projects",
  "visibility": "public",
  "filters": {
    "entity": "projects",
    "projectFilters": [
      {
        "field": "status",
        "operator": "equals",
        "value": "active",
        "visible": true
      }
    ]
  }
}
```

**Response:** `201 Created`

---

### PUT /api/saved-searches/:id

Update saved search.

**Permissions:** Creator or Admin

**Response:** `200 OK`

---

### DELETE /api/saved-searches/:id

Delete saved search.

**Permissions:** Creator or Admin

**Response:** `200 OK`

---

### GET /api/saved-searches/execute/:id

Execute saved search and return results.

**Response:** `200 OK`
```json
{
  "results": [
    {
      "id": "project-uuid",
      "metadata": {
        "name": "Project Alpha",
        "status": "active",
        "created_by": "admin"
      }
    }
  ],
  "count": 1
}
```

**Processing:**
1. Loads saved search from database
2. Resolves smart values (@me, @today, etc.)
3. Applies field mapping (created_by → ownerId → username)
4. Filters results based on criteria
5. Builds metadata with only visible fields
6. Returns filtered results

---

## Form Submissions

### GET /api/form-submissions

List form submissions (optionally filtered by project).

**Query Parameters:**
- `projectId` (optional) - Filter by project

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "formId": "uuid",
    "projectId": "uuid",
    "submittedBy": "uuid",
    "data": "{...}",
    "submittedAt": "2025-11-15T12:00:00Z"
  }
]
```

---

### POST /api/form-submissions

Submit form data.

**Request:**
```json
{
  "formId": "uuid",
  "projectId": "uuid",
  "data": {
    "attr-1": "Value 1",
    "attr-2": "Value 2"
  }
}
```

**Response:** `201 Created`

---

## Audit Logs

### GET /api/audit-logs

List audit log entries.

**Permissions:** Admin only

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "action": "create_user",
    "targetUserId": "uuid",
    "performedBy": "admin-uuid",
    "details": "{...}",
    "timestamp": "2025-11-10T12:00:00Z"
  }
]
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "details": "Additional context (optional)"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

# PAGE 5: Saved Search Feature

## Saved Search Feature Documentation

**Status:** ✅ Mostly Complete
**Branch:** SavedSearchFeature
**Last Updated:** November 17, 2025

---

## Overview

The Saved Search feature allows users to create, save, and execute complex searches with advanced filtering capabilities. Searches can filter projects (and eventually tasks, files, and attributes) using a variety of operators and smart values.

---

## Key Features

### ✅ Implemented Features

1. **Visual Search Builder**
   - Add/remove multiple filters
   - Field selection (name, status, created_by, due_date, etc.)
   - Operator selection (is, contains, starts with, ends with, etc.)
   - Smart value support (@me, @today, etc.)
   - Field visibility toggles

2. **Smart Values**
   - **User Values:**
     - `@me` - Current user
     - `@my-team` - Team members (resolves to current user until teams feature implemented)

   - **Date Values:**
     - `@today` - Full current day (00:00:00 to 23:59:59)
     - `@this-week` - Current week (Sunday to Saturday)
     - `@this-month` - Current month (1st to last day)
     - `@this-year` - Current year (Jan 1 to Dec 31)

3. **Search Execution**
   - Real-time filter evaluation
   - Smart value resolution at execution time
   - Field mapping (created_by → ownerId → username)
   - Customizable result columns based on visible fields
   - Sortable result tables

4. **Search Management**
   - Create new searches with name and description
   - Edit existing searches
   - Delete searches with confirmation dialog
   - Alphabetical sorting of search list
   - Card and table view options

5. **Visibility & Permissions**
   - **Private** - Only creator can view
   - **Shared** - Creator chooses who can view (foundation for future feature)
   - **Team** - All team members can view
   - **Public** - Everyone can view
   - Permission-based filtering on backend

6. **User Experience**
   - Required field validation (name, visibility)
   - Toast notifications for success/error
   - Loading states
   - Confirmation dialogs
   - Description support for documenting searches

---

## Pending Tasks & Improvements

### Priority: High

#### Task 1: Task and File Filtering
**Status:** Not Implemented
**Description:** UI exists for task and file filters, but search execution only processes project filters.
**Location:** server/routes.ts (line 969 - TODO comment)
**Impact:** Users can create filters but get empty results for tasks and files.

---

### Priority: Medium

#### Task 3: Smart Values Processing
**Status:** ✅ Completed (November 13, 2025)
**Description:** Backend now processes @me, @my-team, @today, @this-week, @this-month, @this-year.

#### Task 6: Error Handling
**Status:** Limited
**Description:** Search execution errors logged but not detailed to users.
**Improvements Needed:**
- Validation of filter combinations
- Handling of deleted attributes in saved searches
- User-facing error messages with actionable feedback

#### Task 7: Team Lookup Implementation
**Status:** Not Implemented
**Description:** @my-team smart value currently resolves to current user only.
**Location:** server/routes.ts resolveSmartValue function
**Impact:** Team-based searches not possible.
**Future Enhancement:** Implement team lookup when teams feature exists.

#### Task 9: Multi-Entity Search Results Hierarchy
**Status:** Not Implemented
**Priority:** Medium
**Description:** Search results need hierarchical display for Projects>Tasks>Files>Attributes.
**Implementation Notes:**
- Projects can contain tasks and files
- When project filters + task filters are set, search for specific tasks within specific projects
- Results should be grouped/organized by entity type with clear hierarchy

#### Task 11: Dashboard Widget for Saved Searches
**Status:** Not Implemented
**Priority:** Medium
**Description:** Display selected saved searches on user dashboard with real-time result counts.
**Implementation Requirements:**
- Allow users to "pin" searches to display on dashboard
- Execute selected searches on-demand when dashboard loads
- Display search name, description, and accurate result count
- Limit number of pinned searches (max 5-10)
- Cache results with short TTL (5 minutes)

---

### Priority: Low

#### Task 2: Delete Functionality
**Status:** ✅ Completed (November 13, 2025)

#### Task 4: Result Count Accuracy
**Status:** ✅ Completed (November 15, 2025)
**Design Decision:**
- SearchPage does NOT display result counts to avoid performance impact
- SearchResults page displays accurate counts on-demand
- Future dashboard widget will show counts for pinned searches

#### Task 5: Search Sharing/Permissions
**Status:** ✅ Completed (November 15, 2025)
**Visibility Levels:** Private, Shared, Team, Public

#### Task 8: Teams Feature
**Status:** Not Implemented
**Description:** No team concept exists in the application.
**Impact:** No team-based collaboration or filtering.

#### Task 10: Edit Actions from Search Results
**Status:** Not Implemented
**Description:** No edit/delete/manage actions available from search results table.
**Future Enhancement:** Add action column with options for each result type.

---

## Technical Implementation

### Frontend Components

**SearchPage.tsx**
- Lists saved searches in card or table view
- Alphabetically sorted
- Displays descriptions
- No result counts (performance optimization)

**SearchCreation.tsx**
- Visual filter builder
- Add/remove filters
- Field, operator, value selection
- Visibility dropdown (required field)
- Smart value support
- Save/update functionality

**SearchResults.tsx**
- Displays search execution results
- Table view with custom columns based on visible fields
- Sortable columns
- Formatted cells (dates, status badges, users)
- Clickable rows to open results

**Components:**
- SavedSearchCard.tsx - Card view display
- SavedSearchesTable.tsx - Table view display
- Both support delete with confirmation

---

### Backend Implementation

**Search Execution Flow:**

1. **Load Search** - Retrieve saved search from database
2. **Resolve Smart Values** - Convert @me, @today, etc. to actual values
3. **Apply Field Mapping** - Map UI fields to database columns
4. **Filter Results** - Evaluate all filters against projects
5. **Build Metadata** - Construct result objects with visible fields only
6. **Return Results** - Send filtered, formatted results to client

**Key Functions:**

**resolveSmartValue()** (server/routes.ts lines 868-926)
```typescript
// Resolves smart values to actual values
@me → currentUserId
@today → { start: '2025-11-17T00:00:00Z', end: '2025-11-17T23:59:59Z' }
```

**Field Mapping** (server/routes.ts lines 1000-1007)
```typescript
created_by → ownerId → (lookup username)
last_modified → updatedAt
started → createdAt
due_date → dueDate
```

**Permission Filtering** (server/routes.ts lines 783-819)
```typescript
// User can always see their own searches
if (search.createdBy === user.id) return true;

// Admins can see all searches
if (user.role === 'admin') return true;

// Public searches visible to all
if (search.visibility === 'public') return true;

// Team searches visible to users and admins
if (search.visibility === 'team' && user.role !== 'viewer') return true;

// Private and Shared only visible to owner
return false;
```

---

## Supported Operators

### String Operators
- `contains` - Case-insensitive substring match
- `not_contains` - Substring not present
- `equals` / `is` - Exact case-insensitive match
- `not_equals` / `is_not` - Case-insensitive non-match
- `starts_with` - Prefix match
- `ends_with` - Suffix match
- `is_empty` - Field is null, undefined, or empty
- `is_not_empty` - Field has a value

### Date Operators
- `before` - Date before specified value/range
- `after` - Date after specified value/range
- `on` / `equals` - Date within range (inclusive)
- `between` - Date within range (inclusive)

### Smart Value Operators
- `is_me` - Current user (displays as "is me")
- `is_not_me` - Not current user
- `is_my_team` - Team members
- `is_not_my_team` - Not team members

---

## Database Schema

### savedSearches Table

```typescript
{
  id: uuid,
  name: text (required),
  description: text (optional),
  visibility: text (required), // 'private' | 'shared' | 'team' | 'public'
  createdBy: uuid (references users),
  filters: text (JSON),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Filter Structure

```json
{
  "entity": "projects",
  "projectFilters": [
    {
      "field": "created_by",
      "operator": "is",
      "value": "",
      "smartValue": "@me",
      "visible": true
    },
    {
      "field": "status",
      "operator": "equals",
      "value": "active",
      "visible": true
    }
  ],
  "taskFilters": [],
  "fileFilters": [],
  "attributeFilters": []
}
```

---

## Usage Examples

### Example 1: My Active Projects

**Filters:**
- created_by `is me`
- status `equals` active

**Visible Fields:**
- name
- description
- status
- due_date

**Result:** Shows all active projects owned by current user.

---

### Example 2: Projects Due This Month

**Filters:**
- due_date `on` @this-month
- status `not equals` completed

**Visible Fields:**
- name
- status
- due_date
- created_by

**Result:** Shows incomplete projects due within current month.

---

### Example 3: All Team Projects

**Filters:**
- created_by `is my team`
- status `is not empty`

**Visible Fields:**
- name
- created_by
- status
- last_modified

**Result:** Shows all projects created by team members.

---

## Recent Commits

- `e45dd00` - Add 'created_by' field mapping and 'is' operator support
- `95fa532` - Enhance search execution with comprehensive operator support
- `4ce47ca` - Implement comprehensive saved search feature
- Various commits for visibility, descriptions, UI improvements

---

## Future Enhancements

1. **Multi-Entity Search**
   - Support for task, file, and attribute filtering
   - Hierarchical result display

2. **Advanced Sharing**
   - Implement actual sharing for 'shared' visibility
   - Sharing table to track access permissions

3. **Search Analytics**
   - Track search execution frequency
   - Popular searches
   - Search performance metrics

4. **Saved Search Templates**
   - Pre-built search templates
   - Import/export searches

5. **Query Optimization**
   - Move filtering to SQL WHERE clauses
   - Database indexing for common queries
   - Pagination support

6. **Additional Smart Values**
   - @yesterday, @last-week, @last-month
   - @next-week, @next-month
   - @7-days-ago, @30-days-ago
   - Relative date ranges

---

# PAGE 6: Getting Started

## Getting Started Guide

This guide will help you set up and run FlowForge locally on your development machine.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 22+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** or access to Neon database (see Database Setup)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sarahlawlis/ISYS-54203-team-project.git
cd ISYS-54203-team-project
```

---

### 2. Install Dependencies

```bash
npm install
```

This installs all frontend and backend dependencies defined in `package.json`.

---

### 3. Environment Configuration

Create a `.env` file in the project root:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host/database

# Session Secret (generate a random string)
SESSION_SECRET=your-very-secret-random-string-here

# Node Environment
NODE_ENV=development
```

**For Neon Database:**
```
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 4. Database Setup

#### Option A: Using Neon (Recommended)

1. Create a free account at [Neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env` as `DATABASE_URL`

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb flowforge
   ```
3. Update `.env` with local connection string:
   ```
   DATABASE_URL=postgresql://localhost/flowforge
   ```

---

### 5. Run Database Migrations

```bash
npm run db:push
```

This creates all necessary tables in your database using Drizzle ORM.

---

### 6. (Optional) Seed Database

Seed the database with sample attributes:

```bash
npm run seed
```

Or create an admin user:

```bash
npm run create-admin
```

---

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

This starts:
- **Backend:** Express server on port 5000
- **Frontend:** Vite dev server with HMR

**Access the application:**
```
http://localhost:5000
```

---

### Production Mode

Build and run production bundle:

```bash
npm run build
npm start
```

---

## First-Time Setup

### 1. Create Admin Account

If you haven't seeded the database, create your first admin user:

```bash
npm run create-admin
```

Or register through the application:
1. Go to `http://localhost:5000/login`
2. Click "Register" (first user is automatically admin)
3. Enter username and password

---

### 2. Explore the Application

**Key Pages:**
- `/` - Dashboard
- `/projects` - Project management
- `/forms` - Form builder
- `/workflows` - Workflow designer
- `/search` - Saved searches
- `/users` - User management (admin only)

---

## Common Tasks

### Check Port Availability

If port 5000 is in use:

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /F /PID [PID]
```

**Mac/Linux:**
```bash
lsof -i :5000
kill -9 [PID]
```

---

### Reset Database

Drop all tables and re-run migrations:

```bash
npm run db:drop
npm run db:push
npm run seed
```

---

### View Database

Use Drizzle Studio to view and edit database:

```bash
npm run db:studio
```

Opens a web interface at `http://localhost:4983`

---

## Development Workflow

### 1. Make Changes

- Frontend changes trigger Vite HMR (instant updates)
- Backend changes require server restart (tsx watch should auto-restart)

### 2. Test Changes

- Manual testing in browser
- Check console for errors
- Review network requests in DevTools

### 3. Commit Changes

```bash
git add .
git commit -m "Description of changes"
git push
```

---

## Troubleshooting

### "Cannot connect to database"

- Check `.env` DATABASE_URL is correct
- Ensure database server is running
- Test connection with `psql` or database client

---

### "Port 5000 already in use"

- Kill existing process (see above)
- Or change port in `server/index.ts`

---

### "tsx watch not restarting"

- Manually restart server: `Ctrl+C` then `npm run dev`
- Check file permissions
- Try clearing `node_modules` and reinstalling

---

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Database migration errors

```bash
# Reset migrations
npm run db:drop
npm run db:push
```

---

## Project Structure Overview

```
project-root/
├── client/          # React frontend
│   └── src/
│       ├── pages/   # Route components
│       ├── components/  # UI components
│       ├── hooks/   # Custom hooks
│       └── lib/     # Utilities
├── server/          # Express backend
│   ├── index.ts     # Server entry
│   ├── routes.ts    # API routes
│   └── ...
├── shared/          # Shared code
│   └── schema.ts    # Database schema
├── migrations/      # Database migrations
└── scripts/         # Utility scripts
```

---

## Helpful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push      # Run migrations
npm run db:studio    # Open Drizzle Studio
npm run seed         # Seed attributes
npm run create-admin # Create admin user

# Linting
npm run lint
```

---

## Next Steps

- Read [[Architecture]] for system design overview
- Review [[Database Schema]] for data structure
- Check [[API Documentation]] for endpoint reference
- See [[User Guide]] for feature documentation

---

## Getting Help

- Check [AverysLog.md](https://github.com/sarahlawlis/ISYS-54203-team-project/blob/main/AverysLog.md) for development history
- Review GitHub Issues
- Contact project team

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Express.js Guide](https://expressjs.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

---

*Last Updated: November 17, 2025*
