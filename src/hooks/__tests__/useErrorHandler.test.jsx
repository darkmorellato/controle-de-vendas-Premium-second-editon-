import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorHandler, ErrorHandlerProvider } from '../useErrorHandler.jsx';

describe('useErrorHandler', () => {
  it('should return default values when not wrapped in provider', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    expect(result.current.errors).toEqual([]);
    expect(typeof result.current.addError).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.clearAllErrors).toBe('function');
  });

  it('should add errors when addError is called', async () => {
    const wrapper = ({ children }) => <ErrorHandlerProvider>{children}</ErrorHandlerProvider>;
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    await act(async () => {
      result.current.addError({ message: 'Test error', type: 'error' });
    });
    
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].message).toBe('Test error');
  });

  it('should add and clear errors', async () => {
    const wrapper = ({ children }) => <ErrorHandlerProvider>{children}</ErrorHandlerProvider>;
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    // Add two errors
    await act(async () => {
      result.current.addError({ message: 'Error 1', type: 'error' });
    });
    await act(async () => {
      result.current.addError({ message: 'Error 2', type: 'error' });
    });
    
    expect(result.current.errors).toHaveLength(2);
    
    // Clear all
    await act(async () => {
      result.current.clearAllErrors();
    });
    
    expect(result.current.errors).toHaveLength(0);
  });

  it('should clear all errors when clearAllErrors is called', async () => {
    const wrapper = ({ children }) => <ErrorHandlerProvider>{children}</ErrorHandlerProvider>;
    const { result } = renderHook(() => useErrorHandler(), { wrapper });
    
    await act(async () => {
      result.current.addError({ message: 'Error 1', type: 'error' });
      result.current.addError({ message: 'Error 2', type: 'error' });
    });
    
    expect(result.current.errors).toHaveLength(2);
    
    await act(async () => {
      result.current.clearAllErrors();
    });
    
    expect(result.current.errors).toHaveLength(0);
  });
});