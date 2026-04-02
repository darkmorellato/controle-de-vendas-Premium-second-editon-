import Icons from '../../Icons.jsx';

const TopProducts = ({ sales, settings, performanceMonthFilter }) => {
    const mySales = sales.filter(s => s.employeeName === settings.employeeName);
    const [yearStr, monthStr] = (performanceMonthFilter || '2026-04').split('-');
    const currentMonth = parseInt(monthStr, 10) - 1;
    const currentYear = parseInt(yearStr, 10);
    const productCount = {};
    mySales.forEach(s => { const d = new Date(s.date + 'T00:00:00'); if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) { (s.items || []).forEach(i => { const key = i.description; productCount[key] = (productCount[key] || 0) + i.quantity; }); } });
    const sortedProducts = Object.entries(productCount).sort(([, a], [, b]) => b - a).slice(0, 5);

    if (sortedProducts.length === 0) return (
        <div className="border border-white/10 rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-odoo-900/20 transition-all duration-500 bg-gradient-to-br from-orange-500/5 via-orange-500/2 to-transparent backdrop-blur-md">
            <h3 className="font-bold text-xs text-orange-400 uppercase mb-8 tracking-widest flex items-center gap-3"><div className="p-2 bg-orange-500/20 rounded-lg"><Icons.Package className="w-4 h-4" /></div> Top Produtos (Mês)</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-sm text-slate-400 italic text-center py-10">Nenhuma venda registrada neste mês.</p>
            </div>
        </div>
    );

    const productColors = [
        { bg: 'from-amber-400 to-yellow-500', text: 'text-amber-900', shadow: 'shadow-amber-500/40', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]' },
        { bg: 'from-slate-600 to-slate-400', text: 'text-white', shadow: 'shadow-slate-500/40', glow: 'shadow-[0_0_15px_rgba(148,163,184,0.4)]' },
        { bg: 'from-orange-600 to-amber-500', text: 'text-orange-950', shadow: 'shadow-orange-500/40', glow: 'shadow-[0_0_15px_rgba(234,88,12,0.4)]' },
        { bg: 'from-violet-500 to-purple-400', text: 'text-white', shadow: 'shadow-violet-500/40', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.4)]' },
        { bg: 'from-cyan-500 to-teal-400', text: 'text-cyan-900', shadow: 'shadow-cyan-500/40', glow: 'shadow-[0_0_15px_rgba(20,184,166,0.4)]' }
    ];

    return (
        <div className="border border-white/10 rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-odoo-900/20 transition-all duration-500 bg-gradient-to-br from-orange-500/5 via-orange-500/2 to-transparent backdrop-blur-md">
            <h3 className="font-bold text-xs text-orange-400 uppercase mb-8 tracking-widest flex items-center gap-3"><div className="p-2 bg-orange-500/20 rounded-lg"><Icons.Package className="w-4 h-4" /></div> Top Produtos (Mês)</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {sortedProducts.map(([name, qty], idx) => {
                    const colors = productColors[idx] || productColors[4];
                    return (
                        <div key={name} className="flex justify-between items-center text-sm p-4 hover:bg-white/5 rounded-[1.5rem] transition-all duration-300 group border border-transparent hover:border-white/5 hover:scale-[1.02]">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-black shadow-md ${colors.bg} ${colors.text} ${colors.shadow} ${idx === 0 ? colors.glow : ''} transition-all duration-300 group-hover:scale-110`}>{idx + 1}</span>
                                <span className="truncate font-medium text-slate-400 group-hover:text-white transition-colors">{name}</span>
                            </div>
                            <span className={`font-bold ${colors.text.split('-')[1] ? `text-${colors.text.split('-')[1]}` : 'text-white'} bg-gradient-to-r ${colors.bg} px-4 py-2 rounded-xl text-xs shadow-md`}>{qty} un</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopProducts;
