import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

function showFatal(err) {
  const root = document.getElementById('root')
  if (!root) return
  const msg = (err && (err.stack || err.message)) ? (err.stack || err.message) : String(err)
  root.innerHTML = `
    <div style="max-width:900px;margin:24px auto;padding:16px;border-radius:16px;background:#fff;border:2px solid #ff6b35;font-family:system-ui;">
      <div style="font-size:20px;font-weight:800;color:#ff6b35;">App bị lỗi nên không render được</div>
      <div style="margin-top:8px;color:#555;">Bạn chụp màn hình khung này gửi mình là mình xử lý ngay.</div>
      <pre style="margin-top:12px;white-space:pre-wrap;word-break:break-word;background:#fff4e6;padding:12px;border-radius:12px;">${msg.replace(/</g, '&lt;')}</pre>
    </div>
  `
}

window.addEventListener('error', (e) => {
  showFatal(e.error || e.message)
})

window.addEventListener('unhandledrejection', (e) => {
  showFatal(e.reason || 'Unhandled Promise Rejection')
})

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
} catch (err) {
  showFatal(err)
}
