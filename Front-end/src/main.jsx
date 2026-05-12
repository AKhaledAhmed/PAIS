import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './api/axiosWithRefresh.js'
import './index.css'
import App from './App.jsx'
import { HeroUIProvider } from '@heroui/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </StrictMode>,
)
