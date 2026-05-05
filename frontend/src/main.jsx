import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { PeriodoProvider } from './context/PeriodoContext'
import App from './App.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PeriodoProvider>
      <App />
    </PeriodoProvider>
  </StrictMode>
)
