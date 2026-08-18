# 🏰 House Riant — Campaign Manager

> *Taobh Le Taobh — Side by side, or Always Faithful*

A web application for managing a tabletop RPG campaign. It tracks estate residents, notable figures, buildings, tasks, finances, inventory, and events on a custom in-world calendar.

**Current in-world year:** Dr-58

---

## AI Usage

Most of the implementation was written with Claude Code as the coding assistant. I directed the architecture and feature decisions, and reviewed and edited the resulting code.

---

## What It Does

- Track who lives and works on the estate (**Residents**), grouped by **Family**
- Record important NPCs outside the estate (**Notable Figures**)
- Manage estate structures and their upkeep (**Buildings**)
- Plan and track estate projects on a table or **kanban board** (**Tasks**)
- Monitor gold, income sources, and debt (**Finances**)
- Catalogue weapons, tools, food, and supplies (**Inventory**)
- Record events — including recurring ones — on a custom world calendar (**Calendar**), with tasks linkable to calendar dates

---

## How It's Built

The backend is an ASP.NET Core Web API backed by PostgreSQL via Entity Framework Core. The frontend is a React + TypeScript single-page app built with Vite. TanStack Query handles all data fetching and caching on the client, and React Hook Form handles all forms.

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| UI State | TanStack Query v5 |
| Forms | React Hook Form |
| Backend | ASP.NET Core 10 Web API |
| ORM | Entity Framework Core 10 |
| Database | PostgreSQL |

**Backend pattern:** every resource follows the same Model → DTO → Controller structure. DTOs are used for all API input/output instead of exposing EF models directly, to avoid circular JSON from navigation properties.

**Frontend pattern:** every resource has a hook file (`useXxx` for the query, plus `useCreateXxx` / `useUpdateXxx` / `useDeleteXxx` mutations that invalidate the query cache on success). Every page follows the same layout: header with an add button, a search/filter toolbar, a table or kanban view, a slide-in detail panel, and a modal form for add/edit.

---

## How It's Hosted

The app runs self-hosted on a Raspberry Pi on a home network — the ASP.NET Core API, the React build, and PostgreSQL are all running on that machine.

---

## Feature Highlights

### Tasks Page
- Table view and Kanban board view (drag-and-drop to change status)
- Search + filter chips for status, priority, and category
- Slide-in detail panel; full add/edit form with FK dropdowns
- **"+ Calendar" button** on any task — opens a date picker to add the task to the calendar as a linked event
- Target Date and Completed Date use the custom `CalendarDatePicker` (structured dropdowns, always correct format)

### Calendar Page
- Visual grid showing all 4 seasons + 4 Brón transition periods
- Events displayed as colour-coded chips (Deadline, Battle, Festival, Note, Task, Other)
- Click any empty cell to add an event pre-filled with that date
- **Recurring events** — create one event per week across a season (or all seasons); shared `RecurrenceGroupId` lets you delete the entire series at once
- **"+ Add Task"** button on the Calendar page opens the Task form directly
- Today indicator with a pinnable current date; year navigation
- **Auto-scroll to current season** on page load — the view opens directly at today's season
- **"Jump to Today" button** in the toolbar — scrolls back to the current season from anywhere in the calendar; also switches the year if needed
- **Current week row highlighted in gold** — within the current season grid, today's week label is gold so it's immediately visible
- **Multi-select season filter** — season chips toggle independently; any combination of seasons can be shown simultaneously
- Linked tasks shown in event detail panel

### Task ↔ Calendar Integration
- Tasks have a `linkedTaskId` on calendar events — any task can be pinned to a calendar date
- Events of type **Task** are automatically created when using "Add to Calendar" from TaskDetail
- The `CalendarDatePicker` component ensures date strings always parse correctly

### Custom Calendar Date Picker (`CalendarDatePicker`)
- Reusable component used wherever a calendar date must be entered
- Dropdowns for Year (`Dr-XX`), Season, Week (hidden for Brón seasons), and Day (1–9)
- "Set date" toggle — shows nothing when empty, full dropdowns when a date is chosen
- Live preview of the formatted string (e.g. `5th of Iianu of Ambrik's Thaw, Dr-58`)

---

## The World Calendar

This project uses a custom calendar system instead of real-world dates:

- **4 seasons:** Foeduhn's Patience · Aumma's Mercy · Malthana's Harvest · Ambrik's Thaw
- **9 named weeks per season:** Aumma, Eaden, Sorra, Harmu, Iianu, Xo, Ambrik, Foeduhn, Rin
- **4 Brón transition weeks** between seasons: Breith, Mair, Bás, Anaithnid
- **9 days per week**, numbered 1–9
- **360 days per year**
- **Year format:** `Dr-58`

Example dates: `5th of Iianu of Ambrik's Thaw, Dr-58` or `3rd of Brón: Bás, Dr-58`

---

## Design System

The UI uses a heraldic fantasy theme: royal blue, gold, and parchment, defined in a single `styles.css` theme reused across every page.

**Fonts:**
- *Cinzel* — headings and labels
- *EB Garamond* — body text

**Key colours:**

| Variable | Value | Usage |
|----------|-------|-------|
| `--blue-deep` | `#0f2a5c` | Sidebar background |
| `--blue-royal` | `#1a3f7a` | Primary blue |
| `--gold` | `#c8a020` | Primary gold / accents |
| `--parchment` | `#f7f2e8` | Page background |
| `--ink` | `#0e1a2e` | Primary text |
| `--ink-muted` | `#7a90aa` | Secondary / muted text |

---

## Pages

| Page | Route | Status |
|------|-------|--------|
| Residents | `/` | ✅ Complete |
| Focus View | `/focus` | ✅ Complete |
| Families | `/families` | ✅ Complete |
| Notable Figures | `/notable-figures` | ✅ Complete |
| Buildings | `/buildings` | ✅ Complete |
| Tasks | `/tasks` | ✅ Complete |
| Calendar | `/calendar` | ✅ Complete |
| Inventory | `/inventory` | ✅ Complete |
| Finances | `/finances` | ✅ Complete |

---

## Running It Locally

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18 or later)
- [PostgreSQL](https://www.postgresql.org/download/) (v14 or later)
- `dotnet-ef` CLI tool:
  ```bash
  dotnet tool install --global dotnet-ef
  ```

### 1. Clone the repository

```bash
git clone https://github.com/Aceluke24/HouseRiant.git
cd HouseRiant
```

### 2. Set up the database

Create a PostgreSQL database named `houseriant` (or whatever you prefer), then update the connection string in:

```
backend/HouseRiant/HouseRiant/appsettings.json
```

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=houseriant;Username=youruser;Password=yourpassword"
}
```

### 3. Run database migrations

This creates all the tables and seeds the initial data:

```bash
cd backend/HouseRiant/HouseRiant
dotnet ef database update
```

**Seeded data includes:**
- 7 families: Riant, Bray, Eldran, Wernan, Dalner, Marven, Hewer
- Estate finances snapshot (bank: 61 tin, outstanding loan: 57,022 tin)
- Income source: Rhiant Mine (216 tin/day)

### 4. Start the backend

```bash
cd backend/HouseRiant/HouseRiant
dotnet run --launch-profile Main
```

The API will be available at:
- HTTP: `http://localhost:4000`
- HTTPS: `https://localhost:5000`

### 5. Start the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

### Adding a migration

Whenever you make changes to a model, create and apply a migration:

```bash
cd backend/HouseRiant/HouseRiant
dotnet ef migrations add YourMigrationName
dotnet ef database update
```

---

## Project Structure

```
HouseRiant/
├── backend/
│   └── HouseRiant/
│       └── HouseRiant/
│           ├── Controllers/        ← API route handlers (one per resource)
│           ├── Data/
│           │   └── AppDbContext.cs ← EF Core database context
│           ├── DTOs/               ← Data Transfer Objects (shapes for API input/output)
│           ├── Models/             ← C# classes that map to database tables
│           ├── Migrations/         ← Auto-generated database migration files
│           ├── wwwroot/
│           │   └── images/portraits/ ← uploaded portrait images stored here
│           ├── Program.cs          ← app startup and configuration
│           └── appsettings.json    ← connection strings and settings
└── frontend/
    └── src/
        ├── api/
        │   └── index.ts            ← all API calls in one place
        ├── components/
        │   ├── CalendarDatePicker.tsx  ← reusable custom calendar date picker
        │   ├── ConfirmModal.tsx
        │   ├── calendar/           ← CalendarForm, CalendarDetail
        │   ├── residents/          ← ResidentForm, ResidentDetail
        │   └── tasks/              ← TaskForm, TaskDetail, AddToCalendarModal
        ├── hooks/                  ← TanStack Query data hooks (one file per resource)
        ├── pages/                  ← one file per app page/route
        ├── types/
        │   └── index.ts            ← all TypeScript types and enums
        ├── utils/                  ← small helper functions
        ├── App.tsx                 ← router setup and sidebar layout
        └── styles.css              ← global House Riant design theme
```

---

## API Reference

All endpoints are prefixed with `http://localhost:4000/api/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/families` | All families |
| POST / PUT / DELETE | `/families/{id}` | Create, update, or delete a family |
| GET | `/residents?search=&status=` | All residents (filterable) |
| POST / PUT / DELETE | `/residents/{id}` | Create, update, or delete a resident |
| GET | `/notablefigures?search=&relationship=` | All notable figures |
| POST / PUT / DELETE | `/notablefigures/{id}` | Create, update, or delete a notable figure |
| GET | `/buildings` | All buildings with linked tasks |
| POST / PUT / DELETE | `/buildings/{id}` | Create, update, or delete a building |
| GET | `/tasks?search=&status=&category=` | All tasks (filterable) |
| POST / PUT / DELETE | `/tasks/{id}` | Create, update, or delete a task |
| PATCH | `/tasks/{id}/status` | Quick status update (used by Kanban drag-and-drop) |
| GET | `/finances` | Estate finances snapshot |
| PUT | `/finances` | Update finances |
| GET / POST / DELETE | `/finances/income` | Manage income sources |
| GET | `/inventory?search=&category=` | All inventory (filterable) |
| POST / PUT / DELETE | `/inventory/{id}` | Create, update, or delete an item |
| GET | `/calendar?year=&season=` | Calendar events |
| POST / PUT / DELETE | `/calendar/{id}` | Create, update, or delete a single event |
| POST | `/calendar/batch` | Batch-create recurring events (assigns shared `RecurrenceGroupId`) |
| DELETE | `/calendar/group/{groupId}` | Delete all events in a recurring series |
| POST | `/uploads/portrait` | Upload a portrait image |

---

## Portrait Images

Portraits are uploaded via `POST /api/uploads/portrait` (multipart form data) and stored in `backend/wwwroot/images/portraits/` as UUID-named files. They are served statically and displayed on resident and notable figure cards.

---

## Development Notes

- `EstateTask` is used as the C# model name (instead of `Task`) to avoid a conflict with `System.Threading.Tasks.Task`.
- `EstateTaskStatus` is the enum name for the same reason.
- The `Role` field on Residents is nullable — guard against null before calling string methods.
- `ReferenceHandler.IgnoreCycles` is configured in `Program.cs` to prevent infinite JSON serialisation loops from circular navigation properties.
- Portrait blob URLs from `URL.createObjectURL` are temporary and don't persist — always upload through the API endpoint.
- The `TaskEvent` C# enum value is kept in the backend enum for backward compatibility even though it is displayed as "Task" in the frontend.

---

## Future Plans

- Ledger entries table for full financial history
- Recruitment prospects tracking
