import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactGA from 'react-ga4'
import App from './page.tsx'
import './index.css'

// Initialize Google Analytics
const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID
if (gaId) {
  ReactGA.initialize(gaId)
  console.log('Google Analytics initialized:', gaId)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
