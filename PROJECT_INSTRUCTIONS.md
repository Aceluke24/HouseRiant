# House Riant — Project Instructions

This document contains everything needed to continue development in a new chat session.

---

## Project Overview

A personal RPG campaign manager for the fantasy world of House Riant. Built to track estate residents, notable figures, buildings, tasks, finances, inventory, and a custom calendar system.

**Motto:** Taobh Le Taobh ("Side by side, or Always Faithful")
**Current Year:** Dr-58

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| UI State | TanStack Query v5 |
| Forms | React Hook Form |
| Backend | ASP.NET Core 10 Web API |
| ORM | Entity Framework Core 10 |
| Database | PostgreSQL |
| IDE | Rider (backend) + VS Code / Cursor (frontend) |

**Dev ports:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Backend HTTPS: `https://localhost:5000`
- All API calls use `http://localhost:4000/api` as the base URL

---

## Project Structure

```
HouseRiant/
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
        │   └── index.ts                    ← all API calls, baseURL: http://localhost:4000/api
        ├── components/
        │   ├── CalendarDatePicker.tsx       ← reusable custom calendar date picker (exports parseCalendarDate)
        │   ├── ConfirmModal.tsx
        │   ├── calendar/
        │   │   ├── CalendarForm.tsx
        │   │   └── CalendarDetail.tsx
        │   ├── residents/
        │   │   ├── ResidentForm.tsx
        │   │   └── ResidentDetail.tsx
        │   └── tasks/
        │       ├── TaskForm.tsx
        │       ├── TaskDetail.tsx
        │       └── AddToCalendarModal.tsx  ← date picker modal shown when pinning a task to the calendar
        ├── context/
        │   └── FocusContext.tsx
        ├── hooks/
        │   ├── useResidents.ts
        │   ├── useFamilies.ts
        │   ├── useNotableFigures.ts
        │   ├── useTasks.ts
        │   └── useCalendar.ts
        ├── pages/
        │   ├── ResidentsPage.tsx           ← most complete page, use as reference
        │   ├── FamiliesPage.tsx
        │   ├── NotableFiguresPage.tsx
        │   ├── BuildingsPage.tsx
        │   ├── TasksPage.tsx
        │   └── CalendarPage.tsx
        ├── types/
        │   └── index.ts                    ← all TypeScript types and enums
        ├── utils/
        │   └── getApiErrorMessage.ts
        ├── App.tsx                         ← router + sidebar
        └── styles.css                      ← House Riant theme, do not invent new CSS
```

---

## Database Schema

### Tables

**Families**
- id, name, origin, expertise, motto, headOfFamily, relationship, allegiance, notes
- Related to: Residents (1:many), NotableFigures (1:many)

**Residents** ← people living/working on the estate
- id, name, status, statusOther, title, role, type, race, krellTribe, gender, age
- dailyPayRate, landOwned, appearance, skills, troopType, levelOfRole
- notes, imageUrl, familyId (FK)
- status enum: Resident, HiredHelp, Visitor, Seasonal, Blank, Din, Other
- gender enum: Male, Female

**NotableFigures** ← NPCs outside the estate
- id, name, title, role, type, race, gender, age
- location, faction, relationship, appearance, skills
- isAlive, firstMet, lastSeen, notes, imageUrl, familyId (FK)

**Buildings**
- id, name, type, description, condition, capacityPersons, storageCapacityLbs, isLivable, notes
- type enum: Living, Storage, Defense, Agricultural, Workshop, Religious, Other
- condition enum: Ruined, Poor, Functional, Good, Excellent

**EstateTask** (C# class name: `EstateTask` to avoid conflict with `System.Threading.Tasks.Task`)
- id, name, description, status, priority, category
- costTin, paymentMethod, paymentNotes
- targetDate, completedDate — structured strings e.g. `"5th of Iianu of Ambrik's Thaw, Dr-58"` (use CalendarDatePicker)
- requirements, outcome, notes
- buildingId (FK), assignedFamilyId (FK), assignedResidentId (FK)
- status enum: Planned, InProgress, Completed, Blocked (C#: `EstateTaskStatus`)
- priority enum: Low, Medium, High, Urgent
- category enum: Construction, Recruitment, Procurement, Military, Financial, Agricultural, Diplomatic, Other

**EstateFinances** (single row)
- id, bankBalanceTin, moneyOnHandTin, dorrinFundsTin, loanAmountTin
- taxRateTin, taxNotes, currentGameDate, currentSeason, lastUpdated
- Seeded: bank=61, loan=57022, season="Malthana's Harvest", date="3rd of Brón: Bás"

**IncomeSources**
- id, name, dailyYieldTin, isActive, notes
- Seeded: Rhiant Mine = 216 tin/day

**Inventory**
- id, name, quantity, unit, category, condition, description, estimatedValue, location, notes
- category enum: Animals, Weapons, Tools, Materials, Food, Documents, Clothing, Other
- condition enum: Poor, Fair, Good, Excellent

**CalendarEvents**
- id, name, shortLabel, description, type, year, season, week, day
- endWeek, endDay — optional, for multi-day spanning events
- displayDate, sortOrder, notes
- linkedTaskId (FK → EstateTask, nullable, OnDelete SetNull)
- recurrenceGroupId (nullable int) — all events in a recurring series share the same value
- type enum (C#): Deadline, Battle, Festival, TaskEvent, Note, Other
  - Frontend displays `TaskEvent` as "Task"
  - Do NOT remove `TaskEvent` from the C# enum — it would shift integer ordinals and corrupt existing data

---

## Custom Calendar System

- **4 seasons:** Foeduhn's Patience, Aumma's Mercy, Malthana's Harvest, Ambrik's Thaw
- **9 weeks per season:** Aumma, Eaden, Sorra, Harmu, Iianu, Xo, Ambrik, Foeduhn, Rin
- **4 Brón transition weeks:** Brón: Breith, Brón: Mair, Brón: Bás, Brón: Anaithnid
  - Brón seasons have NO named weeks — just 9 numbered days
- **9 days per week** (numbered 1-9)
- **360 days per year**
- **Year format:** Dr-58

**Date string format:**
- Regular: `"5th of Iianu of Ambrik's Thaw, Dr-58"`
- Brón: `"3rd of Brón: Bás, Dr-58"`

**Always use `CalendarDatePicker`** for any date input — it guarantees the format is correct and parseable. The component exports `parseCalendarDate()` for parsing these strings back into `{ year, season, week, day }`.

---

## Families (seeded in DB)

| id | Name | Allegiance |
|----|------|------------|
| 1 | Riant | House Riant — ruling family |
| 2 | Bray | House Riant |
| 3 | Eldran | House Riant |
| 4 | Wernan | House Riant |
| 5 | Dalner | House Riant |
| 6 | Marven | House Riant |
| 7 | Hewer | House Riant |

Note: "Din" is a title, not a family. Members of the ruling family have "Din" as their title and belong to the Riant family.

---

## Design System

**Theme:** House Riant heraldic — royal blue, gold, parchment

**CSS Variables (key ones):**
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
- Headings/labels: Cinzel (serif, heraldic)
- Body/content: EB Garamond (elegant serif)

**Key CSS classes (never invent new ones — add to styles.css if needed):**
- `.page` — page wrapper with padding
- `.page-header` — title + action button row
- `.toolbar` — search + filters row
- `.data-table` — styled table with blue header, gold bottom border
- `.person-card` — card view block for residents
- `.detail-panel` — slide-out detail panel on right
- `.modal-backdrop` + `.modal` — form modals
- `.badge-{status}` — colored status badges (planned, inprogress, completed, blocked, low, medium, high, urgent, battle, task)
- `.btn-primary` / `.btn-secondary` / `.btn-danger` / `.btn-ghost`
- `.chip` / `.chip-active` — filter pill buttons
- `.view-toggle` / `.view-btn` — table/grid toggle
- `.kanban-board` / `.kanban-col` / `.kanban-card` — kanban layout
- `.cal-*` — calendar grid classes

---

## API Endpoints

All endpoints at `http://localhost:4000/api/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /families | All families |
| POST/PUT/DELETE | /families/{id} | CRUD |
| GET | /residents?search=&status= | All residents, filterable |
| POST/PUT/DELETE | /residents/{id} | CRUD |
| GET | /notablefigures?search=&relationship= | All notable figures |
| POST/PUT/DELETE | /notablefigures/{id} | CRUD |
| GET | /buildings | All buildings with tasks |
| POST/PUT/DELETE | /buildings/{id} | CRUD |
| GET | /tasks?search=&status=&category= | All tasks |
| POST/PUT/DELETE | /tasks/{id} | CRUD |
| PATCH | /tasks/{id}/status | Quick status update (Kanban drag-drop) |
| GET | /finances | Estate finances snapshot |
| PUT | /finances | Update finances |
| GET/POST/DELETE | /finances/income | Income sources |
| GET | /inventory?search=&category= | All inventory |
| POST/PUT/DELETE | /inventory/{id} | CRUD |
| GET | /calendar?year=&season= | Calendar events |
| POST/PUT/DELETE | /calendar/{id} | Single event CRUD |
| POST | /calendar/batch | Batch-create recurring events (assigns shared RecurrenceGroupId) |
| DELETE | /calendar/group/{groupId} | Delete all events in a recurring series |
| POST | /uploads/portrait | Upload portrait image → returns { url } |

---

## Pages Status

| Page | Route | Status | Notes |
|------|-------|--------|-------|
| Residents | / | ✅ Complete | Table + card, search, filter, portraits, detail panel |
| Focus View | /focus | ✅ Complete | Resident focus/spotlight view |
| Families | /families | ✅ Complete | CRUD, member counts |
| Notable Figures | /notable-figures | ✅ Complete | Table + card, portraits, search, filter |
| Buildings | /buildings | ✅ Complete | Cards with linked task counts |
| Tasks | /tasks | ✅ Complete | Table + Kanban, drag-drop status, Task↔Calendar integration |
| Calendar | /calendar | ✅ Complete | Visual grid, recurring events, auto-scroll to today, multi-select season filter, Task↔Calendar integration |
| Inventory | /inventory | ✅ Complete | Table, multi-select category filter, CRUD |
| Finances | /finances | ✅ Complete | Estate snapshot + income sources table |

---

## Task ↔ Calendar Integration

Tasks and calendar events are linked bidirectionally:

- `CalendarEvent.LinkedTaskId` (FK, nullable) — points back to the originating task
- From **TaskDetail**: "+ Calendar" button opens `AddToCalendarModal`
  - User picks: Target Date / Completion Date (parsed from CalendarDatePicker format) / Custom Date
  - Creates a `TaskEvent`-type calendar event with `linkedTaskId` set
- From **CalendarPage**: "+ Add Task" button opens `TaskForm` directly
- `AddToCalendarModal` imports `parseCalendarDate` from `CalendarDatePicker` to parse date strings

## Recurring Calendar Events

- `CalendarEvent.RecurrenceGroupId` — nullable int; all instances in a series share the same value
- `POST /calendar/batch` — creates a list of events, assigning `MAX(RecurrenceGroupId) + 1` as the group ID
- `DELETE /calendar/group/{groupId}` — deletes all events with that group ID
- Frontend: `useCreateRecurringCalendarEvents` / `useDeleteCalendarEventGroup` hooks
- CalendarForm shows a "Make recurring" checkbox in create mode; generates one event per week per selected season(s)
- CalendarDetail shows "Delete Series" button when `recurrenceGroupId` is set
- Calendar grid chips show `↻` prefix for recurring events

---

## Coding Conventions

### General
- Always match existing patterns — look at `ResidentsPage.tsx` and `useResidents.ts` before writing anything new
- Keep all TypeScript types in `frontend/src/types/index.ts`
- Keep all API calls in `frontend/src/api/index.ts`
- One hook file per resource in `hooks/`
- Use React Hook Form for all forms — no uncontrolled state for inputs
- Use TanStack Query for all data fetching — no raw `useEffect` + `fetch`

### Frontend patterns
Hook structure (see `useResidents.ts`):
- `useXxx()` — query
- `useCreateXxx()` — mutation, invalidates query on success
- `useUpdateXxx()` — mutation `{ id, data }`, invalidates on success
- `useDeleteXxx()` — mutation by id, invalidates on success

Page structure:
- Page header with title + "Add" button
- Toolbar with search input + filter chips
- Table (and optionally kanban/card view)
- Slide-in detail panel on the right when a row is selected
- Modal form for add/edit

**Selected item pattern:** Always store `selectedId: number | null` and derive the live object from the query data — never store the full object in state. This ensures the detail panel reflects edits immediately after a mutation refetch.

```ts
const [selectedId, setSelectedId] = useState<number | null>(null)
const selected = selectedId != null ? items.find(i => i.id === selectedId) ?? null : null
```

### Backend patterns
- Every resource: Model → DTO → Controller
- Always use a DTO for API input/output — never expose raw model with navigation properties
- Controllers use a private `ToDto()` helper to map model → DTO
- Use `[FromBody]` on POST/PUT, `[FromRoute]` on DELETE
- Always `Include()` navigation properties before calling `ToDto()`
- `EstateTask` / `EstateTaskStatus` to avoid conflict with `System.Threading.Tasks`
- `ReferenceHandler.IgnoreCycles` is set in `Program.cs` — don't remove it

---

## Portrait Images

- Upload: `POST /api/uploads/portrait` (multipart/form-data) → returns `{ url: "/images/portraits/uuid.jpg" }`
- Stored: `backend/wwwroot/images/portraits/`
- Display: prefix with `http://localhost:4000`
- Never use `URL.createObjectURL` blob URLs — they don't persist across renders

---

## Running the Project

**Backend:**
```bash
cd backend/HouseRiant/HouseRiant
dotnet run --launch-profile Main
```

**Frontend:**
```bash
cd frontend
npm run dev
```

**After any model change:**
```bash
cd backend/HouseRiant/HouseRiant
dotnet ef migrations add MigrationName
dotnet ef database update
```

---

## Known Issues / Notes

- `EstateTask` / `EstateTaskStatus` — C# names to avoid `System.Threading.Tasks` conflict
- `Role` on Resident is nullable — null-check before calling string methods
- Portrait blob URLs don't persist — always upload through the API
- `ReferenceHandler.IgnoreCycles` in Program.cs — prevents circular JSON serialization
- `TaskEvent` kept in C# enum for backward compatibility; removing it would shift enum ordinals
- Do not install new npm packages without checking first

---

## Future Plans

- Raspberry Pi self-hosted deployment
- Ledger entries for full financial history
- Recruitment prospects tracking
