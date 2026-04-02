import Icons from '../Icons.jsx';
import { useState, useRef, useEffect } from 'react';
import Portal from '../Portal.jsx';
import SellerReportModal from '../modals/SellerReportModal.jsx';

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

const ManagerView = ({ 
    sales, 
    formatCurrency, 
    SELLERS_LIST, 
    GOAL_SELLERS, 
    GOAL_MANAGER, 
    COMMISSION_PER_UNIT,
    ELIGIBLE_FOR_GOAL,
    managerMonthFilter,
    setManagerMonthFilter,
    managerAvailableMonths
}) => {
    const [isMonthFilterOpen, setIsMonthFilterOpen] = useState(false);
    const monthFilterBtnRef = useRef(null);
    const [monthFilterPos, setMonthFilterPos] = useState({ right: 0, top: 0 });
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [selectedSellerForReport, setSelectedSellerForReport] = useState(null);

    useEffect(() => {
        if (isMonthFilterOpen && monthFilterBtnRef.current) {
            const rect = monthFilterBtnRef.current.getBoundingClientRect();
            setMonthFilterPos({ right: window.innerWidth - rect.right, top: rect.bottom + 8 });
        }
    }, [isMonthFilterOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMonthFilterOpen && monthFilterBtnRef.current && !monthFilterBtnRef.current.contains(e.target) && !e.target.closest('.manager-month-filter-dropdown')) {
                setIsMonthFilterOpen(false);
            }
        };
        if (isMonthFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMonthFilterOpen]);

    const handleSelectMonth = (month) => {
        setManagerMonthFilter(month);
        setIsMonthFilterOpen(false);
    };

    const openSellerReport = (seller) => {
        setSelectedSellerForReport(seller);
        setReportModalOpen(true);
    };

    const [yearStr, monthStr] = (managerMonthFilter || '2026-04').split('-');
    const cm = parseInt(monthStr, 10) - 1;
    const cy = parseInt(yearStr, 10);

    return (
        <div className="space-y-8">
            <div className="classic-frame rounded-[3rem] shadow-vision border border-white/60 p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                    <h2 className="text-3xl font-bold text-slate-200 flex items-center gap-4 font-display">
                        <div className="p-3 bg-white/10 rounded-2xl text-odoo-500 shadow-sm border border-white/5"><Icons.Trophy className="w-8 h-8" /></div>
                        Painel Gerencial
                    </h2>
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
                                <span className="text-xs font-bold">{formatMonth(managerMonthFilter)}</span>
                                <Icons.ChevronRight className={`w-3 h-3 transition-transform ${isMonthFilterOpen ? 'rotate-90' : ''}`} />
                            </button>

                            {isMonthFilterOpen && (
                                <Portal>
                                    <div 
                                        className="fixed w-72 bg-[#fdfaf4] border-2 border-[#c9a227]/50 rounded-2xl shadow-2xl overflow-hidden z-[9999] manager-month-filter-dropdown"
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
                                            {managerAvailableMonths.map(month => (
                                                <button
                                                    key={month}
                                                    type="button"
                                                    onClick={() => handleSelectMonth(month)}
                                                    className={`w-full px-4 py-3 mx-2 my-1 rounded-xl transition-all hover:bg-[#c9a227]/20 border border-transparent hover:border-[#c9a227]/40 ${
                                                        managerMonthFilter === month ? 'bg-[#c9a227]/20 border-[#c9a227]/40' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-[#c9a227]/20 rounded-lg border border-[#c9a227]/40">
                                                            <span className="text-xs font-bold text-[#8b6914]">
                                                                {month.split('-')[1]}/{month.split('-')[0].slice(-2)}
                                                            </span>
                                                        </div>
                                                        <span className={`text-sm font-medium ${managerMonthFilter === month ? 'text-[#c9a227]' : 'text-[#0f0f0f]'}`}>{formatMonth(month)}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </Portal>
                            )}
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_6px_#10b981] animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Tempo Real</span>
                        </div>
                    </div>
                </div>
                {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const mSales = sales.filter(s => { const d = new Date((s.date||'')+'T00:00:00'); return d.getMonth()===cm && d.getFullYear()===cy; });
                    const todayRev = sales.filter(s => s.date === today).reduce((a,s)=>a+(s.amountPaid||s.amount||0),0);
                    const monthRev = mSales.reduce((a,s)=>a+(s.amountPaid||s.amount||0),0);
                    const cnt = mSales.filter(s=>(s.amountPaid||s.amount||0)>0).length;
                    const avgT = cnt > 0 ? monthRev/cnt : 0;
                    const units = mSales.reduce((acc,s)=>{
                        const pos=(s.items||[]).filter(i=>ELIGIBLE_FOR_GOAL.includes(i.type)&&i.unitPrice>0);
                        const neg=(s.items||[]).filter(i=>ELIGIBLE_FOR_GOAL.includes(i.type)&&i.unitPrice<0);
                        return acc+pos.reduce((sum,i)=>sum+i.quantity,0)-neg.reduce((sum,i)=>sum+Math.abs(i.quantity),0);
                    },0);
                    const kpis = [
                        { label:'Faturamento Hoje', val:`R$ ${formatCurrency(todayRev)}`, color:'text-emerald-400', bg:'bg-emerald-500/10 border-emerald-500/20' },
                        { label:'Faturamento Mês',  val:`R$ ${formatCurrency(monthRev)}`, color:'text-odoo-400',    bg:'bg-odoo-500/10 border-odoo-500/20' },
                        { label:'Nº de Vendas',     val:cnt,                               color:'text-blue-400',    bg:'bg-blue-500/10 border-blue-500/20' },
                        { label:'Aparelhos Vendidos',val:`${units} un`,                    color:'text-violet-400',  bg:'bg-violet-500/10 border-violet-500/20' },
                        { label:'Ticket Médio',     val:`R$ ${formatCurrency(avgT)}`,      color:'text-amber-400',   bg:'bg-amber-500/10 border-amber-500/20' },
                    ];
                    return (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                            {kpis.map(k=>(
                                <div key={k.label} className={`p-6 rounded-[2rem] border ${k.bg} hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 leading-tight">{k.label}</p>
                                    <p className={`text-lg font-black ${k.color} leading-tight`}>{k.val}</p>
                                </div>
                            ))}
                        </div>
                    );
                })()}
                {(() => {
                    const countU = (arr) => arr.reduce((acc,s)=>{
                        const pos=(s.items||[]).filter(i=>ELIGIBLE_FOR_GOAL.includes(i.type)&&i.unitPrice>0);
                        const neg=(s.items||[]).filter(i=>ELIGIBLE_FOR_GOAL.includes(i.type)&&i.unitPrice<0);
                        return acc+pos.reduce((sum,i)=>sum+i.quantity,0)-neg.reduce((sum,i)=>sum+Math.abs(i.quantity),0);
                    },0);
                    const COLORS = ['text-[#f8bbd0]','text-[#6EA8FE]'];
                    const RINGS  = ['ring-[#f8bbd0]/20','ring-[#6EA8FE]/20'];
                    const BAR_CLS = ['bg-gradient-to-r from-[#f8bbd0] to-[#f48fb1]','bg-gradient-to-r from-[#6EA8FE] to-[#4285F4]'];
                    const BAR_V   = ['bg-gradient-to-t from-[#f8bbd0] to-[#f48fb1]','bg-gradient-to-t from-[#6EA8FE] to-[#4285F4]'];
                    const data = SELLERS_LIST.map((seller,idx)=>{
                        const ms = sales.filter(s=>{ const d=new Date((s.date||'')+'T00:00:00'); return s.employeeName===seller&&d.getMonth()===cm&&d.getFullYear()===cy; });
                        const units = countU(ms);
                        const rev   = ms.reduce((a,s)=>a+(s.amountPaid||s.amount||0),0);
                        const cnt   = ms.filter(s=>(s.amountPaid||s.amount||0)>0).length;
                        const avgT  = cnt>0?rev/cnt:0;
                        const prog  = Math.min((units/GOAL_SELLERS)*100,100);
                        const goalOk= units>=GOAL_SELLERS;
                        const comm  = goalOk ? units*COMMISSION_PER_UNIT : 0;
                        return { seller, units, rev, cnt, avgT, prog, goalOk, comm, color:COLORS[idx], ring:RINGS[idx], bar:BAR_CLS[idx], barV:BAR_V[idx] };
                    });
                    const sorted = [...data].sort((a,b)=>b.units-a.units);
                    const maxRev = Math.max(...data.map(d=>d.rev),1);

                    return (
                        <div className="space-y-8">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-odoo-400 animate-pulse shadow-[0_0_6px_theme('colors.odoo.400')]"></span>
                                Ranking — {formatMonth(managerMonthFilter)}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sorted.map((d,rank)=>(
                                    <div key={d.seller} className={`relative p-8 rounded-[2.5rem] border border-white/10 bg-white/5 ring-2 ${d.ring} hover:bg-white/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}>
                                        <div className="absolute -top-4 -left-2 w-10 h-10 flex items-center justify-center rounded-2xl font-black text-xl shadow-xl" style={{background:rank===0?'linear-gradient(135deg,#c9a227,#f5e4ab)':'#1a1a1a',color:rank===0?'#0f0f0f':'#666',border:'2px solid rgba(255,255,255,0.15)'}}>
                                            {rank===0?'🥇':'🥈'}
                                        </div>
                                        <div className="flex justify-between items-start mb-6 mt-2">
                                            <div>
                                                <p className={`font-black text-xl ${d.color}`}>{d.seller.split(' ')[0]}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{d.seller.split(' ').slice(1).join(' ')}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => openSellerReport(d.seller)}
                                                    className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 hover:bg-amber-500/20 hover:shadow-lg hover:shadow-amber-500/20 transition-all active-scale"
                                                >
                                                    <Icons.FileText className="w-3 h-3" />
                                                    Relatório
                                                </button>
                                                {d.goalOk
                                                    ? <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Icons.Trophy className="w-3 h-3"/> Meta!</span>
                                                    : <span className="bg-white/5 text-slate-500 border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold">{Math.max(0,GOAL_SELLERS-d.units)} un p/ meta</span>
                                                }
                                            </div>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-3 mb-1 overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-1000 ${d.goalOk?'bg-gradient-to-r from-amber-400 to-amber-500':'bg-gradient-to-r from-slate-500 to-slate-400'}`} style={{width:`${d.prog}%`}}></div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 text-right mb-6">{d.units} / {GOAL_SELLERS} un • {Math.round(d.prog)}%</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                                <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Faturamento</p>
                                                <p className="font-black text-slate-200">R$ {formatCurrency(d.rev)}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                                <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Ticket Médio</p>
                                                <p className="font-black text-slate-200">R$ {formatCurrency(d.avgT)}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                                <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Nº Vendas</p>
                                                <p className="font-black text-slate-200 text-2xl">{d.cnt}</p>
                                            </div>
                                            <div className={`p-4 rounded-2xl border text-center ${d.goalOk?'bg-amber-500/10 border-amber-500/20':'bg-white/5 border-white/10'}`}>
                                                <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Premiação</p>
                                                <p className={`font-black ${d.goalOk?'text-amber-400':'text-slate-500'}`}>R$ {formatCurrency(d.comm)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-8 rounded-[2.5rem] border border-white/10 bg-white/5">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Aparelhos vs Meta ({GOAL_SELLERS} un) — {formatMonth(managerMonthFilter)}</p>
                                <div className="space-y-5">
                                    {sorted.map((d,idx)=>(
                                        <div key={d.seller}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`font-bold text-sm ${d.color}`}>{d.seller.split(' ')[0]}</span>
                                                <span className="font-mono font-bold text-slate-400 text-sm">{d.units} <span className="text-slate-600">/ {GOAL_SELLERS} un</span></span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-5 overflow-hidden relative">
                                                <div className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10" style={{left:'100%'}}></div>
                                                <div className={`h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-3 ${d.goalOk?'bg-gradient-to-r from-amber-400 to-amber-500':d.bar}`} style={{width:`${d.prog}%`,minWidth:d.units>0?'2rem':'0'}}>
                                                    {d.prog>18&&<span className="text-[10px] font-black text-white">{Math.round(d.prog)}%</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-8 rounded-[2.5rem] border border-white/10 bg-white/5">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Faturamento por Vendedora — {formatMonth(managerMonthFilter)}</p>
                                <div className="h-48 flex items-end gap-8 justify-center px-4">
                                    {sorted.map((d,i)=>{
                                        const h = Math.max((d.rev/maxRev)*100,4);
                                        return (
                                            <div key={d.seller} className="flex flex-col items-center flex-1 group/bar h-full justify-end max-w-[200px] relative">
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-amber-500/30 text-amber-100 text-[11px] font-bold px-4 py-2 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all whitespace-nowrap z-10 shadow-xl pointer-events-none">
                                                    <span className="text-amber-300">{d.seller.split(' ')[0]}</span>: R$ {formatCurrency(d.rev)}
                                                </div>
                                                <div className={`w-full rounded-t-2xl ${d.barV} shadow-lg transition-all duration-1000`} style={{height:`${h}%`}}></div>
                                                <p className={`font-bold text-sm mt-4 ${d.color}`}>{d.seller.split(' ')[0]}</p>
                                                <p className="text-[10px] text-slate-500 font-mono">R$ {formatCurrency(d.rev)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            <SellerReportModal 
                isOpen={reportModalOpen} 
                onClose={() => setReportModalOpen(false)} 
                seller={selectedSellerForReport} 
                sales={sales} 
                formatCurrency={formatCurrency} 
                performanceMonthFilter={managerMonthFilter}
            />
        </div>
    );
};

export default ManagerView;