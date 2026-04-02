import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient.ts';
import { ClockProvider } from './components/Clock.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { SalesProvider } from './contexts/SalesContext.jsx';
import { ClientProvider } from './contexts/ClientContext.jsx';
import { UIProvider } from './contexts/UIContext.tsx';
import './index.css';
import App from './App';

// NOTA: window.db e window.auth foram removidos por segurança.
// Use os services (salesService, clientService, authService) para acessar Firebase.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ClockProvider>
          <ClientProvider>
            <SalesProvider>
              <UIProvider>
                <App />
              </UIProvider>
            </SalesProvider>
          </ClientProvider>
        </ClockProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
