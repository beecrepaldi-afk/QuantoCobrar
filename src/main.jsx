import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App.jsx'
import './index.css'

// PWA: registra o service worker só em produção
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>,
)
