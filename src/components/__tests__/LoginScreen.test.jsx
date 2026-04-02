import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginScreen from '../views/LoginScreen.jsx';

const mockProps = {
  toasts: [],
  setToasts: vi.fn(),
  SELLERS_LIST: ['Gabriela Ferreira', 'Sabrina Almeida'],
  ADM_NAME: 'Admin',
  handleLoginClick: vi.fn(),
  loginModalOpen: false,
  selectedUserForLogin: null,
  loginPasswordInput: '',
  setLoginPasswordInput: vi.fn(),
  performLogin: vi.fn(),
  sessionPromptOpen: false,
  setSessionPromptOpen: vi.fn(),
  setSettings: vi.fn(),
  setIsAdm: vi.fn(),
  setIsLoggedIn: vi.fn(),
  showToast: vi.fn(),
  setLoginModalOpen: vi.fn(),
};

describe('LoginScreen', () => {
  it('deve renderizar lista de vendedores', () => {
    render(<LoginScreen {...mockProps} />);
    expect(screen.getByText('Gabriela Ferreira')).toBeDefined();
    expect(screen.getByText('Sabrina Almeida')).toBeDefined();
  });

  it('deve renderizar nome Miplace', () => {
    render(<LoginScreen {...mockProps} />);
    expect(screen.getByText('Miplace')).toBeDefined();
  });

  it('deve chamar handleLoginClick ao clicar em vendedor', () => {
    render(<LoginScreen {...mockProps} />);
    const button = screen.getByText('Gabriela Ferreira');
    button.click();
    expect(mockProps.handleLoginClick).toHaveBeenCalledWith('Gabriela Ferreira');
  });

  it('deve renderizar botão Admin', () => {
    render(<LoginScreen {...mockProps} />);
    expect(screen.getByText('Admin')).toBeDefined();
  });

  it('deve renderizar botão de login quando modal fechado', () => {
    render(<LoginScreen {...mockProps} loginModalOpen={false} />);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });
});
