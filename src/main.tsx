import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { SeasonProvider } from '@/context/SeasonContext'
import { SearchProvider } from '@/context/SearchContext'
import '@/styles/index.css'
import App from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SeasonProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </SeasonProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
