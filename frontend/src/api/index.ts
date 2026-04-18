import axios from 'axios'
import type {
  Resident, CreateResidentRequest,
  NotableFigure, CreateNotableFigureRequest,
  Family, CreateFamilyRequest,
  PersonGroup, PersonGroupMember, CreatePersonGroupRequest, AddGroupMemberRequest,
  Building, CreateBuildingRequest,
  EstateTask, CreateTaskRequest,
  EstateFinances, IncomeSource, CreateIncomeSourceRequest,
  InventoryItem, CreateInventoryItemRequest,
  CalendarEvent, CreateCalendarEventRequest,
} from '../types'

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Families ──────────────────────────────────────────────
export const familiesApi = {
  getAll: () => api.get<Family[]>('/families').then(r => r.data),
  getById: (id: number) => api.get<Family>(`/families/${id}`).then(r => r.data),
  create: (data: CreateFamilyRequest) => api.post<Family>('/families', data).then(r => r.data),
  update: (id: number, data: CreateFamilyRequest) => api.put<Family>(`/families/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/families/${id}`),
}

// ── Residents ─────────────────────────────────────────────
export const residentsApi = {
  getAll: (params?: { search?: string; status?: string }) =>
    api.get<Resident[]>('/residents', { params }).then(r => r.data),
  getById: (id: number) => api.get<Resident>(`/residents/${id}`).then(r => r.data),
  create: (data: CreateResidentRequest) => api.post<Resident>('/residents', data).then(r => r.data),
  update: (id: number, data: CreateResidentRequest) => api.put<Resident>(`/residents/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/residents/${id}`),
  reorder: (items: { id: number; sortOrder: number }[]) => api.put('/residents/reorder', items),
}

// ── Notable Figures ───────────────────────────────────────
export const notableFiguresApi = {
  getAll: (params?: { search?: string; relationship?: string }) =>
    api.get<NotableFigure[]>('/notablefigures', { params }).then(r => r.data),
  getById: (id: number) => api.get<NotableFigure>(`/notablefigures/${id}`).then(r => r.data),
  create: (data: CreateNotableFigureRequest) => api.post<NotableFigure>('/notablefigures', data).then(r => r.data),
  update: (id: number, data: CreateNotableFigureRequest) => api.put<NotableFigure>(`/notablefigures/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/notablefigures/${id}`),
  reorder: (items: { id: number; sortOrder: number }[]) => api.put('/notablefigures/reorder', items),
}

// ── Person Groups ─────────────────────────────────────────
export const personGroupsApi = {
  getAll: () => api.get<PersonGroup[]>('/persongroups').then(r => r.data),
  create: (data: CreatePersonGroupRequest) => api.post<PersonGroup>('/persongroups', data).then(r => r.data),
  update: (id: number, data: CreatePersonGroupRequest) => api.put<PersonGroup>(`/persongroups/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/persongroups/${id}`),
  getMembers: (id: number) => api.get<PersonGroupMember[]>(`/persongroups/${id}/members`).then(r => r.data),
  addMember: (id: number, data: AddGroupMemberRequest) => api.post<PersonGroupMember>(`/persongroups/${id}/members`, data).then(r => r.data),
  removeMember: (groupId: number, memberId: number) => api.delete(`/persongroups/${groupId}/members/${memberId}`),
}

// ── Buildings ─────────────────────────────────────────────
export const buildingsApi = {
  getAll: () => api.get<Building[]>('/buildings').then(r => r.data),
  getById: (id: number) => api.get<Building>(`/buildings/${id}`).then(r => r.data),
  create: (data: CreateBuildingRequest) => api.post<Building>('/buildings', data).then(r => r.data),
  update: (id: number, data: CreateBuildingRequest) => api.put<Building>(`/buildings/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/buildings/${id}`),
  assignResident: (id: number, residentId: number) => api.post(`/buildings/${id}/residents/${residentId}`),
  unassignResident: (id: number, residentId: number) => api.delete(`/buildings/${id}/residents/${residentId}`),
  addAssignment: (id: number, data: { residentId: number; assignmentType?: string }) =>
    api.post(`/buildings/${id}/assignments`, data).then(r => r.data),
  removeAssignment: (id: number, assignmentId: number) => api.delete(`/buildings/${id}/assignments/${assignmentId}`),
}

// ── Tasks ─────────────────────────────────────────────────
export const tasksApi = {
  getAll: (params?: { search?: string; status?: string; category?: string }) =>
    api.get<EstateTask[]>('/tasks', { params }).then(r => r.data),
  getById: (id: number) => api.get<EstateTask>(`/tasks/${id}`).then(r => r.data),
  create: (data: CreateTaskRequest) => api.post<EstateTask>('/tasks', data).then(r => r.data),
  update: (id: number, data: CreateTaskRequest) => api.put<EstateTask>(`/tasks/${id}`, data).then(r => r.data),
  updateStatus: (id: number, status: string) => api.patch(`/tasks/${id}/status`, JSON.stringify(status)),
  delete: (id: number) => api.delete(`/tasks/${id}`),
}

// ── Finances ──────────────────────────────────────────────
export const financesApi = {
  get: () => api.get<EstateFinances>('/finances').then(r => r.data),
  update: (data: EstateFinances) => api.put<EstateFinances>('/finances', data).then(r => r.data),
  getIncomeSources: () => api.get<IncomeSource[]>('/finances/income').then(r => r.data),
  createIncomeSource: (data: CreateIncomeSourceRequest) => api.post<IncomeSource>('/finances/income', data).then(r => r.data),
  updateIncomeSource: (id: number, data: CreateIncomeSourceRequest) => api.put<IncomeSource>(`/finances/income/${id}`, data).then(r => r.data),
  deleteIncomeSource: (id: number) => api.delete(`/finances/income/${id}`),
}

// ── Inventory ─────────────────────────────────────────────
export const inventoryApi = {
  getAll: (params?: { search?: string; category?: string }) =>
    api.get<InventoryItem[]>('/inventory', { params }).then(r => r.data),
  create: (data: CreateInventoryItemRequest) => api.post<InventoryItem>('/inventory', data).then(r => r.data),
  update: (id: number, data: CreateInventoryItemRequest) => api.put<InventoryItem>(`/inventory/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/inventory/${id}`),
}

// ── Calendar ──────────────────────────────────────────────
export const calendarApi = {
  getAll: (params?: { year?: number; season?: string }) =>
    api.get<CalendarEvent[]>('/calendar', { params }).then(r => r.data),
  create: (data: CreateCalendarEventRequest) => api.post<CalendarEvent>('/calendar', data).then(r => r.data),
  update: (id: number, data: CreateCalendarEventRequest) => api.put<CalendarEvent>(`/calendar/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/calendar/${id}`),
}
