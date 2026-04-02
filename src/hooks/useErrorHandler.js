import { useState, useCallback, useContext, createContext } from 'react';

const ErrorHandlerContext = createContext(null);

export const ErrorHandlerProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);

  const addError = useCallback((error) => {
    const errorWithTimestamp = {
      ...error,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    setErrors((prev) => [...prev, errorWithTimestamp]);
  }, []);

  const clearError = useCallback((errorId) => {
    setErrors((prev) => prev.filter((e) => e.id !== errorId));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorHandlerContext.Provider value={{ errors, addError, clearError, clearAllErrors }}>
      {children}
    </ErrorHandlerContext.Provider>
  );
};

export const useErrorHandler = () => {
  const context = useContext(ErrorHandlerContext);
  if (!context) {
    return {
      errors: [],
      addError: (error) => console.error('ErrorHandler not initialized:', error),
      clearError: () => {},
      clearAllErrors: () => {},
    };
  }
  return context;
};

export const withErrorHandler = (Component, errorHandler) => {
  return (props) => (
    <Component
      {...props}
      onError={(error) => errorHandler.addError(error)}
    />
  );
};