import Icons from '../Icons.jsx';

export default function CommissionModal({ isOpen, onClose, sales, SELLERS_LIST, GOAL_SELLERS, GOAL_MANAGER, COMMISSION_PER_UNIT, ELIGIBLE_FOR_GOAL, formatCurrency }) {
    if (!isOpen) return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-500" onClick={onClose}>
            <div className="classic-frame rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-odoo-400 to-odoo-600"></div>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-2xl text-slate-200 font-display flex items-center gap-3"><Icons.Trophy className="w-7 h-7 text-odoo-500" /> Relatório de Premiação</h3>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors"><Icons.X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <div>
                    <p className="text-sm text-slate-500 mb-8 font-medium">{monthNames[currentMonth]} {currentYear} • Todos os vendedores</p>
                    <div className="space-y-6">
                        {SELLERS_LIST.map(seller => {
                            const isManager = seller === "Sabrina Almeida";
                            const myTarget = isManager ? GOAL_MANAGER : GOAL_SELLERS;

                            let sellerSales;
                            if (isManager) {
                                sellerSales = sales.filter(s => {
                                    const d = new Date((s.date||'') + 'T00:00:00');
                                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                                });
                            } else {
                                sellerSales = sales.filter(s => {
                                    const d = new Date((s.date||'') + 'T00:00:00');
                                    return s.employeeName === seller && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
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
