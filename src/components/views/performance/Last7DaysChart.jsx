import Icons from '../../Icons.jsx';

const Last7DaysChart = ({ sales, settings, formatCurrency }) => {
    const mySales = sales.filter(s => s.employeeName === settings.employeeName);
    const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0]; });
    const data = last7Days.map(date => { const val = mySales.filter(s => s.date === date).reduce((acc, s) => acc + (s.amountPaid || s.amount), 0); return { date, val }; });
    const maxVal = Math.max(...data.map(d => d.val), 1);

    return (
        <div className="border border-white/10 rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-odoo-900/20 transition-all duration-500 bg-white/5 backdrop-blur-md group">
            <h3 className="font-bold text-xs text-green-400 uppercase mb-10 tracking-widest flex items-center gap-3"><div className="p-2 bg-green-500/20 rounded-lg"><Icons.Clock className="w-4 h-4" /></div> últimos 7 Dias</h3>
            <div className="h-64 flex items-end gap-4 justify-between px-2">
                {data.map((d, idx) => {
                    const [_year, month, day] = d.date.split('-');
                    const heightPercent = Math.max((d.val / maxVal) * 100, 4);
                    const isToday = idx === 6;
                    return (<div key={d.date} className="flex flex-col items-center flex-1 group/bar relative h-full justify-end"><div className={`w-full rounded-t-2xl transition-all duration-500 relative overflow-hidden ${isToday ? 'bg-gradient-to-t from-green-500 to-emerald-400 shadow-lg shadow-green-500/30' : 'bg-gradient-to-t from-green-700/60 to-green-500/40 group-hover/bar:from-green-500 group-hover/bar:to-green-400'}`} style={{ height: `${heightPercent}%` }}><div className="absolute inset-0 bg-white/20 translate-y-full group-hover/bar:translate-y-0 transition-transform duration-700"></div></div><div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 bg-gradient-to-b from-green-900/95 to-slate-800 border-2 border-green-500/50 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all duration-300 shadow-xl shadow-green-500/40 z-30 whitespace-nowrap flex flex-col items-center pointer-events-none"><span className="text-green-300 font-black">{formatCurrency(d.val)}</span><span className="text-green-400/70 text-[8px]">Dia {day}</span><div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gradient-to-b from-green-900 to-slate-800 border-r border-b border-green-500/50 rotate-45"></div></div><span className={`text-[10px] font-bold mt-4 ${isToday ? 'text-green-400' : 'text-green-500/70 group-hover/bar:text-green-400'} transition-colors`}>{day}/{month}</span></div>);
                })}
            </div>
        </div>
    );
};

export default Last7DaysChart;
