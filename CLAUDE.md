# House Riant — Claude Code Context

> Taobh Le Taobh ("Side by side, or Always Faithful")
> Current in-world year: Dr-58

A personal RPG campaign manager for the fantasy world of House Riant.
Tracks estate residents, notable figures, buildings, tasks, finances, inventory, and a custom calendar system.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18 + Vite + TypeScript      |
| UI State  | TanStack Query v5                 |
| Forms     | React Hook Form                   |
| Backend   | ASP.NET Core 10 Web API           |
| ORM       | Entity Framework Core 10          |
| Database  | PostgreSQL                        |
| IDE       | Rider (backend) + VS Code (frontend) |

**Dev ports:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Backend HTTPS: `https://localhost:5000`
- All API calls use `http://localhost:4000/api` as the base URL

---

## Project Structure

```
HouseRiant/
├── CLAUDE.md
├── backend/
│   └── HouseRiant/
│       └── HouseRiant/
│           ├── Controllers/
│           ├── Data/
│           │   └── AppDbContext.cs
│           ├── DTOs/
│           ├── Models/
│           ├── Migrations/
│           ├── wwwroot/
│           │   └── images/portraits/
│           ├── Program.cs
│           └── appsettings.json
└── frontend/
    └── src/
        ├── api/
        │   └── index.ts              ← all API calls, one file
        ├── components/
        │   └── residents/
        │       ├── ResidentForm.tsx
        │       └── ResidentDetail.tsx
        ├── context/
        │   └── FocusContext.tsx
        ├── hooks/
        │   ├── useResidents.ts       ← pattern to follow for all hooks
        │   ├── useFamilies.ts
        │   ├── useNotableFigures.ts
        │   └── useTasks.ts
        ├── pages/
        │   ├── ResidentsPage.tsx     ← most complete page, use as reference
        │   └── FamiliesPage.tsx
        ├── types/
        │   └── index.ts              ← all TypeScript types and enums
        ├── utils/
        │   └── getApiErrorMessage.ts
        ├── App.tsx                   ← router + sidebar
        └── styles.css                ← House Riant theme, do not invent new CSS
```

---

## Running the Project

```bash
# Backend
cd backend/HouseRiant/HouseRiant
dotnet run --launch-profile Main

# Frontend
cd frontend
npm run dev

# After any model change — create and apply a migration
cd backend/HouseRiant/HouseRiant
dotnet ef migrations add MigrationName
dotnet ef database update
```

---

## Coding Conventions

### General
- Always match existing patterns in the codebase — look at `ResidentsPage.tsx` and `useResidents.ts` before writing anything new
- Keep all TypeScript types in `frontend/src/types/index.ts`
- Keep all API calls in `frontend/src/api/index.ts`
- One hook file per resource in `hooks/` (e.g. `useFamilies.ts`)
- One page file per route in `pages/`
- Use `React Hook Form` for all forms — no uncontrolled state for inputs
- Use `TanStack Query` (`useQuery` / `useMutation`) for all data fetching — no raw `useEffect` + `fetch`

### Frontend patterns
- Hooks follow this exact structure (see `useResidents.ts`):
  - `useXxx()` — query
  - `useCreateXxx()` — mutation, invalidates query on success
  - `useUpdateXxx()` — mutation `{ id, data }`, invalidates on success
  - `useDeleteXxx()` — mutation by id, invalidates on success
- Pages follow this structure:
  - Page header with title + "Add" button
  - Toolbar with search input + filter chips
  - Table (and optionally card/grid view)
  - Slide-in detail panel on the right when a row is selected
  - Modal form for add/edit
- Always use CSS classes from `styles.css` — do not write inline styles for layout/theme, only for one-off computed values (e.g. dynamic colors)
- Do not install new npm packages without asking first

### Backend patterns
- Every resource has: Model → DTO → Controller
- Always use a DTO for API input/output — never expose the raw model with navigation properties (causes circular JSON)
- Controllers use a private `ToDto()` helper method to map model → DTO
- Use `[FromBody]` on POST/PUT, `[FromRoute]` on DELETE
- Always `Include()` navigation properties before calling `ToDto()` so counts are accurate
- `EstateTask` is the C# class name (not `Task`) — avoids conflict with `System.Threading.Tasks.Task`
- `EstateTaskStatus` is the enum name (not `TaskStatus`) — same reason
- `Role` on Resident is nullable — always null-check before calling string methods
- `ReferenceHandler.IgnoreCycles` is set in `Program.cs` — don't remove it

---

## Design System

**Theme:** Heraldic fantasy — royal blue, gold, parchment

```css
--blue-deep:    #0f2a5c   /* sidebar background */
--blue-royal:   #1a3f7a   /* primary blue */
--blue-mid:     #2255a4
--gold:         #c8a020   /* primary gold */
--gold-light:   #e8c040
--parchment:    #f7f2e8   /* page background */
--ink:          #0e1a2e   /* primary text */
--ink-muted:    #7a90aa   /* secondary text */
```

**Fonts:**
- `var(--font-heading)` → Cinzel (headings, labels, badges)
- `var(--font-body)` → EB Garamond (body text, notes)

**Key CSS classes (defined in styles.css — use these, don't reinvent):**
- `.page` — page wrapper
- `.page-header` — title row + action button
- `.toolbar` — search + filter row
- `.chip` / `.chip-active` — filter pill buttons
- `.data-table` — styled table, blue header, gold bottom border
- `.person-card` — card view block
- `.detail-panel` — slide-in right panel
- `.detail-header`, `.detail-section`, `.detail-field`, `.detail-label`, `.detail-value`, `.detail-notes`, `.detail-actions`
- `.modal-backdrop` + `.modal` + `.modal-header` + `.modal-close` + `.modal-form` + `.modal-actions`
- `.form-group`, `.form-row`, `.form-label`, `.form-input`, `.form-select`, `.form-textarea`, `.form-error`
- `.btn-primary`, `.btn-secondary`, `.btn-danger`
- `.badge-{status}` — colored status badges
- `.view-toggle` / `.view-btn` — table/grid toggle
- `.row-selected` — highlighted table row

---

## Database Schema (summary)

**Families** — `id, name, origin, expertise, motto, headOfFamily, relationship, allegiance, notes`
**Residents** — `id, name, status, title, role, type, race, gender, age, dailyPayRate, landOwned, appearance, skills, troopType, levelOfRole, notes, imageUrl, familyId`
**NotableFigures** — `id, name, title, role, type, race, gender, age, location, faction, relationship, appearance, skills, isAlive, firstMet, lastSeen, notes, imageUrl, familyId`
**Buildings** — `id, name, type, description, condition, capacityPersons, storageCapacityLbs, isLivable, notes`
**EstateTask** — `id, name, description, status, priority, category, costTin, paymentMethod, paymentNotes, targetDate, completedDate, requirements, outcome, notes, buildingId, assignedFamilyId, assignedResidentId`
**EstateFinances** — single row: `bankBalanceTin, moneyOnHandTin, dorrinFundsTin, loanAmountTin, taxRateTin, taxNotes, currentGameDate, currentSeason, lastUpdated`
**IncomeSources** — `id, name, dailyYieldTin, isActive, notes`
**Inventory** — `id, name, quantity, unit, category, condition, description, estimatedValue, location, notes`
**CalendarEvents** — `id, name, description, type, year, season, week, day, displayDate, sortOrder, notes, linkedTaskId`

---

## Seeded Data

- 7 families: Riant (ruling), Bray, Eldran, Wernan, Dalner, Marven, Hewer — all allegiance: House Riant
- EstateFinances: bank=61 tin, loan=57,022 tin, season="Malthana's Harvest", date="3rd of Brón: Bás"
- IncomeSource: Rhiant Mine = 216 tin/day

---

## Custom Calendar

- 4 seasons: Foeduhn's Patience, Aumma's Mercy, Malthana's Harvest, Ambrik's Thaw
- 9 named weeks per season: Aumma, Eaden, Sorra, Harmu, Iianu, Xo, Ambrik, Foeduhn, Rin
- 4 Brón transition weeks: Brón: Breith, Brón: Mair, Brón: Bás, Brón: Anaithnid
- 9 days per week (numbered 1–9), 360 days per year
- Year format: Dr-58
- Date format: "5th of Iianu of Ambrik's Thaw" or "3rd of Brón: Bás"

---

## Pages Status

| Page            | Route             | Status              |
|-----------------|-------------------|---------------------|
| Residents       | `/`               | ✅ Complete          |
| Focus View      | `/focus`          | ✅ Complete          |
| Families        | `/families`       | ✅ Complete          |
| Notable Figures | `/notable-figures`| ✅ Complete          |
| Buildings       | `/buildings`      | ✅ Complete          |
| Tasks           | `/tasks`          | ⬜ Placeholder       |
| Inventory       | `/inventory`      | ⬜ Placeholder       |
| Finances        | `/finances`       | ⬜ Placeholder       |
| Calendar        | `/calendar`       | ⬜ Placeholder       |

### Build order (dependencies first)
1. ~~Families~~ ✅
2. ~~Notable Figures~~ ✅
3. ~~Buildings~~ ✅ (cards with linked tasks)
4. **Tasks** ← next (most complex — links Buildings, Families, Residents)
5. Inventory (simple table)
6. Finances (two-section page)
7. Calendar (most complex — custom date system, links Tasks)

---

## Portrait Images

- Upload: `POST /api/uploads/portrait` (multipart/form-data) → returns `{ url: "/images/portraits/uuid.jpg" }`
- Stored: `backend/wwwroot/images/portraits/`
- Display: prefix with `http://localhost:4000` → `http://localhost:4000/images/portraits/uuid.jpg`
- Never use `URL.createObjectURL` blob URLs — they don't persist across renders

---

## API Endpoints

| Method          | Endpoint                  | Description                  |
|-----------------|---------------------------|------------------------------|
| GET             | /families                 | All families                 |
| POST/PUT/DELETE | /families/{id}            | CRUD                         |
| GET             | /residents?search=&status=| All residents, filterable    |
| POST/PUT/DELETE | /residents/{id}           | CRUD                         |
| GET             | /notablefigures           | All notable figures          |
| POST/PUT/DELETE | /notablefigures/{id}      | CRUD                         |
| GET             | /buildings                | All buildings with tasks     |
| POST/PUT/DELETE | /buildings/{id}           | CRUD                         |
| GET             | /tasks                    | All tasks                    |
| POST/PUT/DELETE | /tasks/{id}               | CRUD                         |
| PATCH           | /tasks/{id}/status        | Quick status update          |
| GET             | /finances                 | Estate finances snapshot     |
| PUT             | /finances                 | Update finances              |
| GET/POST/DELETE | /finances/income          | Income sources               |
| GET             | /inventory                | All inventory                |
| POST/PUT/DELETE | /inventory/{id}           | CRUD                         |
| GET             | /calendar                 | Calendar events              |
| POST/PUT/DELETE | /calendar/{id}            | CRUD                         |
| POST            | /uploads/portrait         | Upload portrait image        |
