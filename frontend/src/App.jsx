import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Aerea from './pages/Aerea'
import TerrestreP from './pages/Terrestre'
import EmpleoP from './pages/Empleo'
import InformalP from './pages/Informal'
import ImagenP from './pages/Imagen'
import {
 Nacional,
  MotoGP, Señal, Benchmark, Captura, Madurez,
  Imagen, Estimado, Perfil,
} from './pages/Stubs'

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
      { path: 'nacional',     element: <Nacional /> },
      { path: 'motogp',       element: <MotoGP /> },
      { path: 'señal',        element: <Señal /> },
      { path: 'benchmark',    element: <Benchmark /> },
      { path: 'captura',      element: <Captura /> },
      { path: 'madurez',      element: <Madurez /> },
      { path: 'imagen',       element: <ImagenP /> },
      { path: 'estimado',     element: <Estimado /> },
      { path: 'perfil',       element: <Perfil /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
