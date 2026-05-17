// ── Enums ──────────────────────────────────────────────────

export type PersonStatus = 'Resident' | 'HiredHelp' | 'Visitor' | 'Seasonal' | 'Blank' | 'Din' | 'Other'
export type Gender = 'Male' | 'Female'
export type BuildingType = 'Living' | 'Storage' | 'Defense' | 'Agricultural' | 'Workshop' | 'Religious' | 'Other'
export type BuildingCondition = 'Ruined' | 'Poor' | 'Functional' | 'Good' | 'Excellent'
export type EstateTaskStatus = 'Planned' | 'InProgress' | 'Completed' | 'Blocked'
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent'
export type TaskCategory = 'Construction' | 'Recruitment' | 'Procurement' | 'Military' | 'Financial' | 'Agricultural' | 'Diplomatic' | 'Other'
export type InventoryCategory = 'Animals' | 'Weapons' | 'Tools' | 'Materials' | 'Food' | 'Documents' | 'Clothing' | 'Other' | 'Armor' | 'Medicine' | 'MagicItems' | 'Valuables' | 'Equipment'
export type InventoryCondition = 'Poor' | 'Fair' | 'Good' | 'Excellent'
export type CalendarEventType = 'Deadline' | 'Battle' | 'Festival' | 'Note' | 'TaskEvent' | 'Other'
export type FamilyRelationship = 'Ally' | 'Friend' | 'Neutral' | 'Foe' | 'Vassal' | 'Rival' | 'Unknown'


// ── Families ──────────────────────────────────────────────

export interface Family {
  id: number
  name: string
  origin?: string          // city / region they hail from
  expertise?: string       // what the family is known for
  motto?: string           // house motto
  headOfFamily?: string    // name of the current head
  relationship?: string    // relationship to House Riant
  allegiance?: string      // legacy field, keep for existing data
  notes?: string
  residentCount?: number   // computed by backend
  notableFigureCount?: number
  residents?: Resident[]
  notableFigures?: NotableFigure[]
}

export interface CreateFamilyRequest {
  name: string
  origin?: string
  expertise?: string
  motto?: string
  headOfFamily?: string
  relationship?: string
  allegiance?: string
  notes?: string
}

// ── Residents ─────────────────────────────────────────────

export interface Resident {
  id: number
  name: string
  status: PersonStatus
  statusOther?: string
  title?: string
  role?: string
  type?: string
  race?: string
  krellTribe?: string
  gender?: Gender
  age?: number
  dailyPayRate?: number
  landOwned?: string
  appearance?: string
  skills?: string
  troopType?: string
  levelOfRole?: string
  imageUrl?: string
  notes?: string
  familyId?: number
  familyName?: string
  sortOrder?: number
  buildingId?: number
  buildingName?: string
  showOnHomePage: boolean
}

export interface CreateResidentRequest {
  name: string
  status: PersonStatus
  statusOther?: string
  title?: string
  role?: string
  type?: string
  race?: string
  krellTribe?: string
  gender?: Gender
  age?: number
  dailyPayRate?: number
  landOwned?: string
  appearance?: string
  skills?: string
  troopType?: string
  levelOfRole?: string
  imageUrl?: string
  notes?: string
  familyId?: number
  showOnHomePage?: boolean
}

// ── Notable Figures ───────────────────────────────────────

export interface NotableFigure {
  id: number
  name: string
  title?: string
  role?: string
  type?: string
  race?: string
  krellTribe?: string
  gender?: Gender
  age?: number
  location?: string
  faction?: string
  relationship?: string
  appearance?: string
  skills?: string
  isAlive: boolean
  firstMet?: string
  lastSeen?: string
  notes?: string
  imageUrl?: string
  familyId?: number
  familyName?: string
  sortOrder?: number
}

export interface CreateNotableFigureRequest {
  name: string
  title?: string
  role?: string
  type?: string
  race?: string
  krellTribe?: string
  gender?: Gender
  age?: number
  location?: string
  faction?: string
  relationship?: string
  appearance?: string
  skills?: string
  isAlive: boolean
  firstMet?: string
  lastSeen?: string
  notes?: string
  imageUrl?: string
  familyId?: number
}

// ── Person Groups ─────────────────────────────────────────

export interface PersonGroup {
  id: number
  name: string
  description?: string
  color?: string
  memberCount?: number
}

export interface PersonGroupMember {
  id: number
  groupId: number
  residentId?: number
  residentName?: string
  residentImageUrl?: string
  notableFigureId?: number
  notableFigureName?: string
  notableFigureImageUrl?: string
}

export interface CreatePersonGroupRequest {
  name: string
  description?: string
  color?: string
}

export interface AddGroupMemberRequest {
  residentId?: number
  notableFigureId?: number
}

// ── Buildings ─────────────────────────────────────────────

export interface BuildingResidentSummary {
  id: number
  name: string
  imageUrl?: string
}

export interface BuildingAssignment {
  id: number
  residentId: number
  residentName: string
  residentImageUrl?: string
  assignmentType?: string
}

export interface Building {
  id: number
  name: string
  type: BuildingType
  description?: string
  condition: BuildingCondition
  capacityPersons?: number
  storageCapacityLbs?: number
  isLivable: boolean
  imageUrl?: string
  imagePosition?: string    // CSS object-position, e.g. "center", "top left"
  notes?: string
  tasks?: { id: number; name: string; status: string }[]
  residents?: BuildingResidentSummary[]
  assignments?: BuildingAssignment[]
}

export interface CreateBuildingRequest {
  name: string
  type: BuildingType
  description?: string
  condition: BuildingCondition
  capacityPersons?: number
  storageCapacityLbs?: number
  isLivable: boolean
  imageUrl?: string
  imagePosition?: string
  notes?: string
}

// ── Tasks ─────────────────────────────────────────────────

export interface EstateTask {
  id: number
  name: string
  description?: string
  status: EstateTaskStatus
  priority: TaskPriority
  category: TaskCategory
  costTin?: number
  paymentMethod?: string
  paymentNotes?: string
  targetDate?: string
  completedDate?: string
  requirements?: string
  outcome?: string
  notes?: string
  buildingId?: number
  buildingName?: string
  assignedFamilyId?: number
  assignedFamilyName?: string
  assignedResidentId?: number
  assignedResidentName?: string
}

export interface CreateTaskRequest {
  name: string
  description?: string
  status: EstateTaskStatus
  priority: TaskPriority
  category: TaskCategory
  costTin?: number
  paymentMethod?: string
  paymentNotes?: string
  targetDate?: string
  completedDate?: string
  requirements?: string
  outcome?: string
  notes?: string
  buildingId?: number
  assignedFamilyId?: number
  assignedResidentId?: number
}

// ── Game State ────────────────────────────────────────────

export interface GameState {
  id: number
  currentYear: number
  currentSeason?: string
  currentWeek?: string   // null for Brón transition seasons
  currentDay: number
}

export interface UpdateGameDateRequest {
  currentYear: number
  currentSeason: string
  currentWeek?: string
  currentDay: number
}

// ── Estate Finances ───────────────────────────────────────

export interface EstateFinances {
  id: number
  bankBalanceTin: number
  moneyOnHandTin: number
  dorrinFundsTin: number
  loanAmountTin: number
  taxRateTin: number
  taxNotes?: string
  lastUpdated: string
}

export interface IncomeSource {
  id: number
  name: string
  dailyYieldTin: number
  isActive: boolean
  notes?: string
}

export interface CreateIncomeSourceRequest {
  name: string
  dailyYieldTin: number
  isActive: boolean
  notes?: string
}

// ── Inventory ─────────────────────────────────────────────

export interface InventoryItem {
  id: number
  name: string
  quantity: number
  unit?: string
  category: InventoryCategory
  condition?: InventoryCondition
  description?: string
  estimatedValue?: number
  location?: string
  notes?: string
}

export interface CreateInventoryItemRequest {
  name: string
  quantity: number
  unit?: string
  category: InventoryCategory
  condition?: InventoryCondition
  description?: string
  estimatedValue?: number
  location?: string
  notes?: string
}

// ── Calendar ──────────────────────────────────────────────

export const SEASONS = [
  "Foeduhn's Patience",
  "Brón: Breith",
  "Aumma's Mercy",
  "Brón: Mair",
  "Malthana's Harvest",
  "Brón: Bás",
  "Ambrik's Thaw",
  "Brón: Anaithnid",
] as const

export const WEEKS = [
  'Aumma', 'Eaden', 'Sorra', 'Harmu',
  'Iianu', 'Xo', 'Ambrik', 'Foeduhn', 'Rin'
] as const

export type Season = typeof SEASONS[number]
export type Week = typeof WEEKS[number]

export interface CalendarEvent {
  id: number
  name: string
  description?: string
  type: CalendarEventType
  year: number
  season: string
  week?: string
  day: number
  displayDate: string
  sortOrder: number
  notes?: string
  linkedTaskId?: number
  recurrenceGroupId?: number  // set on recurring events — all instances share the same group id
  shortLabel?: string   // custom short text shown in the grid (falls back to name)
  endWeek?: string      // end week for multi-day events (null = same week as start)
  endDay?: number       // end day 1-9 (null = same day as start)
}

// ── Chronicle ─────────────────────────────────────────────

export interface TagSummary {
  id: number
  name: string
  color?: string
}

export interface LinkedPersonSummary {
  id: number
  name: string
}

export interface ChronicleEntry {
  id: number
  title: string
  body: string
  entryDate?: string
  createdAt: string
  tags: TagSummary[]
  residents: LinkedPersonSummary[]
  notableFigures: LinkedPersonSummary[]
}

export interface CreateChronicleEntryRequest {
  title: string
  body: string
  entryDate?: string
  tagIds?: number[]
  residentIds?: number[]
  notableFigureIds?: number[]
}

export interface Tag {
  id: number
  name: string
  color?: string
}

export interface CreateTagRequest {
  name: string
  color?: string
}

export interface CreateCalendarEventRequest {
  name: string
  description?: string
  type: CalendarEventType
  year: number
  season: string
  week?: string
  day: number
  displayDate: string
  sortOrder: number
  notes?: string
  linkedTaskId?: number
  shortLabel?: string
  endWeek?: string
  endDay?: number
}
