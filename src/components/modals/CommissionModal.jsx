import Icons from '../Icons.jsx';
import { useState, useRef, useEffect } from 'react';
import Portal from '../Portal.jsx';

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

export default function CommissionModal({ isOpen, onClose, sales, SELLERS_LIST, GOAL_SELLERS, GOAL_MANAGER, COMMISSION_PER_UNIT, ELIGIBLE_FOR_GOAL, formatCurrency, performanceMonthFilter, setPerformanceMonthFilter, performanceAvailableMonths }) {
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
            if (isMonthFilterOpen && monthFilterBtnRef.current && !monthFilterBtnRef.current.contains(e.target) && !e.target.closest('.commission-month-filter-dropdown')) {
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

    if (!isOpen) return null;

    // Parse do mês selecionado
    const [yearStr, monthStr] = (performanceMonthFilter || '2026-04').split('-');
    const selectedMonth = parseInt(monthStr, 10) - 1; // 0-indexed
    const selectedYear = parseInt(yearStr, 10);

    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-500" onClick={onClose}>
            <div className="classic-frame rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-odoo-400 to-odoo-600"></div>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-2xl text-slate-200 font-display flex items-center gap-3"><Icons.Trophy className="w-7 h-7 text-odoo-500" /> Relatório de Premiação</h3>
                    <div className="flex items-center gap-3">
                        {/* Filtro por Mês */}
                        <div className="relative">
                            <button 
                                ref={monthFilterBtnRef}
                                type="button"
                                onClick={() => setIsMonthFilterOpen(!isMonthFilterOpen)}
                                className="p-3 rounded-[1.5rem] border bg-amber-500/20 border-amber-500/40 text-amber-400 transition-all duration-300 flex items-center gap-2"
                                title="Filtrar por mês"
                            >
                                <Icons.Calendar className="w-4 h-4" />
                                <span className="text-xs font-bold">{formatMonth(performanceMonthFilter)}</span>
                                <Icons.ChevronRight className={`w-3 h-3 transition-transform ${isMonthFilterOpen ? 'rotate-90' : ''}`} />
                            </button>

                            {isMonthFilterOpen && (
                                <Portal>
                                    <div 
                                        className="fixed w-72 bg-[#fdfaf4] border-2 border-[#c9a227]/50 rounded-2xl shadow-2xl overflow-hidden z-[9999] commission-month-filter-dropdown"
                                        style={{ 
                                            right: monthFilterPos.right,
                                            top: monthFilterPos.top,
                                            boxShadow: '0 10px 40px rgba(201,162,39,0.35), 0 0 60px rgba(201,162,39,0.15)'
                                        }}
                                    >
                                        <div className="p-4 border-b border-[#c9a227]/40 bg-gradient-to-r from-[#c9a227]/20 via-[#c9a227]/10 to-transparent">
                                            <h3 className="font-bold text-[#0f0f0f] flex items-center gap-2 tracking-wide">
                                                <Icons.Calendar className="w-4 h-4 text-[#c9a227]" />
                                                Selecionar Mês
                                            </h3>
                                        </div>
                                        <div className="py-2 px-2">
                                            {performanceAvailableMonths.map(month => (
                                                <button
                                                    key={month}
                                                    type="button"
                                                    onClick={() => handleSelectMonth(month)}
                                                    className={`w-full px-4 py-3 mx-2 my-1 rounded-xl transition-all hover:bg-[#c9a227]/20 border border-transparent hover:border-[#c9a227]/40 ${
                                                        performanceMonthFilter === month ? 'bg-[#c9a227]/20 border-[#c9a227]/40' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-[#c9a227]/20 rounded-lg border border-[#c9a227]/40">
                                                            <span className="text-xs font-bold text-[#8b6914]">
                                                                {month.split('-')[1]}/{month.split('-')[0].slice(-2)}
                                                            </span>
                                                        </div>
                                                        <span className={`text-sm font-medium ${performanceMonthFilter === month ? 'text-[#c9a227]' : 'text-[#0f0f0f]'}`}>{formatMonth(month)}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </Portal>
                            )}
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors"><Icons.X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                </div>
                <div>
                    <p className="text-sm text-slate-500 mb-8 font-medium">{MONTH_NAMES[selectedMonth]} {selectedYear} • Todos os vendedores</p>
                    <div className="space-y-6">
                        {SELLERS_LIST.map(seller => {
                            const isManager = seller === "Sabrina Almeida";
                            const myTarget = isManager ? GOAL_MANAGER : GOAL_SELLERS;

                            let sellerSales;
                            if (isManager) {
                                sellerSales = sales.filter(s => {
                                    const d = new Date((s.date||'') + 'T00:00:00');
                                    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
                                });
                            } else {
                                sellerSales = sales.filter(s => {
                                    const d = new Date((s.date||'') + 'T00:00:00');
                                    return s.employeeName === seller && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
                                });
                            }
                            const units = sellerSales.reduce((acc, s) => {
                                const pos = (s.items||[]).filter(i => ELIGIBLE_FOR_GOAL.includes(i.type) && i.unitPrice > 0);
                                const neg = (s.items||[]).filter(i => ELIGIBLE_FOR_GOAL.includes(i.type) && i.unitPrice < 0);
                                return acc + pos.reduce((sum,i)=>sum+i.quantity,0) - neg.reduce((sum,i)=>sum+Math.abs(i.quantity),0);
                            }, 0);
                            const totalRevenue = sellerSales.reduce((acc,s)=>acc+(s.amountPaid||s.amount||0),0);
                            const goalReached = units >= myTarget;
                            const commission = goalReached ? units * COMMISSION_PER_UNIT : 0;
                            const progress = Math.min((units / myTarget) * 100, 100);
                            return (
                                <div key={seller} className="p-8 rounded-[2rem] border border-white/10 bg-white/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-bold text-slate-200 text-lg">{seller}</p>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{isManager ? "Gerente" : "Vendedora"}</p>
                                        </div>
                                        {goalReached ? <span className="bg-amber-500/20 text-amber-600 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase">Meta Atingida ✓</span> : <span className="bg-white/5 text-slate-500 border border-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase">{Math.max(0, myTarget - units)} un. p/ meta</span>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mb-5">
                                        <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Aparelhos</p>
                                            <p className="text-2xl font-black text-slate-200">{units}<span className="text-sm text-slate-500">/{myTarget}</span></p>
                                        </div>
                                        <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Faturamento</p>
                                            <p className="text-lg font-black text-slate-200">R$ {formatCurrency(totalRevenue)}</p>
                                        </div>
                                        <div className={`text-center p-4 rounded-2xl border ${goalReached ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/10'}`}>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Premiação</p>
                                            <p className={`text-lg font-black ${goalReached ? 'text-amber-500' : 'text-slate-500'}`}>R$ {formatCurrency(commission)}</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${goalReached ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-slate-500 to-slate-400'}`} style={{width: `${progress}%`}}></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 text-right">{Math.round(progress)}% da meta</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Premiação por unidade elegível: R$ {formatCurrency(COMMISSION_PER_UNIT)} • Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}