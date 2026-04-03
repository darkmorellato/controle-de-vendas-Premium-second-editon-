import Icons from '../Icons.jsx';

const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const typeColors = [
    { bg: 'from-amber-500 to-yellow-400', text: 'text-amber-900', glow: 'shadow-amber-500/30' },
    { bg: 'from-blue-500 to-cyan-400', text: 'text-blue-900', glow: 'shadow-blue-500/30' },
    { bg: 'from-emerald-500 to-teal-400', text: 'text-emerald-900', glow: 'shadow-emerald-500/30' },
    { bg: 'from-violet-500 to-purple-400', text: 'text-violet-900', glow: 'shadow-violet-500/30' },
    { bg: 'from-rose-500 to-pink-400', text: 'text-rose-900', glow: 'shadow-rose-500/30' },
    { bg: 'from-orange-500 to-amber-400', text: 'text-orange-900', glow: 'shadow-orange-500/30' },
    { bg: 'from-cyan-500 to-sky-400', text: 'text-cyan-900', glow: 'shadow-cyan-500/30' },
    { bg: 'from-indigo-500 to-blue-400', text: 'text-indigo-900', glow: 'shadow-indigo-500/30' },
];

export default function SellerReportModal({ isOpen, onClose, seller, sales, formatCurrency, performanceMonthFilter }) {
    if (!isOpen) return null;

    const [yearStr, monthStr] = (performanceMonthFilter || '2026-04').split('-');
    const selectedMonth = parseInt(monthStr, 10) - 1;
    const selectedYear = parseInt(yearStr, 10);

    const sellerSales = sales.filter(s => {
        const d = new Date((s.date || '') + 'T00:00:00');
        return s.employeeName === seller && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const allItems = [];
    sellerSales.forEach(s => {
        (s.items || []).forEach(item => {
            allItems.push({
                date: s.date,
                clientName: s.clientName,
                description: item.description,
                type: item.type,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice,
            });
        });
    });

    const totalRevenue = sellerSales.reduce((a, s) => a + (s.amountPaid || s.amount || 0), 0);
    const totalItems = allItems.reduce((a, i) => a + (i.quantity > 0 ? i.quantity : 0), 0);

    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-500" onClick={onClose}>
            <div className="classic-frame rounded-[3rem] p-10 max-w-4xl w-full shadow-2xl animate-in zoom-in-95 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-2xl text-amber-400 shadow-lg shadow-amber-500/20 border border-amber-500/30">
                            <Icons.FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-2xl text-slate-200 font-display">Relatório de Vendas</h3>
                            <p className="text-sm text-slate-500">{seller}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
                        <Icons.X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full">
                        <Icons.Calendar className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold text-amber-400">{MONTH_NAMES[selectedMonth]} {selectedYear}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                        <span className="text-sm text-slate-400">{sellerSales.length} venda{sellerSales.length !== 1 ? 's' : ''} • {totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Gráfico por Tipo */}
                {allItems.length > 0 && (() => {
                    const typeStats = {};
                    allItems.forEach(item => {
                        if (!typeStats[item.type]) {
                            typeStats[item.type] = { qty: 0, value: 0 };
                        }
                        typeStats[item.type].qty += item.quantity;
                        typeStats[item.type].value += Math.abs(item.total);
                    });
                    const sortedTypes = Object.entries(typeStats).sort((a, b) => b[1].value - a[1].value);
                    const maxValue = sortedTypes[0]?.[1]?.value || 1;

                    return (
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 mb-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-xl text-amber-400">
                                    <Icons.BarChart className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vendas por Tipo</h4>
                            </div>
                            <div className="space-y-4">
                                {sortedTypes.map(([type, data], idx) => {
                                    const colors = typeColors[idx % typeColors.length];
                                    const percent = Math.round((data.value / maxValue) * 100);
                                    return (
                                        <div key={type} className="group">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{type}</span>
                                                    <span className="text-[10px] text-slate-500">({data.qty} un)</span>
                                                </div>
                                                <span className="text-sm font-bold text-amber-400">R$ {formatCurrency(data.value)}</span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden shadow-inner">
                                                <div 
                                                    className={`h-full rounded-full bg-gradient-to-r ${colors.bg} transition-all duration-1000 shadow-md group-hover:shadow-lg ${colors.glow}`}
                                                    style={{ width: `${percent}%` }}
                                                >
                                                    <div className="h-full w-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shimmer"></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}

                {allItems.length > 0 ? (
                    <>
                        <div className="bg-[#fdfaf4] rounded-[2rem] border border-amber-500/20 overflow-hidden shadow-lg shadow-amber-500/10 mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-amber-500/5 text-amber-900 text-[10px] font-bold uppercase tracking-widest border-b border-amber-500/20">
                                        <tr>
                                            <th className="p-4 pl-6 text-left">Data</th>
                                            <th className="p-4 text-left">Produto</th>
                                            <th className="p-4 text-left">Tipo</th>
                                            <th className="p-4 text-center">Qtd</th>
                                            <th className="p-4 text-right">Unitário</th>
                                            <th className="p-4 text-right pr-6">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-amber-500/10">
                                        {allItems.sort((a, b) => (b.date || '').localeCompare(a.date || '')).map((item, idx) => (
                                            <tr key={idx} className="hover:bg-amber-500/10 transition-all duration-300 group">
                                                <td className="p-4 pl-6 text-amber-900/50 font-mono text-xs whitespace-nowrap">                                                {item.date ? (() => { const [_y, m, d] = item.date.split('-'); return `${d}/${m}`; })() : '-'}</td>
                                                <td className="p-4 font-semibold text-amber-900 group-hover:text-amber-700 transition-colors">{item.description}</td>
                                                <td className="p-4">
                                                    <span className="bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2 py-1 rounded-full text-[10px] font-bold uppercase">{item.type}</span>
                                                </td>
                                                <td className="p-4 text-center font-bold text-amber-900">{item.quantity}</td>
                                                <td className="p-4 text-right font-mono text-amber-900/70">R$ {formatCurrency(Math.abs(item.unitPrice))}</td>
                                                <td className="p-4 text-right pr-6 font-mono font-bold text-amber-900 whitespace-nowrap">R$ {formatCurrency(Math.abs(item.total))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-[2rem] p-6 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total de Itens Vendidos</p>
                                <p className="text-2xl font-black text-amber-400">{totalItems} un</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Faturamento Total</p>
                                <p className="text-2xl font-black text-amber-400">R$ {formatCurrency(totalRevenue)}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16 text-slate-500">
                        <Icons.Package className="w-16 h-16 opacity-20 mx-auto mb-4" />
                        <p className="font-bold text-xl text-slate-400">Nenhuma venda registrada</p>
                        <p className="text-sm mt-2">Não há vendas de {seller.split(' ')[0]} em {MONTH_NAMES[selectedMonth]} {selectedYear}.</p>
                    </div>
                )}
            </div>
        </div>
    );
}