import { useState, useRef, useEffect, useCallback } from 'react'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25

export default function WorldMapPage() {
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const adjustZoom = useCallback((delta: number) => {
    setZoom(z => parseFloat(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)).toFixed(2)))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      adjustZoom(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [adjustZoom])

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <h1>World Map</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn-secondary" onClick={() => adjustZoom(-ZOOM_STEP)} disabled={zoom <= MIN_ZOOM}>−</button>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, minWidth: 48, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button className="btn-secondary" onClick={() => adjustZoom(ZOOM_STEP)} disabled={zoom >= MAX_ZOOM}>+</button>
          <button className="btn-secondary" onClick={() => setZoom(1)}>Reset</button>
        </div>
      </div>
      <div ref={containerRef} style={{ overflow: 'auto', flex: 1 }}>
        <img
          src="/world-map.jpg"
          alt="World Map"
          draggable={false}
          style={{
            display: 'block',
            width: `${zoom * 100}%`,
            border: '2px solid var(--gold)',
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  )
}
