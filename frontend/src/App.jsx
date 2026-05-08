import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Aerea from './pages/Aerea'
import TerrestreP from './pages/Terrestre'
import EmpleoP from './pages/Empleo'
import InformalP from './pages/Informal'
import ImagenP from './pages/Imagen'
import EstimadoP from './pages/Estimado'
import MotoGPP from './pages/MotoGP'
import SenalP from './pages/Senal'
import BenchmarkP from './pages/Benchmark'
import NacionalP from './pages/Nacional'
import FuentesP from './pages/Fuentes'
import CapturaP from './pages/Captura'
import SaludP from './pages/SaludTuristica'
import MadurezP from './pages/Madurez'
import PerfilP from './pages/Perfil'
import AgendaP from './pages/Agenda'
import AlojamientoP from './pages/Alojamiento'
import DatabookP from './pages/Databook'
import DatabookP from './pages/Databook'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,          element: <Home /> },
      { path: 'aerea',        element: <Aerea /> },
      { path: 'terrestre',    element: <TerrestreP /> },
      { path: 'informal',     element: <InformalP /> },
      { path: 'empleo',       element: <EmpleoP /> },
      { path: 'fuentes',      element: <FuentesP /> },
      { path: 'nacional',     element: <NacionalP /> },
      { path: 'motogp',       element: <MotoGPP /> },
      { path: 'señal',        element: <SenalP /> },
      { path: 'benchmark',    element: <BenchmarkP /> },
      { path: 'captura',      element: <CapturaP /> },
      { path: 'salud',        element: <SaludP /> },
      { path: 'madurez',      element: <MadurezP /> },
      { path: 'imagen',       element: <ImagenP /> },
      { path: 'estimado',     element: <EstimadoP /> },
      { path: 'perfil',       element: <PerfilP /> },
      { path: 'agenda',      element: <AgendaP /> },
      { path: 'alojamiento', element: <AlojamientoP /> },
      { path: 'databook',    element: <DatabookP /> },
      { path: 'databook',     element: <DatabookP /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
