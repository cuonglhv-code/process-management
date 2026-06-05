# Jaxtina Process Library

An internal process management application for Jaxtina English Centre. Create, document, and visualise operational processes with interactive flowcharts, rich notes, and linked forms.

Built with Next.js 14 (App Router), TypeScript, Supabase (auth + database), and Prisma v7.

## Features

- **Magic link authentication** — passwordless email login via Supabase Auth + Resend
- **Role-based access** — Staff (view published), Owner (edit own), Admin (edit all, manage users, invite)
- **Interactive flowcharts** — drag-to-pan React Flow diagrams with 4 node types (action, decision, terminal, annotation)
- **Rich step notes** — Tiptap-based WYSIWYG editor per step
- **Linked forms** — attach downloadable templates or external/internal form URLs to any step
- **Process editor** — diagram editor with node palette, auto-layout (dagre), batch save, and metadata tab
- **Search & filter** — full-text search across title, description, tags, and category
- **Admin panel** — user management with inline role editing and invitation flow

## Tech Stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| Framework      | Next.js 14 (App Router)                          |
| Language       | TypeScript                                       |
| Styling        | Tailwind CSS + shadcn/ui (Base UI components)    |
| Database ORM   | Prisma v7                                       |
| Database       | PostgreSQL (via Supabase)                        |
| Auth           | Supabase Auth (magic link)                       |
| Diagrams       | React Flow v11 + dagre (auto-layout)             |
| Rich text      | Tiptap                                           |
| Email          | Resend                                           |
| Icons          | Lucide React                                     |
| Forms          | Zod                                              |
| Annotations    | dompurify (sanitised HTML rendering)             |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project
- A [Resend](https://resend.com) API key (for magic link emails)

### Environment Variables

Copy `.env` to your project and fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:6543/postgres
DIRECT_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
RESEND_API_KEY=re_your-resend-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (anon-facing) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (admin bypass) |
| `DATABASE_URL` | Prisma connection string (port 6543 = Supabase pooler) |
| `DIRECT_URL` | Direct DB connection (port 5432, no pooler) |
| `RESEND_API_KEY` | Resend email API key |
| `NEXT_PUBLIC_APP_URL` | App base URL for magic link redirects |

### Supabase Auth Setup

1. In your Supabase dashboard, go to **Authentication > Providers > Email**
2. Enable **Magic Link** (disable password sign-in if desired)
3. Set the Site URL to `http://localhost:3000` (or your deployed URL)
4. Add `http://localhost:3000/auth/callback` to the redirect URLs

### Database Setup

Run the migration to create the schema:

```bash
npx prisma migrate dev --name init
```

This creates all 5 tables (`Profile`, `Process`, `Step`, `StepEdge`, `Form`) and 4 enums. The seed script will also run automatically, populating:

- One **admin** profile (email: `admin@jaxtina.com`, passwordless — use magic link)
- A complete **B2S (Business to Student)** process with 17 steps, 21 edges, and 5 linked forms

> You can log in as admin with magic link to `admin@jaxtina.com` after seeding.

### Supabase Row-Level Security

Run the RLS policies against your Supabase database to restrict direct table access:

```bash
psql $DATABASE_URL -f supabase/rls-policies.sql
```

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login` to authenticate.

## Project Structure

```
src/
├── app/
│   ├── (authenticated)/
│   │   ├── admin/users/         Admin user management
│   │   ├── dashboard/           Process library dashboard
│   │   └── processes/
│   │       ├── [id]/            Process view + edit
│   │       └── new/             New process creator
│   ├── auth/callback/           Supabase magic link callback
│   ├── login/                   Login page (email entry)
│   ├── api/                     API routes
│   │   ├── admin/users/[id]/    User role updates
│   │   ├── invite/              User invitation
│   │   ├── processes/           Process CRUD + search
│   │   │   └── [id]/
│   │   │       ├── save-diagram Batch save
│   │   │       └── steps/       Step listing
│   │   └── steps/[id]/          Step update + delete
│   └── layout.tsx               Root layout (Inter font)
├── components/
│   ├── drawer/                  Step detail drawer
│   ├── flow/                    React Flow nodes + diagram
│   ├── layout/                  AppShell, Sidebar, Topbar
│   └── ui/                      shadcn/ui components
├── lib/
│   ├── auth/role-check.ts       Role guard helpers
│   ├── prompts.ts               LLM prompt templates
│   ├── supabase/
│   │   ├── client.ts            Browser Supabase client
│   │   ├── middleware.ts        Auth middleware
│   │   └── server.ts            Server Supabase clients
│   └── formTranslations.ts      Form label translations
├── middleware.ts                App router middleware
└── types/index.ts               Shared types
public/forms/                    Placeholder .xlsx files
prisma/
├── schema.prisma                Database schema
├── seed.ts                      Seed data (admin + B2S process)
└── migrations/                  Auto-generated migrations
supabase/
└── rls-policies.sql             RLS policies for all tables
```

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/processes` | List processes with optional `?q=` search |
| POST | `/api/processes` | Create a new process |
| GET | `/api/processes/[id]` | Get process with steps + edges |
| PATCH | `/api/processes/[id]` | Update process metadata |
| DELETE | `/api/processes/[id]` | Delete process |
| GET | `/api/processes/[id]/steps` | List steps for a process |
| POST | `/api/processes/[id]/save-diagram` | Batch save steps + edges |
| PATCH | `/api/steps/[id]` | Update step details |
| DELETE | `/api/steps/[id]` | Delete a step |
| POST | `/api/invite` | Invite a new user (10/hr rate limit) |
| PATCH | `/api/admin/users/[id]` | Change user role (admin only) |

## Role Model

| Role | Permissions |
|---|---|
| **Staff** | View published processes only |
| **Owner** | View all processes + edit own processes |
| **Admin** | All Owner permissions + edit any process + manage users + invite |

## Deployment Checklist

- [ ] Configure all environment variables in your hosting platform (Vercel, etc.)
- [ ] Update `NEXT_PUBLIC_APP_URL` to the production URL
- [ ] Update Supabase Site URL and redirect URLs for production
- [ ] Run `npx prisma migrate deploy` to apply migrations
- [ ] Run `npm run build` to verify production build
- [ ] Run RLS policies against production database
- [ ] Verify magic link flow works end-to-end
- [ ] Verify Resend API key allows sending to your domain

## License

Internal — Jaxtina English Centre.
