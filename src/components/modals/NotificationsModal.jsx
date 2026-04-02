import { useMemo, useEffect } from 'react';
import Icons from '../Icons.jsx';

/**
 * Modal de Notificações expandido com mais informações
 */
export default function NotificationsModal({ 
    isOpen, onClose, sales, settings, clients, reminders, 
    GOAL_SELLERS, GOAL_MANAGER, ELIGIBLE_FOR_GOAL, onGoToCalendar, formatCurrency 
}) {
    const todayData = useMemo(() => {
        const d = new Date();
        return {
            obj: d,
            month: d.getMonth(),
            year: d.getFullYear(),
            str: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            date: d.getDate()
        };
    }, []);

    const now = todayData.obj;
    const currentMonth = todayData.month;
    const currentYear = todayData.year;
    const isManager = settings.employeeName === "Sabrina Almeida";
    const myTarget = isManager ? GOAL_MANAGER : GOAL_SELLERS;
    const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

    const todayReminders = useMemo(() => {
        return reminders.filter(r => r.date === todayData.str && !r.completed);
    }, [reminders, todayData.str]);

    const parseDob = (dob) => {
        if (!dob) return { mm: null, dd: null };
        if (dob.includes('-')) {
            const parts = dob.split('-');
            return { mm: parts[1], dd: parts[2] };
        }
        if (dob.includes('/')) {
            const parts = dob.split('/');
            return { dd: parts[0], mm: parts[1] };
        }
        return { mm: null, dd: null };
    };

    // Resumo Rápido do Mês
    const monthSummary = useMemo(() => {
        const mSales = sales.filter(s => {
            const d = new Date((s.date || '') + 'T00:00:00');
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const todayStr = now.toISOString().split('T')[0];
        const todayRev = sales.filter(s => s.date === todayStr).reduce((a, s) => a + (s.amountPaid || s.amount || 0), 0);
        const monthRev = mSales.reduce((a, s) => a + (s.amountPaid || s.amount || 0), 0);
        const cnt = mSales.filter(s => (s.amountPaid || s.amount || 0) > 0).length;
        const avgTicket = cnt > 0 ? monthRev / cnt : 0;
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysLeft = daysInMonth - now.getDate();
        
        return { todayRev, monthRev, cnt, avgTicket, daysLeft };
    }, [sales, currentMonth, currentYear, now]);

    // Aniversários do mês inteiro
    const monthBirthdays = useMemo(() => {
        if (!clients || clients.length === 0) return [];
        const result = [];
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const todayDD = now.getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dMM = String(currentMonth + 1).padStart(2, '0');
            const dDD = String(day).padStart(2, '0');
            
            clients.forEach(c => {
                const { mm, dd } = parseDob(c.dob);
                if (mm === dMM && dd === dDD) {
                    const isPast = day < todayDD;
                    const isToday = day === todayDD;
                    result.push({ 
                        ...c, 
                        day, 
                        isPast, 
                        isToday,
                        daysUntil: isPast ? 0 : day - todayDD
                    });
                }
            });
        }
        return result.sort((a, b) => a.day - b.day);
    }, [clients, currentMonth, currentYear, now]);

    // Clientes recentes com comparativo
    const clientsSummary = useMemo(() => {
        if (!clients || clients.length === 0) return { recent: [], thisMonth: 0, lastMonth: 0, topSeller: '' };
        
        const thisMonthStart = new Date(currentYear, currentMonth, 1);
        const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const lastMonthEnd = new Date(currentYear, currentMonth, 0);
        
        const thisMonthStr = thisMonthStart.toISOString().split('T')[0];
        const lastMonthStartStr = lastMonthStart.toISOString().split('T')[0];
        const lastMonthEndStr = lastMonthEnd.toISOString().split('T')[0];
        
        const thisMonthClients = clients.filter(c => c.createdAt && c.createdAt >= thisMonthStr);
        const lastMonthClients = clients.filter(c => c.createdAt && c.createdAt >= lastMonthStartStr && c.createdAt <= lastMonthEndStr);
        
        const recent = thisMonthClients.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5);
        
        const sellerCount = {};
        thisMonthClients.forEach(c => {
            if (c.createdBy) sellerCount[c.createdBy] = (sellerCount[c.createdBy] || 0) + 1;
        });
        const topSeller = Object.entries(sellerCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhum';
        
        return { 
            recent, 
            thisMonth: thisMonthClients.length, 
            lastMonth: lastMonthClients.length,
            topSeller
        };
    }, [clients, currentMonth, currentYear]);

    const changePercent = clientsSummary.lastMonth > 0 
        ? Math.round(((clientsSummary.thisMonth - clientsSummary.lastMonth) / clientsSummary.lastMonth) * 100) 
        : 0;

    // Metas da equipe expandidas
    const sellerGoals = useMemo(() => {
        const SELLERS_LIST = ['Gabriela Ferreira', 'Sabrina Almeida'];
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysLeft = daysInMonth - now.getDate();
        const daysElapsed = now.getDate();
        const result = [];
        
        SELLERS_LIST.forEach(seller => {
            const isMgr = seller === "Sabrina Almeida";
            const target = isMgr ? GOAL_MANAGER : GOAL_SELLERS;
            const sellerSalesFiltered = sales.filter(s => {
                const d = new Date((s.date || '') + 'T00:00:00');
                return s.employeeName === seller && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });
            const sold = sellerSalesFiltered.reduce((acc, s) => {
                const pos = (s.items||[]).filter(i => ELIGIBLE_FOR_GOAL.includes(i.type) && i.unitPrice > 0);
                const neg = (s.items||[]).filter(i => ELIGIBLE_FOR_GOAL.includes(i.type) && i.unitPrice < 0);
                return acc + pos.reduce((sum,i)=>sum+i.quantity,0) - neg.reduce((sum,i)=>sum+Math.abs(i.quantity),0);
            }, 0);
            const revenue = sellerSalesFiltered.reduce((a, s) => a + (s.amountPaid || s.amount || 0), 0);
            const ticket = sellerSalesFiltered.length > 0 ? revenue / sellerSalesFiltered.length : 0;
            const pct = Math.min((sold / target) * 100, 100);
            const missing = Math.max(0, target - sold);
            const projected = daysElapsed > 0 ? Math.round((sold / daysElapsed) * daysInMonth) : 0;
            const projectedPct = Math.round((projected / target) * 100);
            
            result.push({
                name: seller.split(' ')[0],
                fullName: seller,
                isManager: isMgr,
                sold,
                target,
                missing,
                pct,
                daysLeft,
                revenue,
                ticket,
                projected,
                projectedPct,
                needsAttention: daysLeft <= 5 && missing > 0
            });
        });
        return result;
    }, [sales, currentMonth, currentYear, now, GOAL_MANAGER, GOAL_SELLERS, ELIGIBLE_FOR_GOAL]);

    const hasNoNotifications = monthBirthdays.length === 0 && todayReminders.length === 0 && clientsSummary.recent.length === 0;

    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-500" onClick={onClose}>
            <div className="classic-frame rounded-[3rem] p-10 max-w-4xl w-full shadow-2xl animate-in zoom-in-95 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 animate-gradient-x"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-2xl text-slate-200 font-display flex items-center gap-3">
                        <span className="p-3 bg-gradient-to-br from-amber-200 to-amber-400 rounded-2xl shadow-lg shadow-amber-400/30 animate-pulse-slow">
                            <Icons.Bell className="w-6 h-6 text-amber-900" />
                        </span>
                        Notificações
                    </h3>
                    <button onClick={onClose} className="p-3 hover:bg-amber-400/20 rounded-2xl transition-all hover:scale-110 active:scale-95">
                        <Icons.X className="w-5 h-5 text-amber-300" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Resumo Rápido do Mês */}
                    <div className="p-6 bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60 border border-slate-600/30 rounded-[2rem] shadow-lg animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">📊</span>
                            <span className="font-bold text-yellow-200">Resumo Rápido do Mês</span>
                            <span className="ml-auto text-xs text-slate-500">{monthNames[currentMonth]} {currentYear}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Faturamento Hoje</p>
                                <p className="text-lg font-black text-emerald-400">R$ {formatCurrency(monthSummary.todayRev)}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Faturamento Mês</p>
                                <p className="text-lg font-black text-amber-400">R$ {formatCurrency(monthSummary.monthRev)}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Vendas</p>
                                <p className="text-lg font-black text-blue-400">{monthSummary.cnt}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Dias Restantes</p>
                                <p className="text-lg font-black text-violet-400">{monthSummary.daysLeft} <span className="text-sm text-slate-500">dias</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Metas da Equipe */}
                    <div className="p-6 bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60 border border-slate-600/30 rounded-[2rem] shadow-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🎯</span>
                            <span className="font-bold text-yellow-200">Metas da Equipe</span>
                            <span className="ml-auto text-xs text-slate-500">{monthNames[currentMonth]}</span>
                        </div>
                        <div className="space-y-4">
                            {sellerGoals.map((seller, idx) => (
                                <div key={seller.fullName} className="p-5 bg-gradient-to-r from-slate-900/80 to-transparent rounded-2xl border border-slate-700/30 hover:border-slate-500/50 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full animate-pulse ${seller.isManager ? 'bg-purple-400' : 'bg-cyan-400'}`}></span>
                                            <span className="font-bold text-slate-200">{seller.name}</span>
                                            {seller.isManager && <span className="text-[10px] bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full uppercase tracking-wider">Gerente</span>}
                                        </div>
                                        <span className="text-sm text-slate-400 font-mono">{seller.sold} <span className="text-slate-600">/ {seller.target}</span></span>
                                    </div>
                                    <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden mb-3">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${seller.needsAttention ? 'bg-gradient-to-r from-amber-400 to-yellow-300 animate-pulse' : seller.pct >= 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`} 
                                            style={{ width: `${seller.pct}%` }}
                                        ></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 mb-2">
                                        <div className="p-2 bg-white/5 rounded-xl text-center">
                                            <p className="text-[8px] text-slate-500 uppercase">Faturamento</p>
                                            <p className="text-xs font-bold text-slate-300">R$ {formatCurrency(seller.revenue)}</p>
                                        </div>
                                        <div className="p-2 bg-white/5 rounded-xl text-center">
                                            <p className="text-[8px] text-slate-500 uppercase">Ticket</p>
                                            <p className="text-xs font-bold text-slate-300">R$ {formatCurrency(seller.ticket)}</p>
                                        </div>
                                        <div className="p-2 bg-white/5 rounded-xl text-center">
                                            <p className="text-[8px] text-slate-500 uppercase">Projeção</p>
                                            <p className={`text-xs font-bold ${seller.projectedPct >= 100 ? 'text-green-400' : seller.projectedPct >= 80 ? 'text-amber-400' : 'text-red-400'}`}>{seller.projectedPct}%</p>
                                        </div>
                                    </div>
                                    {seller.needsAttention ? (
                                        <p className="text-xs text-amber-300 font-bold flex items-center gap-1">
                                            <span className="animate-pulse">⚠️</span>
                                            Faltam {seller.missing} unidades • {seller.daysLeft} dias restantes
                                        </p>
                                    ) : seller.pct >= 100 ? (
                                        <p className="text-xs text-green-400 font-bold flex items-center gap-1">
                                            <Icons.Check className="w-3 h-3" /> Meta atingida! 🎉
                                        </p>
                                    ) : (
                                        <p className="text-xs text-slate-500">Progresso: {Math.round(seller.pct)}% • Projeção: {seller.projected} un</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Aniversários do Mês */}
                    {monthBirthdays.length > 0 && (
                        <div className="p-6 bg-gradient-to-br from-pink-900/30 via-pink-800/20 to-purple-900/20 border border-pink-400/30 rounded-[2rem] shadow-lg shadow-pink-500/10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">🎂</span>
                                <span className="font-bold text-pink-300">Aniversários do Mês</span>
                                <span className="ml-auto bg-pink-400/20 text-pink-300 text-xs font-bold px-3 py-1 rounded-full">{monthBirthdays.length}</span>
                            </div>
                            <div className="space-y-3">
                                {monthBirthdays.map((c, idx) => (
                                    <div key={c.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:translate-x-1 ${c.isPast ? 'bg-pink-900/20 border-pink-500/10 opacity-60' : c.isToday ? 'bg-green-900/30 border-green-500/30' : 'bg-pink-900/40 border-pink-500/20 hover:border-pink-400/40'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${c.isPast ? 'bg-slate-600 text-slate-400' : c.isToday ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-green-900 animate-pulse' : 'bg-gradient-to-br from-pink-300 to-pink-500 text-pink-900'}`}>
                                                {c.isPast ? '✓' : c.isToday ? '🎂' : '🎉'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200 text-sm">{c.name}</p>
                                                <p className="text-xs text-slate-500 font-mono">{c.phone || 'Sem telefone'} • Dia {c.day}/{currentMonth + 1}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {c.isPast ? (
                                                <span className="text-xs text-slate-500">Já passou</span>
                                            ) : c.isToday ? (
                                                <span className="text-xs font-bold text-green-400 bg-green-500/20 px-3 py-1 rounded-full animate-pulse">Hoje!</span>
                                            ) : (
                                                <span className="text-xs text-pink-300">Em {c.daysUntil} dia{c.daysUntil > 1 ? 's' : ''}</span>
                                            )}
                                            {c.phone && (c.isToday || c.daysUntil <= 1) && (
                                                <a href={`https://wa.me/55${(c.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent('Parabéns pelo seu aniversário, ' + (c.name||'').split(' ')[0] + '! 🎉🎂 A equipe Miplace Premium deseja a você um dia incrível e muito sucesso!')}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-400 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-green-500/30 transition-all hover:scale-105">
                                                    <Icons.WhatsApp className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clientes Recém-Cadastrados */}
                    {clientsSummary.recent.length > 0 && (
                        <div className="p-6 bg-gradient-to-br from-amber-900/30 via-amber-800/20 to-yellow-900/20 border border-amber-400/30 rounded-[2rem] shadow-lg shadow-amber-500/10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">👤</span>
                                <span className="font-bold text-amber-300">Clientes Recém-Cadastrados</span>
                                <span className="ml-auto bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full">{clientsSummary.thisMonth} este mês</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="p-3 bg-white/5 rounded-xl text-center">
                                    <p className="text-[8px] text-slate-500 uppercase">Total Mês</p>
                                    <p className="text-sm font-black text-amber-300">{clientsSummary.thisMonth}</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl text-center">
                                    <p className="text-[8px] text-slate-500 uppercase">vs Mês Anterior</p>
                                    <p className={`text-sm font-black ${changePercent > 0 ? 'text-green-400' : changePercent < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                        {changePercent > 0 ? '↑' : changePercent < 0 ? '↓' : '−'}{Math.abs(changePercent)}%
                                    </p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl text-center">
                                    <p className="text-[8px] text-slate-500 uppercase">Top Vendedor</p>
                                    <p className="text-sm font-black text-amber-300">{clientsSummary.topSeller.split(' ')[0]}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {clientsSummary.recent.map((c, idx) => (
                                    <div key={c.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-900/40 to-transparent rounded-xl border border-amber-500/20 hover:border-amber-400/40 transition-all hover:translate-x-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center text-amber-900 font-bold text-sm shadow-lg">
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200 text-sm">{c.name}</p>
                                                <p className="text-xs text-amber-400/70 font-mono">{c.phone || 'Sem telefone'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-amber-400/60 bg-amber-900/40 px-2 py-1 rounded-lg">
                                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : 'Recente'}
                                            </span>
                                            <p className="text-[10px] text-slate-500 mt-1">{c.createdBy}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lembretes de Hoje */}
                    {todayReminders.length > 0 && (
                        <div className="p-6 bg-gradient-to-br from-orange-900/30 via-orange-800/20 to-amber-900/20 border border-orange-400/30 rounded-[2rem] shadow-lg shadow-orange-500/10 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">⏰</span>
                                <span className="font-bold text-orange-300">Lembretes de Hoje</span>
                                <span className="ml-auto bg-orange-400/20 text-orange-300 text-xs font-bold px-3 py-1 rounded-full animate-pulse">{todayReminders.length}</span>
                            </div>
                            <div className="space-y-3">
                                {todayReminders.map((r, idx) => (
                                    <div key={r.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-900/40 to-transparent rounded-xl border border-orange-500/20 hover:border-orange-400/40 transition-all">
                                        <div>
                                            <p className="font-bold text-slate-200 text-sm">{r.description}</p>
                                            <p className="text-xs text-orange-400/70 font-mono">{r.time} • {r.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sem notificações */}
                    {hasNoNotifications && (
                        <div className="text-center py-16 animate-fade-in-up">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20 animate-pulse">
                                <Icons.Check className="w-12 h-12 text-green-400" />
                            </div>
                            <p className="font-bold text-slate-200 text-2xl mb-2">Tudo em dia!</p>
                            <p className="text-slate-500 text-sm mt-2">Você não tem notificações pendentes.</p>
                        </div>
                    )}
                </div>

                <button onClick={onGoToCalendar} className="w-full mt-8 py-4 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 text-amber-900 rounded-[2rem] font-black hover:shadow-lg hover:shadow-amber-400/40 transition-all active:scale-[0.98] hover:scale-[1.01] animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    Ver Calendário
                </button>
            </div>
        </div>
    );
}