import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClockProvider } from './components/Clock.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { SalesProvider } from './contexts/SalesContext.jsx';
import { ClientProvider } from './contexts/ClientContext.jsx';
import { UIProvider } from './contexts/UIContext.jsx';
import './index.css';
import App from './App';

// NOTA: window.db e window.auth foram removidos por segurança.
// Use os services (salesService, clientService, authService) para acessar Firebase.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ClockProvider>
        <ClientProvider>
          <SalesProvider>
            <UIProvider>
              <App />
            </UIProvider>
          </SalesProvider>
        </ClientProvider>
      </ClockProvider>
    </ErrorBoundary>
  </StrictMode>,
);
