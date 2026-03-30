import Icons from '../../Icons.jsx';

const MonthlyChart = ({ formatCurrency, monthlyChartData }) => {
    const safeMonthlyData = monthlyChartData && monthlyChartData.length > 0 ? monthlyChartData : [
        { label: '-', total: 0, count: 0 },
        { label: '-', total: 0, count: 0 },
        { label: '-', total: 0, count: 0 },
        { label: '-', total: 0, count: 0 },
        { label: '-', total: 0, count: 0 },
        { label: '-', total: 0, count: 0 }
    ];
    const maxVal = Math.max(...safeMonthlyData.map(d => d.total), 1);

    return (
        <div className="border border-white/10 rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-odoo-900/20 transition-all duration-500 bg-gradient-to-br from-blue-500/5 via-blue-500/2 to-transparent backdrop-blur-md group md:col-span-2">
            <h3 className="font-bold text-xs text-blue-400 uppercase mb-4 tracking-widest flex items-center gap-3"><div className="p-2 bg-blue-500/20 rounded-lg"><Icons.Calendar className="w-4 h-4" /></div> Comparativo Mensal (6 meses)</h3>
            <p className="text-[10px] text-slate-500 mb-8 uppercase tracking-widest">Todos os vendedores • R$ total por mês</p>
            <div className="h-48 flex items-end gap-3 justify-between px-2">
                {safeMonthlyData.map((d, idx) => {
                    const heightPercent = Math.max((d.total / maxVal) * 100, 4);
                    const isCurrent = idx === safeMonthlyData.length - 1;
                    const colors = ['from-blue-600 to-blue-400', 'from-indigo-600 to-indigo-400', 'from-violet-600 to-violet-400', 'from-purple-600 to-purple-400', 'from-fuchsia-600 to-fuchsia-400', 'from-amber-600 to-yellow-500'];
                    const currentColor = isCurrent ? 'from-amber-600 to-yellow-500 shadow-[0_0_20px_rgba(212,142,21,0.5)]' : colors[idx] || 'from-slate-600 to-slate-400';
                    return (
                        <div key={d.label} className="flex flex-col items-center flex-1 group/bar relative h-full justify-end">
                            <div className={`w-full rounded-t-2xl transition-all duration-700 relative overflow-hidden bg-gradient-to-t ${currentColor} ${!isCurrent && 'group-hover/bar:brightness-110'}`} style={{ height: `${heightPercent}%` }}>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/bar:translate-y-0 transition-transform duration-700"></div>
                            </div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 bg-gradient-to-b from-blue-900/95 to-slate-800 border-2 border-blue-500/50 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all duration-300 shadow-xl shadow-blue-500/40 z-30 whitespace-nowrap flex flex-col items-center pointer-events-none">
                                <span className="text-blue-300 font-black">{formatCurrency(d.total)}</span>
                                <span className="text-blue-400/70 text-[8px]">{d.count}</span>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gradient-to-b from-blue-900 to-slate-800 border-r border-b border-blue-500/50 rotate-45"></div>
                            </div>
                            <span className={`text-[10px] font-bold mt-3 ${isCurrent ? 'text-amber-400' : 'text-blue-400/70'}`}>{d.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthlyChart;
