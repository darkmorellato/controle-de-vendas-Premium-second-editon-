import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  onClick,
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-bold uppercase tracking-wider transition-all duration-300 active-scale';
  
  const variants = {
    primary: 'btn-gold',
    secondary: 'bg-white/10 text-slate-300 border border-white/10 hover:bg-white/20 hover:border-white/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-xl',
    md: 'px-6 py-3 text-sm rounded-[1.5rem]',
    lg: 'px-8 py-4 text-base rounded-2xl',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          Carregando...
        </span>
      ) : children}
    </button>
  );
};

export const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div 
      className={`classic-frame p-6 ${hover ? 'hover:border-odoo-500/30 hover:shadow-gold-glow cursor-pointer transition-all' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const Input = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-3 block">
          {label}
        </label>
      )}
      <input 
        className={`input-field w-full ${error ? 'border-red-500/50 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400 ml-3">{error}</p>
      )}
    </div>
  );
};

export const Select = ({ 
  label, 
  error, 
  options = [], 
  className = '', 
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-3 block">
          {label}
        </label>
      )}
      <select 
        className={`input-field w-full ${error ? 'border-red-500/50' : ''} ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-400 ml-3">{error}</p>
      )}
    </div>
  );
};

export const Badge = ({ 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const variants = {
    default: 'bg-white/10 text-slate-300 border border-white/10',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    gold: 'bg-odoo-500/20 text-odoo-400 border border-odoo-500/30',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} border-2 border-odoo-500/30 border-t-odoo-500 rounded-full animate-spin ${className}`}></div>
  );
};

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md' 
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg animate-fade-in" onClick={onClose}>
      <div 
        className={`classic-frame rounded-[3rem] p-8 w-full ${sizes[size]} shadow-2xl animate-zoom-in-95`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
          <h2 className="font-bold text-2xl text-white font-display">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Avatar = ({ name, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-odoo-500 to-odoo-600 flex items-center justify-center font-bold text-onyx-900 ${className}`}>
      {initials}
    </div>
  );
};

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {icon && <div className="mb-4 text-slate-400">{icon}</div>}
      <h3 className="font-bold text-xl text-slate-300 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
};

export default {
  Button,
  Card,
  Input,
  Select,
  Badge,
  Spinner,
  Modal,
  Avatar,
  EmptyState,
};