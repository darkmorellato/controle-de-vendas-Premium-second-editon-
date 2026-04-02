import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../firebase.js', () => ({
  db: {},
  auth: {},
  storage: {},
}));

vi.mock('../services/authService.js', () => ({
  authService: {
    loginEmployee: vi.fn(),
    onAuthStateChanged: vi.fn((callback) => {
      callback(null);
      return vi.fn();
    }),
    verifyManagerPassword: vi.fn(() => Promise.resolve(false)),
  },
}));

vi.mock('../contexts/UIContext.tsx', () => ({
  useUIContext: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock('../useApp.js', () => ({
  useApp: () => ({
    auth: {
      isLoggedIn: false,
      isAdm: false,
      settings: { employeeName: '', currency: 'R$' },
      loginModalOpen: false,
      sessionPromptOpen: false,
      selectedUserForLogin: null,
      loginPasswordInput: '',
      loginAttempts: 0,
      loginLockedUntil: 0,
      setIsLoggedIn: vi.fn(),
      setIsAdm: vi.fn(),
      setSettings: vi.fn(),
      setLoginModalOpen: vi.fn(),
      setSessionPromptOpen: vi.fn(),
      setSelectedUserForLogin: vi.fn(),
      setLoginPasswordInput: vi.fn(),
      handleLoginClick: vi.fn(),
      performLogin: vi.fn(),
      logout: vi.fn(),
      loadSavedSession: vi.fn(),
      saveSession: vi.fn(),
    },
    filters: {
      filteredSales: [],
      groupedSales: [],
      groupBy: 'date',
      filterDate: '',
      searchTerm: '',
      filterMode: 'daily',
      currentPage: 1,
      totalPages: 1,
      setFilterMode: vi.fn(),
      setFilterDate: vi.fn(),
      setSearchTerm: vi.fn(),
      setCurrentPage: vi.fn(),
    },
    notifications: {
      todayBirthdays: [],
      monthlyChartData: [],
    },
  }),
}));

const { useAuth } = require('../useAuth.js');

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