import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth.js';

vi.mock('../services/authService', () => ({
  authService: {
    loginEmployee: vi.fn(),
    onAuthStateChanged: vi.fn((callback) => {
      callback(null);
      return vi.fn();
    }),
  },
}));

vi.mock('../contexts/UIContext.tsx', () => ({
  useUIContext: () => ({
    showToast: vi.fn(),
  }),
}));

describe('useAuth', () => {
  it('deve iniciar com estado não logado', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('deve abrir modal de login ao clicar', () => {
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.handleLoginClick('Gabriela Ferreira');
    });
    
    expect(result.current.loginModalOpen).toBe(true);
    expect(result.current.selectedUserForLogin).toBe('Gabriela Ferreira');
  });

  it('deve fechar modal de login', () => {
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.handleLoginClick('Gabriela Ferreira');
      result.current.setLoginModalOpen(false);
    });
    
    expect(result.current.loginModalOpen).toBe(false);
  });

  it('deve ter settings padrão', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.settings).toBeDefined();
    expect(result.current.settings.employeeName).toBe('');
    expect(result.current.settings.currency).toBe('R$');
  });

  it('deve permitir configurar loginPasswordInput', () => {
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.setLoginPasswordInput('senha123');
    });
    
    expect(result.current.loginPasswordInput).toBe('senha123');
  });

  it('deve ter sessionPromptOpen como false inicialmente', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.sessionPromptOpen).toBe(false);
  });

  it('deve permitir setar isAdm', () => {
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.setIsAdm(true);
    });
    
    expect(result.current.isAdm).toBe(true);
  });
});
