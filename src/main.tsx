import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ZohoServicesPage } from './pages/ZohoServicesPage.tsx'
import { BeyondZohoServicesPage } from './pages/BeyondZohoServicesPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/zoho-services" element={<ZohoServicesPage />} />
        <Route path="/zoho-services/:serviceSlug" element={<ZohoServicesPage />} />
        <Route path="/beyond-zoho-services" element={<BeyondZohoServicesPage />} />
        <Route path="/beyond-zoho-services/:serviceSlug" element={<BeyondZohoServicesPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
