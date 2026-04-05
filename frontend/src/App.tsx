import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ResidentsPage from './pages/ResidentsPage'
import './styles.css'

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
      <BrowserRouter>
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
              <Route path="/notable-figures" element={<Placeholder title="Notable Figures" />} />
              <Route path="/families" element={<Placeholder title="Families" />} />
              <Route path="/buildings" element={<Placeholder title="Buildings" />} />
              <Route path="/tasks" element={<Placeholder title="Tasks" />} />
              <Route path="/inventory" element={<Placeholder title="Inventory" />} />
              <Route path="/finances" element={<Placeholder title="Finances" />} />
              <Route path="/calendar" element={<Placeholder title="Calendar" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
