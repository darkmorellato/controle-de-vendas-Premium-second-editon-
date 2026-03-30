import Icons from '../../Icons.jsx';

const MetricCards = ({ sales, clients, settings, formatCurrency }) => {
    const mySales = sales.filter(s => s.employeeName === settings.employeeName);
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const salesToday = mySales.filter(s => s.date === today).reduce((acc, s) => acc + (s.amountPaid || s.amount), 0);
    const salesMonth = mySales.filter(s => { const d = new Date(s.date + 'T00:00:00'); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; });
    const totalMonth = salesMonth.reduce((acc, s) => acc + (s.amountPaid || s.amount), 0);

    const lastMonthSales = mySales.filter(s => { const d = new Date(s.date + 'T00:00:00'); return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear; });
    const totalLastMonth = lastMonthSales.reduce((acc, s) => acc + (s.amountPaid || s.amount), 0);
    const trendPercent = totalLastMonth > 0 ? Math.round(((totalMonth - totalLastMonth) / totalLastMonth) * 100) : 0;
    const isTrendUp = trendPercent > 0;
    const isTrendDown = trendPercent < 0;

    const countSalesMonth = salesMonth.filter(s => (s.amountPaid || s.amount) > 0).length;
    const totalDiscountMonth = salesMonth.reduce((acc, s) => acc + (s.discount || 0), 0);
    const myClients = clients.filter(c => {
        if (!c.createdAt || c.createdBy !== settings.employeeName) return false;
        const d = new Date(c.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const newClientsCount = myClients.length;
    const avgTicket = countSalesMonth > 0 ? totalMonth / countSalesMonth : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="p-8 rounded-[2.5rem] border border-amber-500/20 bg-gradient-to-br from-white/10 to-white/5 hover:from-amber-500/10 hover:to-amber-500/5 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-md animate-fade-in-up"><div className="flex justify-between items-start mb-4"><p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Vendas Hoje</p><div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-colors"><Icons.DollarSign className="w-5 h-5" /></div></div><p className="text-4xl font-black text-white tracking-tight">{formatCurrency(salesToday)}</p></div>
            <div className="p-8 rounded-[2.5rem] border border-amber-500/20 bg-gradient-to-br from-white/10 to-white/5 hover:from-amber-500/10 hover:to-amber-500/5 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-md animate-fade-in-up delay-100"><div className="flex justify-between items-start mb-4"><p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Total Mês</p><div className="flex items-center gap-2"><div className={`p-1.5 rounded-lg flex items-center justify-center ${isTrendUp ? 'bg-green-500/20 text-green-400' : isTrendDown ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>{isTrendUp ? <Icons.TrendingUp className="w-4 h-4" /> : isTrendDown ? <Icons.TrendingDown className="w-4 h-4" /> : <Icons.Minus className="w-4 h-4" />}</div><div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-colors"><Icons.BarChart className="w-5 h-5" /></div></div></div><div className="flex items-baseline gap-3"><p className="text-4xl font-black text-white tracking-tight">{formatCurrency(totalMonth)}</p>{totalLastMonth > 0 && <span className={`text-sm font-bold ${isTrendUp ? 'text-green-400' : isTrendDown ? 'text-red-400' : 'text-slate-500'}`}>{isTrendUp ? '↑' : isTrendDown ? '↓' : '−'}{Math.abs(trendPercent)}%</span>}</div></div>
            <div className="p-8 rounded-[2.5rem] border border-amber-500/20 bg-gradient-to-br from-white/10 to-white/5 hover:from-amber-500/10 hover:to-amber-500/5 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-md animate-fade-in-up delay-200"><div className="flex justify-between items-start mb-4"><p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Ticket Médio</p><div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-colors"><Icons.Tag className="w-5 h-5" /></div></div><p className="text-4xl font-black text-white tracking-tight">{formatCurrency(avgTicket)}</p></div>
            <div className="p-8 rounded-[2.5rem] border border-amber-500/20 bg-gradient-to-br from-white/10 to-white/5 hover:from-amber-500/10 hover:to-amber-500/5 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-md animate-fade-in-up delay-300"><div className="flex justify-between items-start mb-4"><p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest group-hover:text-amber-300 transition-colors">Qtd Vendas</p><div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-colors"><Icons.Receipt className="w-5 h-5" /></div></div><p className="text-4xl font-black text-slate-200 tracking-tight">{countSalesMonth}</p></div>
            <div className="p-8 rounded-[2.5rem] border border-amber-500/20 bg-gradient-to-br from-white/10 to-white/5 hover:from-amber-500/10 hover:to-amber-500/5 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-md animate-fade-in-up delay-400"><div className="flex justify-between items-start mb-4"><p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest group-hover:text-amber-300 transition-colors">Novos Cadastros</p><div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-colors"><Icons.UserPlus className="w-5 h-5" /></div></div><p className="text-4xl font-black text-slate-200 tracking-tight">{newClientsCount}</p></div>
            <div className="p-8 rounded-[2.5rem] border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-500/5 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-md animate-fade-in-up delay-500"><div className="flex justify-between items-start mb-4"><p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Total Descontos</p><div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm"><Icons.AlertTriangle className="w-5 h-5" /></div></div><p className="text-4xl font-black text-slate-200 tracking-tight">-{formatCurrency(totalDiscountMonth)}</p></div>
        </div>
    );
};

export default MetricCards;
