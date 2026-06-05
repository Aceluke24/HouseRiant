import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import HomePage from './pages/HomePage'
import ResidentsPage from './pages/ResidentsPage'
import FocusViewPage from './pages/FocusViewPage'
import { FocusProvider } from './context/FocusContext'
import FocusBar from './components/focus/FocusBar'
import './styles.css'
import FamiliesPage from './pages/FamiliesPage'
import NotableFiguresPage from './pages/NotableFiguresPage'
import GroupsPage from './pages/GroupsPage'
import CalendarPage from './pages/CalendarPage'
import BuildingsPage from './pages/BuildingsPage'
import TasksPage from './pages/TasksPage'
import InventoryPage from './pages/InventoryPage'
import FinancesPage from './pages/FinancesPage'
import ChroniclePage from './pages/ChroniclePage'
import WorldMapPage from './pages/WorldMapPage'
import GodsPage from './pages/GodsPage'
import SkillsPage from './pages/SkillsPage'
import ShopPage from './pages/ShopPage'
import OrganizationsPage from './pages/OrganizationsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, retry: 1 },
  },
})

// function Placeholder({ title }: { title: string }) {
//   return (
//     <div className="page">
//       <div className="page-header"><h1>{title}</h1></div>
//       <p style={{ color: 'var(--text-muted)' }}>Coming soon.</p>
//     </div>
//   )
// }

export default function App() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      {/*
        FocusProvider wraps everything inside the router so that any page
        (Residents, Notable Figures, etc.) can read and update the focus
        selection. FocusBar also needs the router for navigation, so it
        sits inside BrowserRouter.
      */}
      <BrowserRouter>
        <FocusProvider>
          <div className="app-layout">
            <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>

              {/* Header */}
              <div className="sidebar-logo">
                {!collapsed && (
                  <>
                    <h1>House Riant</h1>
                    <p>Estate Manager</p>
                  </>
                )}
              </div>

              {/* Bulge toggle */}
              <button
                className="sidebar-toggle-bulge"
                onClick={() => setCollapsed(c => !c)}
                aria-label="Toggle sidebar"
              >
                <svg viewBox="0 0 30 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0 Q30 0 30 14 L30 42 Q30 56 0 56 Z" fill="#3d2c0e" stroke="#8a6618" strokeWidth="1"/>
                  {collapsed ? (
                    <>
                      <polyline points="8,18 16,28 8,38" stroke="#c8a020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.75"/>
                      <polyline points="14,18 22,28 14,38" stroke="#c8a020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.75"/>
                    </>
                  ) : (
                    <>
                      <polyline points="22,18 14,28 22,38" stroke="#c8a020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.75"/>
                      <polyline points="16,18 8,28 16,38" stroke="#c8a020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.75"/>
                    </>
                  )}
                </svg>
              </button>

              <div className="sidebar-nav-scroll">
              <nav className="sidebar-nav">

                {/* Home — standalone */}
                <div className="sidebar-home-item">
                  <NavLink to="/" className="nav-link" end title="Home">
                    <span className="nav-icon">🏠</span>
                    {!collapsed && <span>Home</span>}
                  </NavLink>
                </div>

                {/* People */}
                {!collapsed && <span className="nav-section">People</span>}
                <div className="sidebar-nav-group">
                  <NavLink to="/residents" className="nav-link" title="Residents">
                    <span className="nav-icon">⚔</span>
                    {!collapsed && <span>Residents</span>}
                  </NavLink>
                  <NavLink to="/notable-figures" className="nav-link" title="Notable Figures">
                    <span className="nav-icon">👑</span>
                    {!collapsed && <span>Notable Figures</span>}
                  </NavLink>
                  <NavLink to="/families" className="nav-link" title="Families">
                    <span className="nav-icon">🏠</span>
                    {!collapsed && <span>Families</span>}
                  </NavLink>
                  <NavLink to="/groups" className="nav-link" title="Groups">
                    <span className="nav-icon">👥</span>
                    {!collapsed && <span>Groups</span>}
                  </NavLink>
                  <NavLink to="/organizations" className="nav-link" title="Organizations">
                    <span className="nav-icon">⚜</span>
                    {!collapsed && <span>Organizations</span>}
                  </NavLink>
                  <NavLink to="/focus" className="nav-link nav-link-last" title="Focus View">
                    <span className="nav-icon">🎯</span>
                    {!collapsed && <span>Focus View</span>}
                  </NavLink>
                </div>

                {/* Lore */}
                {!collapsed && <span className="nav-section">Lore</span>}
                <div className="sidebar-nav-group">
                  <NavLink to="/lore/gods" className="nav-link" title="Gods">
                    <span className="nav-icon">✦</span>
                    {!collapsed && <span>Gods</span>}
                  </NavLink>
                  <NavLink to="/lore/skills" className="nav-link" title="Skills">
                    <span className="nav-icon">📚</span>
                    {!collapsed && <span>Skills</span>}
                  </NavLink>
                  <NavLink to="/lore/shop" className="nav-link nav-link-last" title="Shop">
                    <span className="nav-icon">🪙</span>
                    {!collapsed && <span>Shop</span>}
                  </NavLink>
                </div>

                {/* Estate */}
                {!collapsed && <span className="nav-section">Estate</span>}
                <div className="sidebar-nav-group">
                  <NavLink to="/buildings" className="nav-link" title="Buildings">
                    <span className="nav-icon">🏰</span>
                    {!collapsed && <span>Buildings</span>}
                  </NavLink>
                  <NavLink to="/tasks" className="nav-link" title="Tasks">
                    <span className="nav-icon">📋</span>
                    {!collapsed && <span>Tasks</span>}
                  </NavLink>
                  <NavLink to="/inventory" className="nav-link" title="Inventory">
                    <span className="nav-icon">📦</span>
                    {!collapsed && <span>Inventory</span>}
                  </NavLink>
                  <NavLink to="/world-map" className="nav-link nav-link-last" title="World Map">
                    <span className="nav-icon">🗺</span>
                    {!collapsed && <span>World Map</span>}
                  </NavLink>
                </div>

                {/* Records */}
                {!collapsed && <span className="nav-section">Records</span>}
                <div className="sidebar-nav-group">
                  <NavLink to="/finances" className="nav-link" title="Finances">
                    <span className="nav-icon">💰</span>
                    {!collapsed && <span>Finances</span>}
                  </NavLink>
                  <NavLink to="/calendar" className="nav-link" title="Calendar">
                    <span className="nav-icon">📅</span>
                    {!collapsed && <span>Calendar</span>}
                  </NavLink>
                  <NavLink to="/chronicle" className="nav-link nav-link-last" title="Chronicle">
                    <span className="nav-icon">📖</span>
                    {!collapsed && <span>Chronicle</span>}
                  </NavLink>
                </div>

              </nav>

              {/* Bottom bar */}
              <div className="sidebar-bottom-bar">
                <span className="sidebar-bottom-dot" />
                {!collapsed && <span className="sidebar-bottom-text">DR-58</span>}
              </div>
              </div>{/* end sidebar-nav-scroll */}

            </aside>

            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/residents" element={<ResidentsPage />} />
                <Route path="/focus" element={<FocusViewPage />} />
                <Route path="/notable-figures" element={<NotableFiguresPage />} />
                <Route path="/families" element={<FamiliesPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/buildings" element={<BuildingsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/finances" element={<FinancesPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/chronicle" element={<ChroniclePage />} />
                <Route path="/world-map" element={<WorldMapPage />} />
                <Route path="/lore/gods" element={<GodsPage />} />
                <Route path="/lore/skills" element={<SkillsPage />} />
                <Route path="/lore/shop" element={<ShopPage />} />
                <Route path="/organizations" element={<OrganizationsPage />} />
              </Routes>
            </main>
          </div>

          {/*
            FocusBar floats at the bottom of the screen, on top of everything.
            It only renders when at least one character is selected, so it's
            invisible otherwise and doesn't take up any space.
          */}
          <FocusBar />
        </FocusProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
