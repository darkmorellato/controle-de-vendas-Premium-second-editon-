import Icons from '../../Icons.jsx';

const PaymentBreakdown = ({ sales, settings, formatCurrency }) => {
    const mySales = sales.filter(s => s.employeeName === settings.employeeName);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const paymentStats = {}; let totalPayments = 0;
    mySales.forEach(s => { const d = new Date(s.date + 'T00:00:00'); if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) { (s.payments || []).forEach(p => { if (p.amount > 0) { paymentStats[p.method] = (paymentStats[p.method] || 0) + p.amount; totalPayments += p.amount; } }); } });
    const sortedPayments = Object.entries(paymentStats).sort(([, a], [, b]) => b - a);

    const paymentColors = {
        'Dinheiro': 'from-green-500 to-emerald-400',
        'PIX': 'from-purple-500 to-fuchsia-400',
        'Débito': 'from-blue-500 to-cyan-400',
        'Crédito': 'from-orange-500 to-amber-400',
        'Crediário': 'from-rose-500 to-pink-400',
        'Boleto': 'from-slate-500 to-slate-400'
    };

    const typeStats = {}; let totalItems = 0;
    mySales.forEach(s => { const d = new Date(s.date + 'T00:00:00'); if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) { (s.items || []).forEach(i => { if (i.quantity > 0) { typeStats[i.type] = (typeStats[i.type] || 0) + i.quantity; totalItems += i.quantity; } }); } });
    const sortedTypes = Object.entries(typeStats).sort(([, a], [, b]) => b - a).slice(0, 6);

    const catStats = {}; let totalCount = 0;
    mySales.forEach(s => { const d = new Date(s.date + 'T00:00:00'); if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) { catStats[s.category] = (catStats[s.category] || 0) + 1; totalCount++; } });
    const sortedCats = Object.entries(catStats).sort(([, a], [, b]) => b - a);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="border border-white/10 rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-odoo-900/20 transition-all duration-300 md:col-span-1 bg-gradient-to-br from-purple-500/5 via-purple-500/2 to-transparent backdrop-blur-md">
                <h3 className="font-bold text-xs text-purple-400 uppercase mb-8 tracking-widest flex items-center gap-3"><div className="p-2 bg-purple-500/20 rounded-lg"><Icons.CreditCard className="w-4 h-4" /></div> Formas de Pagamento</h3>
                <div className="space-y-6">
                    {sortedPayments.length === 0 ? <p className="text-xs text-slate-400 italic">Sem dados financeiros.</p> :
                        sortedPayments.map(([method, amount], idx) => {
                            const percent = Math.round((amount / totalPayments) * 100) || 0;
                            const colorKey = Object.keys(paymentColors).find(k => method.toLowerCase().includes(k.toLowerCase())) || 'default';
                            const colors = ['from-purple-500 to-violet-400', 'from-pink-500 to-rose-400', 'from-amber-500 to-yellow-400', 'from-cyan-500 to-teal-400', 'from-indigo-500 to-blue-400', 'from-emerald-500 to-green-400'];
                            const barColor = paymentColors[colorKey] || colors[idx % colors.length];
                            const labelColor = barColor.split(' ')[1].replace('to-', 'text-');
                            return (<div key={method} className="space-y-2 group"><div className="flex justify-between text-xs font-bold text-slate-400 group-hover:text-white transition-colors"><span className={labelColor}>{method}</span><span className={labelColor}>{percent}%</span></div><div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden shadow-inner"><div className={`bg-gradient-to-r ${barColor} h-full rounded-full transition-all duration-1000 shadow-lg`} style={{ width: `${percent}%` }}></div></div><div className="text-[10px] text-right text-slate-500 font-mono font-medium group-hover:text-white">{formatCurrency(amount)}</div></div>);
                        })
                    }
                </div>
            </div>
            <div className="border border-white/10 rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-odoo-900/20 transition-all duration-300 md:col-span-1 bg-gradient-to-br from-cyan-500/5 via-cyan-500/2 to-transparent backdrop-blur-md">
                <h3 className="font-bold text-xs text-cyan-400 uppercase mb-8 tracking-widest flex items-center gap-3"><div className="p-2 bg-cyan-500/20 rounded-lg"><Icons.Tag className="w-4 h-4" /></div> Vendas por Tipo</h3>
                <div className="space-y-6">
                    {sortedTypes.length === 0 ? <p className="text-xs text-slate-400 italic">Sem itens vendidos.</p> :
                        sortedTypes.map(([type, qty], idx) => {
                            const typeColors = ['from-cyan-500 to-teal-400', 'from-amber-500 to-yellow-400', 'from-pink-500 to-rose-400', 'from-violet-500 to-purple-400', 'from-blue-500 to-indigo-400', 'from-emerald-500 to-green-400'];
                            const percent = Math.round((qty / totalItems) * 100) || 0;
                            const barColor = typeColors[idx % typeColors.length];
                            const textColor = barColor.split(' ')[1].replace('to-', 'text-');
                            return (<div key={type} className="space-y-2 group"><div className="flex justify-between text-xs font-bold text-slate-400 group-hover:text-white transition-colors"><span className={textColor}>{type}</span><span className={textColor}>{qty} un</span></div><div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden shadow-inner"><div className={`bg-gradient-to-r ${barColor} h-full rounded-full transition-all duration-1000 shadow-lg`} style={{ width: `${percent}%` }}></div></div></div>);
                        })
                    }
                </div>
            </div>
            <div className="border border-white/10 rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-odoo-900/20 transition-all duration-300 md:col-span-1 bg-gradient-to-br from-rose-500/5 via-rose-500/2 to-transparent backdrop-blur-md">
                <h3 className="font-bold text-xs text-rose-400 uppercase mb-8 tracking-widest flex items-center gap-3"><div className="p-2 bg-rose-500/20 rounded-lg"><Icons.CheckSquare className="w-4 h-4" /></div> Status das Vendas</h3>
                <div className="space-y-6">
                    {sortedCats.length === 0 ? <p className="text-xs text-slate-400 italic">Sem dados.</p> :
                        sortedCats.map(([cat, count]) => {
                            const percent = Math.round((count / totalCount) * 100) || 0;
                            const catColors = {
                                'Crediario': 'from-orange-500 to-amber-400',
                                'Venda': 'from-green-500 to-emerald-400',
                                'Serviço': 'from-blue-500 to-cyan-400'
                            };
                            const catKey = Object.keys(catColors).find(k => cat.toLowerCase().includes(k.toLowerCase())) || 'default';
                            const colors = ['from-purple-500 to-pink-400', 'from-cyan-500 to-teal-400', 'from-amber-500 to-yellow-400', 'from-indigo-500 to-blue-400'];
                            const bgGradient = catColors[catKey] || colors[sortedCats.indexOf([cat, count]) % colors.length];
                            const textColor = bgGradient.split(' ')[1].replace('to-', 'text-');
                            return (<div key={cat} className="space-y-2 group"><div className="flex justify-between text-xs font-bold text-slate-400 group-hover:text-white transition-colors"><span className={textColor}>{cat}</span><span className={textColor}>{percent}%</span></div><div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden shadow-inner"><div className={`bg-gradient-to-r ${bgGradient} h-full rounded-full transition-all duration-1000 shadow-lg`} style={{ width: `${percent}%` }}></div></div></div>);
                        })
                    }
                </div>
            </div>
        </div>
    );
};

export default PaymentBreakdown;
