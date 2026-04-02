import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../views/Header.jsx';

const mockSettings = {
  employeeName: 'Gabriela Ferreira',
  currency: 'BRL',
};

const mockProps = {
  settings: mockSettings,
  isAdm: false,
  isOnline: true,
  currentView: 'sales',
  setCurrentView: vi.fn(),
  setLogoutModalOpen: vi.fn(),
  setCommissionModalOpen: vi.fn(),
  isNotificationsDropdownOpen: false,
  setIsNotificationsDropdownOpen: vi.fn(),
  setIsHelpDropdownOpen: vi.fn(),
  isHelpDropdownOpen: false,
  HELP_LINKS: [],
  ADM_NAME: 'Admin',
  isBackupOpen: false,
  setIsBackupOpen: vi.fn(),
  APP_VERSION: '2.5.0',
  sales: [],
  clients: [],
  reminders: [],
  GOAL_SELLERS: 25,
  GOAL_MANAGER: 65,
  ELIGIBLE_FOR_GOAL: ['SAMSUNG', 'IPHONE', 'MOTOROLA'],
};

describe('Header', () => {
  it('deve renderizar nome do funcionário', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('Gabriela Ferreira')).toBeDefined();
  });

  it('deve renderizar logo Miplace', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('Miplace')).toBeDefined();
  });

  it('deve renderizar status Online', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('Online')).toBeDefined();
  });

  it('deve renderizar botão com ícone Home', () => {
    render(<Header {...mockProps} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
