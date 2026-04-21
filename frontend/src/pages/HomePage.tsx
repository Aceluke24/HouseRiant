import crestImage from '../assets/crest.png'
import { useResidents } from '../hooks/useResidents'
import { useGameState } from '../hooks/useGameState'
import type { Resident } from '../types'

// ── Helpers ───────────────────────────────────────────────

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

function formatGameDate(season: string | undefined, week: string | undefined, day: number): string {
  if (!season) return '—'
  const weekPart = week ? `${week} of ` : ''
  return `${ordinal(day)} of ${weekPart}${season}`
}

function trimToWordBoundary(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  const cut = text.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…'
}

// ── Particle ──────────────────────────────────────────────

interface ParticleProps {
  index: number
}

function Particle({ index }: ParticleProps) {
  const seed = index * 137.508
  const left = 2 + ((seed * 3.7) % 96)
  const size = 2 + ((seed * 1.3) % 3)
  const duration = 10 + ((seed * 0.9) % 12)
  const delay = (seed * 0.4) % 15

  return (
    <span
      style={{
        position: 'absolute',
        left: `${left}%`,
        bottom: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(200, 160, 32, 0.7)',
        pointerEvents: 'none',
        willChange: 'transform',
        animationName: 'particleDrift',
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        animationFillMode: 'both',
      }}
    />
  )
}

// ── Lord Card ─────────────────────────────────────────────

function LordCard({ resident, index }: { resident: Resident; index: number }) {
  // Candle flicker: randomize duration/delay per card for subtle difference
  const flickerDuration = 2.8 + (index % 3) * 0.7 + (index * 0.13)
  const flickerDelay = (index * 0.37) % 2.1
  const imageUrl = resident.imageUrl
    ? resident.imageUrl
    : null
  const bio = resident.notes ? trimToWordBoundary(resident.notes, 65) : null

  // Give each card a unique animation name for flicker
  const flickerAnimName = `candleFlicker${index % 5}`;
  return (
    <div
      className="home-lord-card-wrapper"
      style={{
        animationName: flickerAnimName,
        animationDuration: `${flickerDuration}s`,
        animationDelay: `${flickerDelay}s`,
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
      }}
    >
      <div className="home-lord-card">
        {/* Portrait with staggered ink reveal */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={resident.name}
            className="lord-portrait-ink"
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              animationName: 'inkReveal',
              animationDuration: '2.6s',
              animationTimingFunction: 'ease-out',
              animationFillMode: 'both',
              animationDelay: `${index * 180}ms`,
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            background: 'var(--blue-royal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="16" r="10" fill="rgba(200,160,32,0.4)" />
              <path d="M4 44 C4 30 44 30 44 44" fill="rgba(200,160,32,0.4)" />
            </svg>
          </div>
        )}

        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          width: '100%', height: '45%',
          background: 'linear-gradient(to top, rgba(8,20,50,0.75), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Gold diamond ornament */}
        <svg
          width="16" height="16" viewBox="0 0 16 16"
          style={{ position: 'absolute', top: 8, right: 8, opacity: 0.55, pointerEvents: 'none' }}
        >
          <path d="M8 1 L15 8 L8 15 L1 8 Z" stroke="#c8a020" fill="none" />
          <circle cx="8" cy="8" r="2" fill="#c8a020" />
        </svg>

        {/* Text block */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '10px 12px 14px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <span style={{
            alignSelf: 'flex-start',
            border: '0.5px solid var(--gold)',
            color: 'var(--gold)',
            fontSize: 8,
            borderRadius: 3,
            padding: '1px 6px',
            background: 'rgba(8,20,50,0.4)',
            fontFamily: 'Cinzel, serif',
            letterSpacing: '0.05em',
          }}>
            {resident.title ?? 'Din'}
          </span>
          <span style={{
            fontFamily: 'Cinzel, serif',
            color: 'var(--gold-light)',
            fontSize: 11.5,
            fontWeight: 600,
            lineHeight: 1.3,
          }}>
            {resident.name}
          </span>
          {bio && (
            <span style={{
              fontFamily: 'EB Garamond, Georgia, serif',
              color: '#b8cfe0',
              fontSize: 8,
              lineHeight: 1.55,
            }}>
              {bio}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── HomePage ──────────────────────────────────────────────

export default function HomePage() {
  const { data: residents = [], isLoading: residentsLoading } = useResidents()
  const { data: gameState, isLoading: dateLoading } = useGameState()

  const pinnedLords = residents.filter(r => r.showOnHomePage)

  const dateString = gameState
    ? `✦ ${formatGameDate(gameState.currentSeason, gameState.currentWeek, gameState.currentDay)} · Dr-${gameState.currentYear} ✦`
    : null

  return (
    <div className="home-page">

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="home-hero">
        {/* Particles */}
        {Array.from({ length: 28 }, (_, i) => (
          <Particle key={i} index={i} />
        ))}

        <div className="home-hero-content">
          {/* Crest */}
          <div className="home-crest-wrap">
            <img
              src={crestImage}
              alt="House Riant Crest"
              className="home-crest"
            />
          </div>

          {/* House name */}
          <h1
            className="home-house-name"
            style={{ animationDelay: '200ms' }}
          >
            HOUSE RIANT
          </h1>

          {/* Motto */}
          <p
            className="home-motto"
            style={{ animationDelay: '500ms' }}
          >
            TAOBH LE TAOBH
          </p>

          {/* Date pill */}
          <div
            className="home-date-pill"
            style={{ animationDelay: '800ms' }}
          >
            {dateLoading || residentsLoading
              ? '· · ·'
              : (dateString ?? '· · ·')}
          </div>
        </div>
      </div>

      {/* ── Lords of Riant ────────────────────────────────── */}
      <div className="home-lords-section">
        <div className="home-lords-header">
          <div style={{ flex: 1, height: 1, background: 'rgba(200,160,32,0.4)' }} />
          <span className="home-lords-diamond">◆</span>
          <h2 className="home-lords-title">THE LORDS OF RIANT</h2>
          <span className="home-lords-diamond">◆</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(200,160,32,0.4)' }} />
        </div>

        {pinnedLords.length === 0 ? (
          <p className="home-lords-empty">
            <em>No lords have been appointed to this hall.</em>
          </p>
        ) : (
          <div className="home-lords-grid">
            {pinnedLords.map((resident, i) => (
              <LordCard key={resident.id} resident={resident} index={i} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
