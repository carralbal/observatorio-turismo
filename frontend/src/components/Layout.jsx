import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { C, Paralelo, Eyebrow } from './Atoms'
import PeriodBar from './PeriodBar'
import BotToggle from './BotToggle'

const CAPAS = [
  { label: 'Actividad', num: '01', items: [
    { to: '/',          label: 'Pulso SDE' },
    { to: '/aerea',     label: 'Aérea'     },
    { to: '/terrestre', label: 'Terrestre' },
    { to: '/motogp',    label: 'MotoGP'    },
  ]},
  { label: 'Señales', num: '02', items: [
    { to: '/senal',    label: 'Señal IBT'     },
    { to: '/informal', label: 'Informal'      },
    { to: '/imagen',   label: 'Imagen Destino'},
  ]},
  { label: 'Estructura y Valor', num: '03', items: [
    { to: '/empleo',    label: 'Empleo'    },
    { to: '/captura',   label: 'Captura'   },
    { to: '/perfil',    label: 'Perfil'    },
    { to: '/benchmark', label: 'Benchmark' },
  ]},
  { label: 'Decisión', num: '04', items: [
    { to: '/estimado', label: 'Estimado OLS' },
    { to: '/madurez',  label: 'Madurez'      },
    { to: '/nacional', label: 'Nacional'     },
  ]},
]

const SOURCES = ['INDEC','SIPA-AFIP','ANAC','CNRT','Google Trends','BCRA','AirDNA','OEDE']

export default function Layout() {
  const [scrolled, setScrolled] = useState(false)
  const [openCapa, setOpenCapa] = useState(null)
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
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }} onMouseLeave={() => setOpenCapa(null)}>
          {CAPAS.map((capa) => {
            const isCapaActive = capa.items.some(item =>
              pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to)))
            return (
              <div key={capa.label} style={{ position: 'relative' }} onMouseEnter={() => setOpenCapa(capa.label)}>
                <button style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                  fontSize: 10, fontWeight: isCapaActive ? 700 : 500,
                  color: C.paper, opacity: isCapaActive ? 1 : 0.45,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  borderBottom: isCapaActive ? `1.5px solid ${C.volt}` : '1.5px solid transparent',
                  paddingBottom: 4, transition: 'opacity 0.2s',
                }}>
                  <span style={{ fontSize: 8, opacity: 0.35 }}>{capa.num}</span>
                  {capa.label}
                  <span style={{ fontSize: 7, opacity: 0.35, marginLeft: 1 }}>▾</span>
                </button>
                {openCapa === capa.label && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0,
                    background: 'rgba(10,10,10,0.97)',
                    border: '0.5px solid rgba(250,250,247,0.12)',
                    borderTop: `1.5px solid ${C.volt}`,
                    minWidth: 180, zIndex: 300, paddingTop: 8, paddingBottom: 8,
                  }}>
                    {capa.items.map(({ to, label }) => (
                      <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpenCapa(null)}
                        style={({ isActive }) => ({
                          display: 'block', padding: '9px 18px', textDecoration: 'none',
                          fontSize: 10.5, fontWeight: isActive ? 600 : 400,
                          color: C.paper, opacity: isActive ? 1 : 0.55,
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          borderLeft: isActive ? `2px solid ${C.volt}` : '2px solid transparent',
                          background: isActive ? 'rgba(255,255,0,0.04)' : 'transparent',
                          transition: 'opacity 0.15s',
                        })}>{label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      <PeriodBar />
      <BotToggle />

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
