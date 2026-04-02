import { Suspense } from 'react';
import PageLoader from '../PageLoader.tsx';
import ClientsView from '../views/ClientsView.jsx';
import ReferralsView from '../views/ReferralsView.jsx';
import ManagerView from '../views/ManagerView.jsx';
import PerformanceView from '../views/PerformanceView.jsx';
import SalesForm from '../views/SalesForm.jsx';
import SalesList from '../views/SalesList.jsx';
import type { CurrentView } from '../../types/index.ts';

interface ViewRouterProps {
  currentView: CurrentView;
  children: React.ReactNode;
}

export function ViewRouter({ currentView, children }: ViewRouterProps) {
  if (currentView === 'calendar') return children;
  if (currentView === 'clients') {
    return (
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    );
  }
  if (currentView === 'referrals') {
    return (
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    );
  }
  if (currentView === 'manager') {
    return (
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    );
  }
  if (currentView === 'performance') {
    return (
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  );
}