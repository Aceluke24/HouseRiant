# 🏰 House Riant — Campaign Manager

> *Taobh Le Taobh — Side by side, or Always Faithful*

A personal RPG campaign manager for the fantasy world of House Riant. Built to track estate residents, notable figures, buildings, tasks, finances, inventory, and a fully custom calendar system.

**Current in-world year:** Dr-58

---

## What Is This?

House Riant is a web application designed to manage a tabletop RPG campaign. It gives you a single, organized place to:

- Track who lives and works on your estate (**Residents**)
- Record important NPCs outside the estate (**Notable Figures**)
- Manage estate structures and their upkeep (**Buildings**)
- Plan and track estate projects (**Tasks**)
- Monitor gold, income sources, and debt (**Finances**)
- Catalogue weapons, tools, food, and supplies (**Inventory**)
- Record events on a fully custom world calendar (**Calendar**)

---

## Tech Stack

| Layer | Technology | What It Does |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | The UI you see and interact with |
| UI State | TanStack Query v5 | Fetches and caches data from the API |
| Forms | React Hook Form | Handles form inputs and validation |
| Backend | ASP.NET Core 10 Web API | Serves data to the frontend via HTTP |
| ORM | Entity Framework Core 10 | Translates C# code into database queries |
| Database | PostgreSQL | Stores all persistent data |

---

## Prerequisites

Before running this project, you need the following installed:

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18 or later)
- [PostgreSQL](https://www.postgresql.org/download/) (v14 or later)
- `dotnet-ef` CLI tool:
  ```bash
  dotnet tool install --global dotnet-ef
  ```

---

## Getting Started

### 1. Clone the repository

```bash
git clone <https://github.com/Aceluke24/HouseRiant.git>
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
        ├── components/             ← reusable UI components
        ├── hooks/                  ← TanStack Query data hooks
        ├── pages/                  ← one file per app page/route
        ├── types/
        │   └── index.ts            ← all TypeScript types and enums
        ├── utils/                  ← small helper functions
        ├── App.tsx                 ← router setup and sidebar layout
        └── styles.css              ← global House Riant design theme
```

---

## Pages

| Page | Route | Status |
|------|-------|--------|
| Residents | `/` | ✅ Complete |
| Notable Figures | `/notable-figures` | ⬜ Placeholder |
| Families | `/families` | ⬜ Placeholder |
| Buildings | `/buildings` | ⬜ Placeholder |
| Tasks | `/tasks` | ⬜ Placeholder |
| Inventory | `/inventory` | ⬜ Placeholder |
| Finances | `/finances` | ⬜ Placeholder |
| Calendar | `/calendar` | ⬜ Placeholder |

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
| PATCH | `/tasks/{id}/status` | Quick status update |
| GET | `/finances` | Estate finances snapshot |
| PUT | `/finances` | Update finances |
| GET / POST / DELETE | `/finances/income` | Manage income sources |
| GET | `/inventory?search=&category=` | All inventory (filterable) |
| POST / PUT / DELETE | `/inventory/{id}` | Create, update, or delete an item |
| GET | `/calendar?year=&season=` | Calendar events |
| POST / PUT / DELETE | `/calendar/{id}` | Create, update, or delete an event |
| POST | `/uploads/portrait` | Upload a portrait image |

---

## The World Calendar

This project uses a fully custom calendar system:

- **4 seasons:** Foeduhn's Patience · Aumma's Mercy · Malthana's Harvest · Ambrik's Thaw
- **9 named weeks per season:** Aumma, Eaden, Sorra, Harmu, Iianu, Xo, Ambrik, Foeduhn, Rin
- **4 Brón transition weeks** between seasons: Breith, Mair, Bás, Anaithnid
- **9 days per week**, numbered 1–9
- **360 days per year**
- **Year format:** `Dr-58`

Example dates: `5th of Iianu of Ambrik's Thaw` or `3rd of Brón: Bás`

---

## Design System

The UI uses a heraldic fantasy theme: **royal blue, gold, and parchment**.

**Fonts:**
- *Cinzel* — headings and labels (serif, heraldic)
- *EB Garamond* — body text (elegant serif)

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

## Portrait Images

Portraits are uploaded via `POST /api/uploads/portrait` (multipart form data) and stored in `backend/wwwroot/images/portraits/` as UUID-named files. They are served statically and displayed on resident and notable figure cards.

---

## Development Notes

- `EstateTask` is used as the C# model name (instead of `Task`) to avoid a conflict with `System.Threading.Tasks.Task`.
- `EstateTaskStatus` is the enum name for the same reason.
- The `Role` field on Residents is nullable — guard against null before calling string methods.
- `ReferenceHandler.IgnoreCycles` is configured in `Program.cs` to prevent infinite JSON serialisation loops from circular navigation properties.
- Portrait blob URLs from `URL.createObjectURL` are temporary and don't persist — always upload through the API endpoint.

---

## Adding a Migration

Whenever you make changes to a model, you need to create and apply a migration:

```bash
cd backend/HouseRiant/HouseRiant
dotnet ef migrations add YourMigrationName
dotnet ef database update
```

---

## Future Plans

- Raspberry Pi self-hosted deployment
- Ledger entries table for full financial history
- Recruitment prospects tracking
- Image upload support for Notable Figures