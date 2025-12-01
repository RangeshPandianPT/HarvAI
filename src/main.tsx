import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './hooks/useAuth'
import { TranslationProvider } from './components/TranslationProvider'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <TranslationProvider>
      <App />
    </TranslationProvider>
  </AuthProvider>
);
