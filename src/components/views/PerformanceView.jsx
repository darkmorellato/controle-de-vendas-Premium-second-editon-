import { memo } from 'react';
import Icons from '../Icons.jsx';
import MonthFilterDropdown from '../MonthFilterDropdown.jsx';
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
    return (
        <div className="space-y-10">
            <div className="classic-frame rounded-[3rem] shadow-vision border border-white/60 p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                    <h2 className="text-3xl font-bold text-slate-200 flex items-center gap-4 font-display"><div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-2xl text-amber-400 shadow-lg shadow-amber-500/20 border border-amber-500/30"><Icons.BarChart className="w-8 h-8" /></div>Desempenho de Vendas <span className="text-slate-500 font-normal text-lg mt-1 block sm:inline">• {settings.employeeName}</span></h2>
                    <div className="flex items-center gap-3">
                        <MonthFilterDropdown
                            monthFilter={performanceMonthFilter}
                            setMonthFilter={setPerformanceMonthFilter}
                            availableMonths={performanceAvailableMonths}
                            formatMonth={formatMonth}
                            dropdownClassName="performance-month-filter-dropdown"
                            dropdownTitle="Selecionar Mês"
                            showButtonText
                            showTodosOption={false}
                        />
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

export default memo(PerformanceView);