import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { C, Paralelo, Eyebrow } from './Atoms'
import { Layers, Info, Menu, X } from 'lucide-react'
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
    { to: '/señal',    label: 'Señal IBT'     },
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
    { to: '/estimado', label: 'Estimado OLS'       },
    { to: '/salud',    label: 'Salud Turística'  },
    { to: '/madurez',  label: 'Madurez Obs.'     },
    { to: '/nacional', label: 'Nacional'          },
  ]},
]

const SOURCES = ['INDEC','SIPA-AFIP','ANAC','CNRT','Google Trends','BCRA','AirDNA','OEDE']

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h, { passive: true })
    return () => window.removeEventListener('resize', h)
  }, [])
  return isMobile
}

export default function Layout() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const isMobile = useIsMobile()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  const fs = {
    navBrand:    isMobile ? 11    : 10.5,
    navLabel:    isMobile ? 11    : 10,
    menuIcon:    isMobile ? 26    : 20,
    capaNum:     isMobile ? 12    : 9,
    capaLabel:   isMobile ? 17    : 13,
    pageItem:    isMobile ? 17    : 13,
    overlayNote: isMobile ? 12    : 10,
  }

  return (
    <>
      {/* TOP NAV */}
      <nav className="nav-blur" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 var(--pad)',
        background: menuOpen
          ? C.ink
          : scrolled ? 'rgba(10,10,10,0.95)' : 'rgba(10,10,10,0.7)',
        borderBottom: `0.5px solid rgba(250,250,247,${scrolled && !menuOpen ? 0.1 : 0})`,
        transition: 'background 0.4s, border-color 0.4s',
      }}>
        <NavLink to="/" onClick={close} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: fs.navBrand, fontWeight: 700, color: C.paper, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            Observatorio SDE
          </span>
          <Paralelo w={10} h={5} />
        </NavLink>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {[
            { to: '/madurez',  Icon: Layers,   label: 'Madurez'  },
            { to: '/databook', Icon: Info,      label: 'DataBook' },
          ].map(({ to, Icon, label }) => (
            <NavLink key={to} to={to} onClick={close} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 0', textDecoration: 'none',
              borderBottom: isActive ? `1.5px solid ${C.volt}` : '1.5px solid transparent',
              paddingBottom: 4,
            })}>
              <Icon size={isMobile ? 15 : 13} style={{ color: C.volt }} />
              <span style={{ fontSize: fs.navLabel, fontWeight: 500, color: C.volt, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                {label}
              </span>
            </NavLink>
          ))}

          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.paper, padding: 6, borderRadius: 4,
              transition: 'opacity 0.2s',
            }}
          >
            {menuOpen ? <X size={fs.menuIcon} /> : <Menu size={fs.menuIcon} />}
          </button>
        </div>
      </nav>

      {/* FULLSCREEN OVERLAY */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: C.ink,
        display: 'flex', flexDirection: 'column',
        padding: `calc(60px + ${isMobile ? 32 : 48}px) var(--pad) 48px`,
        overflowY: 'auto',
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? 'all' : 'none',
        transform: menuOpen ? 'translateY(0)' : 'translateY(-12px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: isMobile ? '40px 24px' : '48px 40px',
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
        }}>
          {CAPAS.map((capa) => {
            const isCapaActive = capa.items.some(item =>
              pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to)))
            return (
              <div key={capa.label}>
                <div style={{ marginBottom: isMobile ? 16 : 20 }}>
                  <span style={{
                    display: 'block', fontSize: fs.capaNum, fontWeight: 700,
                    color: isCapaActive ? C.volt : C.slate,
                    letterSpacing: '0.22em', textTransform: 'uppercase',
                    marginBottom: 6,
                  }}>
                    {capa.num}
                  </span>
                  <span style={{
                    fontSize: fs.capaLabel, fontWeight: 700,
                    color: isCapaActive ? C.paper : C.stone,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {capa.label}
                  </span>
                  <div style={{
                    marginTop: 8, height: 1,
                    background: isCapaActive ? C.volt : 'rgba(200,200,191,0.15)',
                    width: isCapaActive ? '100%' : '40%',
                    transition: 'width 0.3s',
                  }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {capa.items.map(({ to, label }) => (
                    <NavLink
                      key={to} to={to} end={to === '/'} onClick={close}
                      style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center',
                        padding: isMobile ? '12px 14px' : '10px 14px',
                        textDecoration: 'none',
                        fontSize: fs.pageItem, fontWeight: isActive ? 600 : 400,
                        color: isActive ? C.paper : 'rgba(250,250,247,0.45)',
                        letterSpacing: '0.06em',
                        background: isActive ? 'rgba(255,255,0,0.06)' : 'transparent',
                        borderLeft: `2px solid ${isActive ? C.volt : 'transparent'}`,
                        borderRadius: '0 4px 4px 0',
                        transition: 'opacity 0.15s, background 0.15s',
                      })}
                    >
                      {label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{
          paddingTop: 48,
          maxWidth: 900, width: '100%', margin: '64px auto 0',
          borderTop: '0.5px solid rgba(200,200,191,0.12)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ fontSize: fs.overlayNote, color: C.stone, opacity: 0.35, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Observatorio de Turismo · Santiago del Estero
          </span>
          <span style={{ fontSize: fs.overlayNote, color: C.stone, opacity: 0.25, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Datos oficiales · actualización mensual
          </span>
        </div>
      </div>

      <PeriodBar />
      <BotToggle />

      <main style={{ paddingTop: 98 }}>
        <Outlet />
      </main>

      {/* FOOTER */}
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
