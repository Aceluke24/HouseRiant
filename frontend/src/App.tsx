import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ResidentsPage from './pages/ResidentsPage'
import FocusViewPage from './pages/FocusViewPage'
import { FocusProvider } from './context/FocusContext'
import FocusBar from './components/focus/FocusBar'
import './styles.css'
import FamiliesPage from './pages/FamiliesPage'
import NotableFiguresPage from './pages/NotableFiguresPage'
import GroupsPage from './pages/GroupsPage'
import CalendarPage from './pages/CalendarPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, retry: 1 },
  },
})

function Placeholder({ title }: { title: string }) {
  return (
    <div className="page">
      <div className="page-header"><h1>{title}</h1></div>
      <p style={{ color: 'var(--text-muted)' }}>Coming soon.</p>
    </div>
  )
}

export default function App() {
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
            <aside className="sidebar">
              <div className="sidebar-logo">
                <h1>House Rhiant</h1>
                <p>Estate Manager</p>
              </div>
              <nav className="sidebar-nav">
                <span className="nav-section">People</span>
                <NavLink to="/" className="nav-link" end>⚔ Residents</NavLink>
                <NavLink to="/notable-figures" className="nav-link">👑 Notable Figures</NavLink>
                <NavLink to="/families" className="nav-link">🏠 Families</NavLink>
                <NavLink to="/groups" className="nav-link">👥 Groups</NavLink>
                <NavLink to="/focus" className="nav-link">🎯 Focus View</NavLink>

                <span className="nav-section">Estate</span>
                <NavLink to="/buildings" className="nav-link">🏰 Buildings</NavLink>
                <NavLink to="/tasks" className="nav-link">📋 Tasks</NavLink>
                <NavLink to="/inventory" className="nav-link">📦 Inventory</NavLink>

                <span className="nav-section">Records</span>
                <NavLink to="/finances" className="nav-link">💰 Finances</NavLink>
                <NavLink to="/calendar" className="nav-link">📅 Calendar</NavLink>
              </nav>
            </aside>

            <main className="main-content">
              <Routes>
                <Route path="/" element={<ResidentsPage />} />
                <Route path="/focus" element={<FocusViewPage />} />
                <Route path="/notable-figures" element={<NotableFiguresPage />} />
                <Route path="/families" element={<FamiliesPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/buildings" element={<Placeholder title="Buildings" />} />
                <Route path="/tasks" element={<Placeholder title="Tasks" />} />
                <Route path="/inventory" element={<Placeholder title="Inventory" />} />
                <Route path="/finances" element={<Placeholder title="Finances" />} />
                <Route path="/calendar" element={<CalendarPage />} />
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
