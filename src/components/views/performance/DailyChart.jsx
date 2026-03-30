import Icons from '../../Icons.jsx';

const DailyChart = ({ sales, settings, formatCurrency }) => {
    const mySales = sales.filter(s => s.employeeName === settings.employeeName);
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const monthData = [];

    for (let i = 1; i <= days; i++) {
        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const daySales = mySales.filter(s => s.date === dayStr);
        const val = daySales.reduce((acc, s) => acc + (s.amountPaid || s.amount), 0);
        const count = daySales.length;
        monthData.push({ day: i, val, count });
    }
    const maxVal = Math.max(...monthData.map(d => d.val), 100);

    return (
        <div className="border border-white/10 rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-odoo-900/20 transition-all duration-500 bg-gradient-to-br from-amber-500/5 via-amber-500/2 to-transparent backdrop-blur-md mb-10">
            <h3 className="font-bold text-xs text-amber-400 uppercase mb-10 tracking-widest flex items-center gap-3"><div className="p-2 bg-amber-500/20 rounded-lg"><Icons.BarChart className="w-4 h-4" /></div> Vendas do Mês (Gráfico Completo)</h3>
            <div className="h-64 flex items-end gap-1.5 justify-between px-2 overflow-x-auto">
                {monthData.map(d => (
                    <div key={d.day} className="flex flex-col items-center flex-1 group/bar relative h-full justify-end min-w-[28px]">
                        <div className={`w-full rounded-full transition-all duration-500 relative ${d.val > 0 ? 'bg-gradient-to-t from-amber-600 to-yellow-500 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/30' : 'bg-white/10'}`} style={{ height: `${Math.max((d.val / maxVal) * 100, 4)}%` }}>
                            {d.val > 0 && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-amber-900/95 to-slate-800 border-2 border-amber-500/50 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all duration-300 shadow-xl shadow-amber-500/40 z-30 whitespace-nowrap flex flex-col items-center gap-0.5 pointer-events-none">
                                    <span className="text-amber-300 font-black text-xs">{formatCurrency(d.val)}</span>
                                    <span className="text-amber-400/70 text-[8px]">{d.count}</span>
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] text-amber-500/70 mt-1 font-bold">{d.day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyChart;
