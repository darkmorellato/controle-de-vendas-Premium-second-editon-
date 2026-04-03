import { createContext, useContext } from 'react';

export const SalesFormContext = createContext(null);

export const useSalesFormContext = () => {
  const context = useContext(SalesFormContext);
  if (!context) {
    throw new Error('useSalesFormContext must be used within a SalesFormProvider');
  }
  return context;
};

export const SalesFormProvider = ({ children, value }) => {
  return (
    <SalesFormContext.Provider value={value}>
      {children}
    </SalesFormContext.Provider>
  );
};