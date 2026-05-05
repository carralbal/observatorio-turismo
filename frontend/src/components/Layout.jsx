import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { C, Paralelo, Eyebrow } from './Atoms'
import PeriodBar from './PeriodBar'

const NAV_ITEMS = [
  { to: '/',          label: 'Pulso SDE'  },
  { to: '/aerea',     label: 'Aérea'      },
  { to: '/terrestre', label: 'Terrestre'  },
  { to: '/informal',  label: 'Informal'   },
  { to: '/empleo',    label: 'Empleo'     },
  { to: '/nacional',  label: 'Nacional'   },
]

const SOURCES = ['INDEC','SIPA-AFIP','ANAC','CNRT','Google Trends','BCRA','AirDNA','OEDE']

export default function Layout() {
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <>
      <nav className="nav-blur" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 var(--pad)',
        background: scrolled ? 'rgba(10,10,10,0.95)' : 'rgba(10,10,10,0.7)',
        borderBottom: `0.5px solid rgba(250,250,247,${scrolled ? 0.1 : 0})`,
        transition: 'background 0.4s, border-color 0.4s',
      }}>
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: C.paper, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            Observatorio SDE
          </span>
          <Paralelo w={10} h={5} />
        </NavLink>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              textDecoration: 'none',
              fontSize: 10.5, fontWeight: isActive ? 700 : 500,
              color: C.paper, opacity: isActive ? 1 : 0.45,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              transition: 'opacity 0.2s',
              borderBottom: isActive ? `1.5px solid ${C.volt}` : '1.5px solid transparent',
              paddingBottom: 2,
            })}>{label}</NavLink>
          ))}
        </div>
      </nav>

      <PeriodBar />

      <main style={{ paddingTop: 98 }}>
        <Outlet />
      </main>

      <footer style={{ background: C.paper, borderTop: `0.5px solid ${C.stone}` }}>
        <div style={{ padding: '24px 0 14px', borderBottom: `0.5px solid ${C.stone}` }}>
          <Eyebrow style={{ textAlign: 'center', marginBottom: 14, opacity: 0.5 }}>Fuentes oficiales</Eyebrow>
          <div className="ticker-wrap">
            <div className="ticker-track">
              {[...SOURCES, ...SOURCES].map((s, i) => (
                <span key={i} style={{
                  fontSize: 10.5, fontWeight: 600, color: C.stone,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  padding: '0 32px', display: 'inline-flex', alignItems: 'center', gap: 32,
                }}>
                  {s}
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: C.stone, opacity: 0.4 }} />
                </span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: '16px var(--pad)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eyebrow style={{ opacity: 0.55 }}>Observatorio de Turismo · SDE</Eyebrow>
            <Paralelo w={9} h={4} />
          </div>
          <Eyebrow style={{ opacity: 0.35 }}>Actualización mensual · datos oficiales</Eyebrow>
        </div>
      </footer>
    </>
  )
}
