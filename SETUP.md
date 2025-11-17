# FlowForge - Local Development Setup

Quick reference guide for spinning up the FlowForge application on your local machine.

## Prerequisites

- Node.js v22.21.0 or higher
- npm v10.9.4 or higher
- Access to the Neon PostgreSQL database

## Quick Start

1. **Install Dependencies** (first time only)
   ```bash
   npm install
   ```

2. **Set Up Environment Variables** (first time only)
   - Ensure the `.env` file exists in the project root
   - Verify it contains the correct `DATABASE_URL` for the Neon database
   - The file should look like this:
     ```env
     DATABASE_URL=postgresql://neondb_owner:npg_2uTGJv3peICZ@ep-cool-bonus-a4pak8o9.us-east-1.aws.neon.tech/neondb?sslmode=require
     SESSION_SECRET=your-secret-key-change-in-production
     PORT=5000
     NODE_ENV=development
     ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Open the Application**
   - Navigate to: **http://localhost:5000**
   - The app will be running with hot module reloading enabled

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot reloading |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Push database schema changes to Neon |

## Database

- **Provider**: Neon Serverless PostgreSQL
- **Connection**: Configured via `DATABASE_URL` in `.env`
- **Schema**: Managed with Drizzle ORM
- **Migrations**: Located in `/migrations` directory

The database is already set up and contains existing data from Replit. You don't need to run migrations unless you're making schema changes.

## Project Structure

```
ISYS-54203-team-project-1/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/       # Route pages
│   │   ├── components/  # UI components
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   └── auth.ts          # Authentication utilities
├── shared/              # Shared types and schemas
│   └── schema.ts        # Drizzle schema & Zod validation
├── .env                 # Environment variables (not in git)
└── package.json         # Dependencies and scripts
```

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Wouter (routing)
- TanStack React Query (server state)
- Shadcn/ui + Radix UI (components)
- Tailwind CSS (styling)

### Backend
- Node.js + Express
- Drizzle ORM
- PostgreSQL (Neon)
- Session-based authentication
- Bcrypt (password hashing)

## Authentication

The application uses session-based authentication with three user roles:
- **Admin**: Full access to all features
- **User**: Can create and manage own projects
- **Viewer**: Read-only access

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, you can change it in the `.env` file:
```env
PORT=3000
```

### Database Connection Issues
- Verify the `DATABASE_URL` is correct in `.env`
- Check that you have internet connectivity (Neon is cloud-hosted)
- Ensure the Neon database is active (free tier databases may sleep)

### Module Not Found Errors
Run:
```bash
npm install
```

### TypeScript Errors
Run type checking to see detailed errors:
```bash
npm run check
```

## Development Notes

### Windows Compatibility
This project has been configured for Windows development:
- Uses `cross-env` for environment variables
- Uses `dotenv` for loading `.env` files
- Server listen configuration is Windows-compatible

### Hot Reloading
The development server uses:
- **Vite HMR** for frontend changes (instant updates)
- **tsx watch mode** for backend changes (auto-restart)

### API Testing
All API routes are prefixed with `/api`:
- Auth: `/api/auth/*`
- Projects: `/api/projects/*`
- Forms: `/api/forms/*`
- Workflows: `/api/workflows/*`
- Attributes: `/api/attributes/*`
- Users: `/api/users/*` (admin only)

## Next Steps After Starting

1. Open http://localhost:5000
2. You'll see the login page
3. Either:
   - Log in with existing credentials from Replit
   - Create a new account (first user becomes admin)
4. Explore the dashboard, projects, workflows, and forms

## Support

For issues or questions, refer to:
- `replit.md` - Project overview and architecture
- `design_guidelines.md` - UI/UX design system
- `/retrospectives` - Sprint retrospectives and learnings

---

**Happy Coding!** 🚀
