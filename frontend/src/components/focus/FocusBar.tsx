import { useNavigate } from 'react-router-dom'
import { useFocus } from '../../context/FocusContext'

// FocusBar floats at the bottom of the screen whenever at least one character
// is in the focus selection. It shows who's selected and a button to go to
// the Focus View page.
export default function FocusBar() {
  const { focusedPeople, removeFromFocus, clearFocus, focusCount } = useFocus()
  const navigate = useNavigate()

  if (focusCount === 0) return null

  return (
    <div className="focus-bar">
      <div className="focus-bar-left">
        <span className="focus-bar-label">Focus</span>
        <div className="focus-bar-chips">
          {focusedPeople.map(p => (
            <span key={`${p.type}-${p.id}`} className="focus-chip">
              <span className="focus-chip-type">
                {p.type === 'resident' ? '⚔' : '👑'}
              </span>
              {p.name}
              <button
                className="focus-chip-remove"
                onClick={() => removeFromFocus(p.id, p.type)}
                title={`Remove ${p.name}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="focus-bar-right">
        <span className="focus-bar-count">{focusCount} selected</span>
        <button className="btn-ghost focus-bar-clear" onClick={clearFocus}>
          Clear all
        </button>
        <button className="btn-primary" onClick={() => navigate('/focus')}>
          View Focus →
        </button>
      </div>
    </div>
  )
}
