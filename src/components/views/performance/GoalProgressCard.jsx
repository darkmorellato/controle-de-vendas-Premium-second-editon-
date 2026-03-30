import Icons from '../../Icons.jsx';

const MANAGER_NAME = "Sabrina Almeida";

const GoalProgressCard = ({ sales, settings, formatCurrency, GOAL_SELLERS, GOAL_MANAGER, COMMISSION_PER_UNIT, ELIGIBLE_FOR_GOAL }) => {
    const isManager = settings.employeeName === MANAGER_NAME;
    const myTarget = isManager ? GOAL_MANAGER : GOAL_SELLERS;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const relevantSales = sales.filter(s => {
        const d = new Date(s.date + 'T00:00:00');
        if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return false;
        return isManager ? true : s.employeeName === settings.employeeName;
    });
    const unitsSold = relevantSales.reduce((acc, s) => {
        const positiveItems = (s.items || []).filter(i => ELIGIBLE_FOR_GOAL.includes(i.type) && i.unitPrice > 0);
        const negativeItems = (s.items || []).filter(i => ELIGIBLE_FOR_GOAL.includes(i.type) && i.unitPrice < 0);
        const net = positiveItems.reduce((sum, i) => sum + i.quantity, 0) - negativeItems.reduce((sum, i) => sum + Math.abs(i.quantity), 0);
        return acc + net;
    }, 0);
    const progress = Math.min((unitsSold / myTarget) * 100, 100);
    const isGoalReached = unitsSold >= myTarget;
    const potentialCommission = isGoalReached ? (unitsSold * COMMISSION_PER_UNIT) : 0;

    return (
        <div className="bg-[#fdfaf4] rounded-[2.5rem] p-12 text-[#0f0f0f] mb-10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-700 border border-[#0f0f0f]/10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#A1B5C9]/20 to-amber-500/10 rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#A1B5C9]/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-10"><div><h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Meta de Aparelhos</h3><div className="flex items-baseline gap-4"><p className="text-7xl font-black tracking-tighter text-[#0f0f0f] drop-shadow-sm font-display">{unitsSold}</p><span className="text-3xl font-medium text-slate-500">/ {myTarget} <span className="text-base">un</span></span></div></div><div className="text-right bg-white p-6 rounded-[2rem] border border-[#0f0f0f]/10 shadow-sm"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Premiação Extra</p><p className={`text-4xl font-black ${isGoalReached ? 'text-odoo-500' : 'text-slate-400'}`}>R$ {formatCurrency(potentialCommission)}</p></div></div>
                    <div className="w-full bg-slate-200/50 rounded-full h-6 mb-6 overflow-hidden border border-[#0f0f0f]/5 shadow-inner p-1"><div className={`h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3 shadow-sm relative overflow-hidden ${isGoalReached ? 'bg-gradient-to-r from-amber-400 to-amber-500 animate-pulse-slow' : 'bg-gradient-to-r from-[#A1B5C9] to-[#8DABC4]'}`} style={{ width: `${progress}%` }}><div className="absolute inset-0 bg-white/20 w-full h-full skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>{progress > 8 && <span className="text-[11px] font-bold text-white drop-shadow-sm z-10">{Math.round(progress)}%</span>}</div></div>
                    <div className="flex items-center gap-4"><div className={`p-3 rounded-2xl shadow-sm border ${isGoalReached ? 'bg-amber-50 border-amber-500/20 text-amber-500' : 'bg-[#fdfaf4] border-[#0f0f0f]/10 text-slate-600'}`}>{isGoalReached ? <Icons.Trophy className="w-6 h-6 animate-bounce" /> : <Icons.BarChart className="w-6 h-6" />}</div><p className="text-lg font-medium text-slate-600">{isGoalReached ? "Parabéns! Você bateu a meta e já está acumulando premiação!" : `Faltam apenas ${Math.max(0, myTarget - unitsSold)} unidades para desbloquear sua premiação extra. Vamos lá!`}</p></div>
                </div>
            </div>
        </div>
    );
};

export default GoalProgressCard;
