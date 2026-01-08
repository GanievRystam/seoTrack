import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import { seedAuthOnce } from "./shared/storage/seedAuth";
import { seedProjectsOnce } from "./shared/storage/seedProjects";
seedAuthOnce();
seedProjectsOnce();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
