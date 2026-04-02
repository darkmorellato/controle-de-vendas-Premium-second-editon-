import Icons from '../Icons.jsx';
import { useState, useRef, useEffect } from 'react';
import Portal from '../Portal.jsx';
import GoalProgressCard from './performance/GoalProgressCard.jsx';
import MetricCards from './performance/MetricCards.jsx';
import DailyChart from './performance/DailyChart.jsx';
import MonthlyChart from './performance/MonthlyChart.jsx';
import Last7DaysChart from './performance/Last7DaysChart.jsx';
import TopProducts from './performance/TopProducts.jsx';
import PaymentBreakdown from './performance/PaymentBreakdown.jsx';

const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    return `${MONTH_NAMES[monthIndex]} ${year}`;
};

const PerformanceView = ({ 
    sales, 
    clients, 
    settings, 
    formatCurrency, 
    monthlyChartData,
    setCommissionModalOpen,
    GOAL_SELLERS, 
    GOAL_MANAGER, 
    COMMISSION_PER_UNIT,
    ELIGIBLE_FOR_GOAL,
    performanceMonthFilter,
    setPerformanceMonthFilter,
    performanceAvailableMonths
}) => {
    const [isMonthFilterOpen, setIsMonthFilterOpen] = useState(false);
    const monthFilterBtnRef = useRef(null);
    const [monthFilterPos, setMonthFilterPos] = useState({ right: 0, top: 0 });

    useEffect(() => {
        if (isMonthFilterOpen && monthFilterBtnRef.current) {
            const rect = monthFilterBtnRef.current.getBoundingClientRect();
            setMonthFilterPos({ right: window.innerWidth - rect.right, top: rect.bottom + 8 });
        }
    }, [isMonthFilterOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMonthFilterOpen && monthFilterBtnRef.current && !monthFilterBtnRef.current.contains(e.target) && !e.target.closest('.performance-month-filter-dropdown')) {
                setIsMonthFilterOpen(false);
            }
        };
        if (isMonthFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMonthFilterOpen]);

    const handleSelectMonth = (month) => {
        setPerformanceMonthFilter(month);
        setIsMonthFilterOpen(false);
    };

    return (
        <div className="space-y-10">
            <div className="classic-frame rounded-[3rem] shadow-vision border border-white/60 p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                    <h2 className="text-3xl font-bold text-slate-200 flex items-center gap-4 font-display"><div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-2xl text-amber-400 shadow-lg shadow-amber-500/20 border border-amber-500/30"><Icons.BarChart className="w-8 h-8" /></div>Desempenho de Vendas <span className="text-slate-500 font-normal text-lg mt-1 block sm:inline">• {settings.employeeName}</span></h2>
                    <div className="flex items-center gap-3">
                        {/* Filtro por Mês */}
                        <div className="relative">
                            <button 
                                ref={monthFilterBtnRef}
                                type="button"
                                onClick={() => setIsMonthFilterOpen(!isMonthFilterOpen)}
                                className="p-4 rounded-[1.5rem] border bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/20 transition-all duration-300 flex items-center gap-3"
                                title="Filtrar por mês"
                            >
                                <Icons.Calendar className="w-5 h-5" />
                                <span className="text-sm font-bold">{formatMonth(performanceMonthFilter)}</span>
                                <Icons.ChevronRight className={`w-4 h-4 transition-transform ${isMonthFilterOpen ? 'rotate-90' : ''}`} />
                            </button>

                            {isMonthFilterOpen && (
                                <Portal>
                                    <div 
                                        className="fixed w-80 bg-[#fdfaf4] border-2 border-[#c9a227]/50 rounded-2xl shadow-2xl overflow-hidden z-[9999] performance-month-filter-dropdown"
                                        style={{ 
                                            right: monthFilterPos.right,
                                            top: monthFilterPos.top,
                                            boxShadow: '0 10px 40px rgba(201,162,39,0.35), 0 0 60px rgba(201,162,39,0.15)'
                                        }}
                                    >
                                        <div className="p-5 border-b border-[#c9a227]/40 bg-gradient-to-r from-[#c9a227]/20 via-[#c9a227]/10 to-transparent">
                                            <h3 className="font-bold text-[#0f0f0f] text-lg flex items-center gap-2 tracking-wide">
                                                <Icons.Calendar className="w-5 h-5 text-[#c9a227]" />
                                                Selecionar Mês
                                            </h3>
                                        </div>
                                        <div className="py-3 px-2">
                                            {performanceAvailableMonths.map(month => (
                                                <button
                                                    key={month}
                                                    type="button"
                                                    onClick={() => handleSelectMonth(month)}
                                                    className={`w-full px-4 py-4 mx-2 my-1 rounded-xl transition-all hover:bg-[#c9a227]/20 border border-transparent hover:border-[#c9a227]/40 ${
                                                        performanceMonthFilter === month ? 'bg-[#c9a227]/20 border-[#c9a227]/40' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-[#c9a227]/20 rounded-lg border border-[#c9a227]/40">
                                                            <span className="text-sm font-bold text-[#8b6914]">
                                                                {month.split('-')[1]}/{month.split('-')[0].slice(-2)}
                                                            </span>
                                                        </div>
                                                        <span className={`text-base font-medium ${performanceMonthFilter === month ? 'text-[#c9a227]' : 'text-[#0f0f0f]'}`}>{formatMonth(month)}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </Portal>
                            )}
                        </div>
                        <button onClick={setCommissionModalOpen} className="btn-gold flex items-center gap-2 px-6 py-3 font-bold rounded-2xl text-sm uppercase tracking-wide" style={{ border: 'none' }}>
                            <Icons.Trophy className="w-5 h-5" />
                            Relatório Premiação
                        </button>
                    </div>
                </div>

                <GoalProgressCard sales={sales} settings={settings} formatCurrency={formatCurrency} GOAL_SELLERS={GOAL_SELLERS} GOAL_MANAGER={GOAL_MANAGER} COMMISSION_PER_UNIT={COMMISSION_PER_UNIT} ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL} performanceMonthFilter={performanceMonthFilter} />

                <MetricCards sales={sales} clients={clients} settings={settings} formatCurrency={formatCurrency} performanceMonthFilter={performanceMonthFilter} />

                <DailyChart sales={sales} settings={settings} formatCurrency={formatCurrency} performanceMonthFilter={performanceMonthFilter} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <MonthlyChart formatCurrency={formatCurrency} monthlyChartData={monthlyChartData} />
                    <Last7DaysChart sales={sales} settings={settings} formatCurrency={formatCurrency} />
                    <TopProducts sales={sales} settings={settings} performanceMonthFilter={performanceMonthFilter} />
                </div>

                <PaymentBreakdown sales={sales} settings={settings} formatCurrency={formatCurrency} performanceMonthFilter={performanceMonthFilter} />
            </div>
        </div>
    );
};

export default PerformanceView;