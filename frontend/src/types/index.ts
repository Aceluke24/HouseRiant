// ── Enums ──────────────────────────────────────────────────

export type PersonStatus = 'Resident' | 'HiredHelp' | 'Visitor' | 'Seasonal' | 'Blank' | 'Din' | 'Other'
export type Gender = 'Male' | 'Female'
export type BuildingType = 'Living' | 'Storage' | 'Defense' | 'Agricultural' | 'Workshop' | 'Religious' | 'Other'
export type BuildingCondition = 'Ruined' | 'Poor' | 'Functional' | 'Good' | 'Excellent'
export type EstateTaskStatus = 'Planned' | 'InProgress' | 'Completed' | 'Blocked'
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent'
export type TaskCategory = 'Construction' | 'Recruitment' | 'Procurement' | 'Military' | 'Financial' | 'Agricultural' | 'Diplomatic' | 'Other'
export type InventoryCategory = 'Animals' | 'Weapons' | 'Tools' | 'Materials' | 'Food' | 'Documents' | 'Clothing' | 'Other'
export type InventoryCondition = 'Poor' | 'Fair' | 'Good' | 'Excellent'
export type CalendarEventType = 'Deadline' | 'Battle' | 'Festival' | 'TaskEvent' | 'Note' | 'Other'

// ── Families ──────────────────────────────────────────────

export interface Family {
  id: number
  name: string
  allegiance?: string
  notes?: string
  residents?: Resident[]
  notableFigures?: NotableFigure[]
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
}

export interface CreateResidentRequest {
  name: string
  status: PersonStatus
  statusOther?: string
  title?: string
  role?: string
  type?: string
  race?: string
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
}

// ── Notable Figures ───────────────────────────────────────

export interface NotableFigure {
  id: number
  name: string
  title?: string
  role?: string
  type?: string
  race?: string
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
  familyId?: number
  familyName?: string
}

export interface CreateNotableFigureRequest {
  name: string
  title?: string
  role?: string
  type?: string
  race?: string
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
  familyId?: number
}

// ── Buildings ─────────────────────────────────────────────

export interface Building {
  id: number
  name: string
  type: BuildingType
  description?: string
  condition: BuildingCondition
  capacityPersons?: number
  storageCapacityLbs?: number
  isLivable: boolean
  notes?: string
  tasks?: EstateTask[]
}

export interface CreateBuildingRequest {
  name: string
  type: BuildingType
  description?: string
  condition: BuildingCondition
  capacityPersons?: number
  storageCapacityLbs?: number
  isLivable: boolean
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

// ── Estate Finances ───────────────────────────────────────

export interface EstateFinances {
  id: number
  bankBalanceTin: number
  moneyOnHandTin: number
  dorrinFundsTin: number
  loanAmountTin: number
  taxRateTin: number
  taxNotes?: string
  currentGameDate?: string
  currentSeason?: string
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
}
