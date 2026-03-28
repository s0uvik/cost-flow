# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Type-check + production build (tsc -b && vite build)
npm run lint       # ESLint
npm run preview    # Preview production build
npx tsc --noEmit   # Type-check only, no build
```

After adding new Shadcn components:
```bash
npx shadcn@latest add <component-name>   # Installs to src/components/ui/
```

After modifying Supabase schema:
```bash
npx supabase gen types typescript --project-id qifkazdofometutpqfex > src/types/database.types.ts
```

## Architecture

### Routing — TanStack Router (file-based)
Routes live in `src/routes/`. The plugin auto-generates `src/routeTree.gen.ts` on `npm run dev` — never edit this file manually.

Two layout route groups:
- `_auth.tsx` + `_auth/` — unauthenticated pages (login, register). Redirects to `/` if already logged in.
- `_app.tsx` + `_app/` — protected pages. `beforeLoad` calls `supabase.auth.getSession()`; redirects to `/login` if no session. Wraps all pages in `AppLayout`.

Route files are thin — they only import and render from `src/pages/`. All component logic lives in pages.

### Pages — Feature-based (`src/pages/`)
Each feature has its own folder:
```
src/pages/<feature>/
  <Feature>Page.tsx        # Top-level page component (imported by route)
  components/              # Feature-specific components
  hooks/                   # useQuery / useMutation wrappers for this feature
```

### Data fetching rules
- **All Supabase reads** go through TanStack Query (`useQuery`) — never call `supabase` directly in components.
- **All writes** go through `useMutation` with optimistic updates on delete/status changes.
- **Filter/pagination state** lives in the URL via `nuqs` — not in `useState`.
- QueryKey convention: `['resource', userId, filters]`

### Supabase
- Client singleton: `src/lib/supabase.ts` — import `{ supabase }` from here everywhere.
- Types: `src/types/database.types.ts` — manually maintained until `supabase gen types` is run.
- All tables have RLS enabled. Policy pattern: `auth.uid() = user_id` on every user-owned table.
- `profiles` row is auto-created on signup via a database trigger (`handle_new_user`).
- Storage buckets: `receipts` (transaction receipt images), `logos` (business logos). Both private, RLS by `auth.uid()`.
- Env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local`.

### Shared components (`src/components/shared/`)
- `AppLayout` — `SidebarProvider` + `AppSidebar` + `SidebarInset` + `AppHeader`
- `AppSidebar` — Shadcn `Sidebar` with three nav groups: Overview, Business, Analytics
- `UserMenu` — dropdown in sidebar footer with sign-out via `supabase.auth.signOut()`
- `PageHeader` — reusable title + description + optional action slot

### Key libraries
| Concern | Library |
|---|---|
| Forms | `react-hook-form` + `zod` + `@hookform/resolvers` |
| Charts | `recharts` (wrapped by Shadcn `chart` component) |
| PDF export | `@react-pdf/renderer` |
| Excel export | `exceljs` + `file-saver` |
| Toasts | `sonner` |
| URL state | `nuqs` |
| Date utils | `date-fns` |

### Styling
Tailwind CSS v4 via `@tailwindcss/vite` plugin — no `tailwind.config.js`. CSS variables for theming are defined in `src/index.css` under `:root` and `.dark`. The `cn()` helper (`src/lib/utils.ts`) merges class names.

### Database schema (8 tables)
`profiles` (1-to-1 with auth.users) → `categories`, `clients`, `vendors`, `transactions`, `budgets`, `invoices`, `invoice_items`. All tables except `profiles` have a `user_id` FK to `auth.users`.
