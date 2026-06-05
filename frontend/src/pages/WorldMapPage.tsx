import { useState, useRef, useEffect, useCallback } from 'react'

const MIN_ZOOM = 0.25
const MAX_ZOOM = 4
const ZOOM_STEP = 0.15

export default function WorldMapPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const panX = useRef(0)
  const panY = useRef(0)
  const zoom = useRef(1)
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const [displayZoom, setDisplayZoom] = useState(1)

  function applyTransform() {
    const img = imgRef.current
    if (img) {
      img.style.transform = `translate(${panX.current}px, ${panY.current}px) scale(${zoom.current})`
    }
  }

  function centerImage() {
    const container = containerRef.current
    const img = imgRef.current
    if (!container || !img) return
    panX.current = (container.clientWidth - img.naturalWidth) / 2
    panY.current = (container.clientHeight - img.naturalHeight) / 2
    applyTransform()
  }

  function applyZoom(delta: number) {
    const container = containerRef.current
    if (!container) return
    const cx = container.clientWidth / 2
    const cy = container.clientHeight / 2
    const imgX = (cx - panX.current) / zoom.current
    const imgY = (cy - panY.current) / zoom.current
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom.current + delta))
    panX.current = cx - imgX * newZoom
    panY.current = cy - imgY * newZoom
    zoom.current = newZoom
    setDisplayZoom(newZoom)
    applyTransform()
  }

  function handleReset() {
    zoom.current = 1
    setDisplayZoom(1)
    centerImage()
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      applyZoom(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    dragStart.current = { x: e.clientX - panX.current, y: e.clientY - panY.current }
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    panX.current = e.clientX - dragStart.current.x
    panY.current = e.clientY - dragStart.current.y
    applyTransform()
  }, [])

  const stopDrag = useCallback(() => {
    dragging.current = false
  }, [])

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <h1>World Map</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn-secondary" onClick={() => applyZoom(-ZOOM_STEP)}>−</button>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, minWidth: 48, textAlign: 'center' }}>
            {Math.round(displayZoom * 100)}%
          </span>
          <button className="btn-secondary" onClick={() => applyZoom(ZOOM_STEP)}>+</button>
          <button className="btn-secondary" onClick={handleReset}>Reset</button>
        </div>
      </div>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          cursor: dragging.current ? 'grabbing' : 'grab',
          border: '2px solid var(--gold)',
          borderRadius: 4,
          background: '#1a1208',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <img
          ref={imgRef}
          src="/world-map.jpg"
          alt="World Map"
          draggable={false}
          onLoad={centerImage}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: '0 0',
            userSelect: 'none',
          }}
        />
      </div>
    </div>
  )
}
