import { useEffect, useRef, useState, useMemo } from 'react'
import { C } from '../components/Atoms'

const GEOREF_URL = 'https://apis.datos.gob.ar/georef/api/v2.0/provincias.geojson?max=24'
const D3_CDN = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js'

function norm(nombre) {
  const MAP = {
    'Ciudad Autónoma de Buenos Aires': 'CABA',
    'Tierra del Fuego, Antártida e Islas del Atlántico Sur': 'Tierra del Fuego',
  }
  return MAP[nombre] || nombre
}

function loadD3() {
  return new Promise((res) => {
    if (window.d3) return res(window.d3)
    const s = document.createElement('script')
    s.src = D3_CDN
    s.onload = () => res(window.d3)
    document.head.appendChild(s)
  })
}

export default function MapaISTP({ datos2025 = [] }) {
  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [geo, setGeo] = useState(null)
  const [d3, setD3] = useState(null)

  useEffect(() => {
    loadD3().then(setD3)
    fetch(GEOREF_URL).then(r => r.json()).then(setGeo).catch(() => {})
  }, [])

  const scoreMap = useMemo(() => {
    const m = {}
    datos2025.forEach(d => { m[d.provincia] = d })
    return m
  }, [datos2025])

  useEffect(() => {
    if (!geo || !svgRef.current || !datos2025.length || !d3) return
    const scores = datos2025.map(d => +d.istp_nivel || 0)
    const minS = Math.min(...scores), maxS = Math.max(...scores)
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const W = svgRef.current.clientWidth || 360
    const H = W * 1.2
    const proj = d3.geoMercator().fitSize([W, H], geo)
    const path = d3.geoPath().projection(proj)
    const col = d3.scaleLinear().domain([minS, maxS]).range(['rgba(200,200,191,0.15)', 'rgba(200,200,191,0.65)'])

    svg.attr('width', W).attr('height', H)
    svg.selectAll('path').data(geo.features).join('path')
      .attr('d', path)
      .attr('fill', f => {
        const n = norm(f.properties.nombre)
        const d = scoreMap[n]
        if (!d) return 'rgba(200,200,191,0.06)'
        if (+d.es_sde === 1 || n === 'Santiago del Estero') return C.volt
        return col(+d.nivel || 0)
      })
      .attr('stroke', 'rgba(10,10,10,0.4)')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mousemove', (event, f) => {
        const n = norm(f.properties.nombre)
        const d = scoreMap[n]
        if (d) setTooltip({ n, d, x: event.offsetX, y: event.offsetY })
      })
      .on('mouseleave', () => setTooltip(null))
  }, [geo, scoreMap, d3, datos2025.length])

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 340, flexShrink: 0 }}>
      {(!geo || !d3) && <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 'var(--fs-xs)', color: C.stone }}>Cargando mapa…</span></div>}
      <svg ref={svgRef} style={{ width: '100%', display: geo && d3 ? 'block' : 'none' }} />
      {tooltip && (
        <div style={{ position: 'absolute', left: tooltip.x + 12, top: Math.max(0, tooltip.y - 10), background: C.ink, border: '1px solid rgba(250,250,247,0.12)', padding: '10px 14px', pointerEvents: 'none', minWidth: 170, fontFamily: 'Plus Jakarta Sans', zIndex: 10 }}>
          <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, color: +tooltip.d.es_sde === 1 ? C.volt : C.paper, marginBottom: 6 }}>{tooltip.n}</div>
          <div style={{ fontSize: 'var(--fs-xs)', color: C.stone, marginBottom: 2 }}>Score: <span style={{ color: C.paper }}>{(+tooltip.d.nivel).toFixed(1)}/100</span></div>
          <div style={{ fontSize: 'var(--fs-xs)', color: C.stone, marginBottom: 2 }}>Ranking: <span style={{ color: C.paper }}>{tooltip.d.ranking}° / 24</span></div>
          <div style={{ fontSize: 'var(--fs-xs)', color: C.stone }}>Cuadrante: <span style={{ color: C.paper }}>{tooltip.d.cuad}</span></div>
        </div>
      )}
    </div>
  )
}
