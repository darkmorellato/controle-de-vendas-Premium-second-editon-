import { useState, useRef, useEffect } from 'react';
import Portal from './Portal.jsx';
import Icons from './Icons.jsx';

const MonthFilterDropdown = ({
  monthFilter,
  setMonthFilter,
  availableMonths,
  formatMonth,
  activeColor = 'amber',
  showTodosOption = true,
  dropdownClassName = 'month-filter-dropdown',
  dropdownTitle = 'Filtrar por Mês',
  dropdownWidth = 'w-80',
  showButtonText = false,
  buttonPadding = 'p-4',
  buttonClassName = null,
  chevronIcon = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ right: 0, top: 0 });

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ right: window.innerWidth - rect.right, top: rect.bottom + 8 });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && btnRef.current && !btnRef.current.contains(e.target) && !e.target.closest(`.${dropdownClassName}`)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, dropdownClassName]);

  const handleSelect = (month) => {
    setMonthFilter(month);
    setIsOpen(false);
  };

  const colorMap = {
    amber: { active: 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/20', inactive: 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-amber-500/30 hover:text-amber-400' },
    blue: { active: 'bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-lg shadow-blue-500/20', inactive: 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-blue-500/30 hover:text-blue-400' },
    emerald: { active: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20', inactive: 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-emerald-500/30 hover:text-emerald-400' },
  };
  const colors = colorMap[activeColor] || colorMap.amber;
  const isActive = monthFilter !== 'todos' && !!monthFilter;

  const defaultBtnClasses = `${buttonPadding} rounded-[1.5rem] border transition-all duration-300 ${
    isActive ? colors.active : colors.inactive
  }`;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName || defaultBtnClasses}
        title={isActive ? `Filtrando: ${formatMonth(monthFilter)}` : 'Filtrar por mês'}
      >
        <Icons.Calendar className={showButtonText ? 'w-5 h-5' : 'w-5 h-5'} />
        {showButtonText && monthFilter && (
          <span className="text-sm font-bold">{formatMonth(monthFilter)}</span>
        )}
        {chevronIcon || (showButtonText && (
          <Icons.ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        ))}
      </button>

      {isOpen && (
        <Portal>
          <div
            className={`fixed ${dropdownWidth} bg-[#fdfaf4] border-2 border-[#c9a227]/50 rounded-2xl shadow-2xl overflow-hidden z-[9999] ${dropdownClassName}`}
            style={{
              right: pos.right,
              top: pos.top,
              boxShadow: '0 10px 40px rgba(201,162,39,0.35), 0 0 60px rgba(201,162,39,0.15)',
            }}
          >
            <div className="p-5 border-b border-[#c9a227]/40 bg-gradient-to-r from-[#c9a227]/20 via-[#c9a227]/10 to-transparent">
              <h3 className="font-bold text-[#0f0f0f] text-lg flex items-center gap-2 tracking-wide">
                <Icons.Calendar className="w-5 h-5 text-[#c9a227]" />
                {dropdownTitle}
              </h3>
            </div>
            <div className="py-3 px-2 max-h-80 overflow-y-auto">
              {showTodosOption && (
                <button
                  type="button"
                  onClick={() => handleSelect('todos')}
                  className={`w-full px-4 py-4 mx-2 my-1 rounded-xl transition-all hover:bg-[#c9a227]/20 border border-transparent hover:border-[#c9a227]/40 ${
                    monthFilter === 'todos' ? 'bg-[#c9a227]/20 border-[#c9a227]/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#c9a227]/20 rounded-lg border border-[#c9a227]/40">
                      <Icons.Calendar className="w-5 h-5 text-[#8b6914]" />
                    </div>
                    <span className={`text-base font-medium ${monthFilter === 'todos' ? 'text-[#c9a227]' : 'text-[#0f0f0f]'}`}>Todos os Meses</span>
                  </div>
                </button>
              )}
              {availableMonths.map(month => (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleSelect(month)}
                  className={`w-full px-4 py-4 mx-2 my-1 rounded-xl transition-all hover:bg-[#c9a227]/20 border border-transparent hover:border-[#c9a227]/40 ${
                    monthFilter === month ? 'bg-[#c9a227]/20 border-[#c9a227]/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#c9a227]/20 rounded-lg border border-[#c9a227]/40">
                      <span className="text-sm font-bold text-[#8b6914]">
                        {month.split('-')[1]}/{month.split('-')[0].slice(-2)}
                      </span>
                    </div>
                    <span className={`text-base font-medium ${monthFilter === month ? 'text-[#c9a227]' : 'text-[#0f0f0f]'}`}>{formatMonth(month)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default MonthFilterDropdown;
