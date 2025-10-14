# Project Management Platform

## Overview

FlowForge is a comprehensive project management platform that empowers teams to manage any business process through customizable forms, reusable workflows, and flexible project structures. The platform features a form builder for creating custom data collection interfaces, a workflow designer for multi-step processes, project management with document storage, advanced search capabilities with saved filters, and personalized dashboards for visibility across all activities.

The application is built as a full-stack TypeScript solution with a React frontend and Express backend, designed to be adaptable to various business workflows and processes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system

**Design System:**
The application implements a comprehensive design system with:
- Custom color palette supporting light and dark modes (primary: bright blue, secondary: dark navy)
- Typography using Open Sans for UI and Menlo for monospace elements
- Consistent spacing scale and elevation system for hover/active states
- Card-based layout with rounded corners (20.8px border radius per spec)
- Component library inspired by Asana and Airtable interfaces

**Component Structure:**
- Reusable card components for Projects, Workflows, Forms, Attributes, Tasks, and Saved Searches
- Table views as alternative to card grids with view toggle functionality
- Shared UI components from Shadcn/ui for consistency
- Custom sidebar navigation with collapsible states

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with Express.js server
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon serverless PostgreSQL with WebSocket support
- **Build**: esbuild for server bundling, TypeScript compilation

**Server Design:**
- RESTful API architecture with `/api` prefix for all routes
- In-memory storage implementation (`MemStorage`) as default with interface for database swap
- Session management using connect-pg-simple for PostgreSQL-backed sessions
- Development middleware for Vite integration and HMR support
- Modular route registration pattern for scalability

**Storage Pattern:**
The application uses an interface-based storage pattern (`IStorage`) allowing easy switching between in-memory and database implementations. Currently implements basic user CRUD operations with UUID generation.

### Data Architecture

**Database Schema (Drizzle ORM):**
- PostgreSQL as primary database
- Schema defined in TypeScript with Drizzle ORM
- Zod integration for runtime validation via drizzle-zod
- Migration support through drizzle-kit
- Current schema includes Users table with UUID primary keys

**Planned Entities** (based on application features):
- Projects: Core entity for managing business processes
- Forms: Custom form definitions with attribute collections
- Attributes: Reusable label-value pairs for forms
- Workflows: Multi-step processes with task nodes
- Tasks: Individual work items within workflows
- Saved Searches: Persisted filter configurations
- Documents: File attachments linked to projects

### Authentication & Authorization

**Current Implementation:**
- User model with username/password authentication
- UUID-based user identification
- Session-based authentication ready (connect-pg-simple configured)

**Security Considerations:**
- Password hashing implementation needed
- Session management via PostgreSQL-backed store
- CORS and credential handling configured for development

## External Dependencies

### Core Infrastructure
- **Database**: Neon Serverless PostgreSQL with WebSocket support (@neondatabase/serverless)
- **ORM**: Drizzle ORM for type-safe database queries
- **Session Store**: connect-pg-simple for PostgreSQL session management

### UI & Component Libraries
- **Component Primitives**: Radix UI suite (dialogs, dropdowns, popovers, etc.)
- **Icons**: Lucide React for consistent iconography
- **Form Handling**: React Hook Form with Zod resolvers
- **Command Palette**: cmdk for search/command interface
- **Date Utilities**: date-fns for date manipulation

### Development Tools
- **Replit Integration**: Vite plugins for runtime error overlay, cartographer, and dev banner
- **Hot Module Replacement**: Vite dev server with Express middleware mode
- **Type Safety**: TypeScript with strict mode enabled

### State & Data Fetching
- **Server State**: TanStack React Query for caching and synchronization
- **Client State**: React hooks and local component state
- **Validation**: Zod schemas generated from Drizzle models

### Build & Deployment
- **Frontend Build**: Vite with React plugin and TypeScript
- **Backend Build**: esbuild bundling server code to ESM
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer
- **Asset Handling**: Vite asset resolution with custom aliases