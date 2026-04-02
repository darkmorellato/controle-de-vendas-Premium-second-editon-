import { useMemo, useEffect } from 'react';
import Icons from '../Icons.jsx';

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
            <div className="bg-[#fdfaf4] rounded-[3rem] p-10 max-w-4xl w-full shadow-2xl animate-in zoom-in-95 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar border border-[#c9a227]/40" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#c9a227] via-[#f5e4ab] to-[#c9a227]"></div>
                
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-2xl text-[#0f0f0f] font-display flex items-center gap-3">
                        <span className="p-3 bg-gradient-to-br from-[#c9a227]/30 to-[#f5e4ab]/20 rounded-2xl shadow-lg border border-[#c9a227]/40">
                            <Icons.Bell className="w-6 h-6 text-[#8b6914]" />
                        </span>
                        Notificações
                    </h3>
                    <button onClick={onClose} className="p-3 hover:bg-[#c9a227]/20 rounded-2xl transition-all hover:scale-110 active:scale-95">
                        <Icons.X className="w-5 h-5 text-[#6b6560]" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Resumo Rápido do Mês */}
                    <div className="p-6 bg-white/80 border border-[#c9a227]/20 rounded-[2rem] shadow-sm animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">📊</span>
                            <span className="font-bold text-[#0f0f0f]">Resumo Rápido do Mês</span>
                            <span className="ml-auto text-xs text-[#6b6560] bg-[#c9a227]/10 px-3 py-1 rounded-full">{monthNames[currentMonth]} {currentYear}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200/50 text-center">
                                <p className="text-[9px] text-emerald-700 uppercase tracking-wider mb-1 font-bold">Faturamento Hoje</p>
                                <p className="text-lg font-black text-emerald-600">R$ {formatCurrency(monthSummary.todayRev)}</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-[#fdfaf4] to-[#f5e4ab]/30 rounded-2xl border border-[#c9a227]/30 text-center">
                                <p className="text-[9px] text-[#8b6914] uppercase tracking-wider mb-1 font-bold">Faturamento Mês</p>
                                <p className="text-lg font-black text-[#c9a227]">R$ {formatCurrency(monthSummary.monthRev)}</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50 text-center">
                                <p className="text-[9px] text-blue-700 uppercase tracking-wider mb-1 font-bold">Vendas</p>
                                <p className="text-lg font-black text-blue-600">{monthSummary.cnt}</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-2xl border border-violet-200/50 text-center">
                                <p className="text-[9px] text-violet-700 uppercase tracking-wider mb-1 font-bold">Dias Restantes</p>
                                <p className="text-lg font-black text-violet-600">{monthSummary.daysLeft} <span className="text-sm text-violet-400">dias</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Metas da Equipe */}
                    <div className="p-6 bg-white/80 border border-[#c9a227]/20 rounded-[2rem] shadow-sm animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🎯</span>
                            <span className="font-bold text-[#0f0f0f]">Metas da Equipe</span>
                            <span className="ml-auto text-xs text-[#6b6560] bg-[#c9a227]/10 px-3 py-1 rounded-full">{monthNames[currentMonth]}</span>
                        </div>
                        <div className="space-y-4">
                            {sellerGoals.map((seller, idx) => (
                                <div key={seller.fullName} className="p-5 bg-gradient-to-r from-[#fdfaf4] to-white rounded-2xl border border-[#c9a227]/20 hover:border-[#c9a227]/40 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${seller.isManager ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
                                            <span className="font-bold text-[#0f0f0f]">{seller.name}</span>
                                            {seller.isManager && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Gerente</span>}
                                        </div>
                                        <span className="text-sm text-[#6b6560] font-mono font-bold">{seller.sold} <span className="text-[#6b6560]/60">/ {seller.target}</span></span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-3">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${seller.needsAttention ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : seller.pct >= 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-[#c9a227] to-[#f5e4ab]'}`} 
                                            style={{ width: `${seller.pct}%` }}
                                        ></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 mb-2">
                                        <div className="p-3 bg-white rounded-xl text-center border border-gray-100">
                                            <p className="text-[8px] text-[#6b6560] uppercase font-bold">Faturamento</p>
                                            <p className="text-xs font-black text-[#0f0f0f]">R$ {formatCurrency(seller.revenue)}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl text-center border border-gray-100">
                                            <p className="text-[8px] text-[#6b6560] uppercase font-bold">Ticket</p>
                                            <p className="text-xs font-black text-[#0f0f0f]">R$ {formatCurrency(seller.ticket)}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl text-center border border-gray-100">
                                            <p className="text-[8px] text-[#6b6560] uppercase font-bold">Projeção</p>
                                            <p className={`text-xs font-black ${seller.projectedPct >= 100 ? 'text-green-600' : seller.projectedPct >= 80 ? 'text-amber-600' : 'text-red-500'}`}>{seller.projectedPct}%</p>
                                        </div>
                                    </div>
                                    {seller.needsAttention ? (
                                        <p className="text-xs text-amber-700 font-bold flex items-center gap-1 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                                            <span>⚠️</span>
                                            Faltam {seller.missing} unidades • {seller.daysLeft} dias restantes
                                        </p>
                                    ) : seller.pct >= 100 ? (
                                        <p className="text-xs text-green-700 font-bold flex items-center gap-1 bg-green-50 px-3 py-2 rounded-xl border border-green-200">
                                            <Icons.Check className="w-3 h-3" /> Meta atingida! 🎉
                                        </p>
                                    ) : (
                                        <p className="text-xs text-[#6b6560]">Progresso: {Math.round(seller.pct)}% • Projeção: {seller.projected} un</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Aniversários do Mês */}
                    {monthBirthdays.length > 0 && (
                        <div className="p-6 bg-gradient-to-br from-pink-50 to-white border border-pink-200/50 rounded-[2rem] shadow-sm animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">🎂</span>
                                <span className="font-bold text-[#0f0f0f]">Aniversários do Mês</span>
                                <span className="ml-auto bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full">{monthBirthdays.length}</span>
                            </div>
                            <div className="space-y-3">
                                {monthBirthdays.map((c, idx) => (
                                    <div key={c.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:translate-x-1 ${c.isPast ? 'bg-gray-50 border-gray-200 opacity-60' : c.isToday ? 'bg-green-50 border-green-300' : 'bg-white border-pink-200/50 hover:border-pink-300'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow ${c.isPast ? 'bg-gray-200 text-gray-500' : c.isToday ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white animate-pulse' : 'bg-gradient-to-br from-pink-300 to-pink-500 text-white'}`}>
                                                {c.isPast ? '✓' : c.isToday ? '🎂' : '🎉'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#0f0f0f] text-sm">{c.name}</p>
                                                <p className="text-xs text-[#6b6560] font-mono">{c.phone || 'Sem telefone'} • Dia {c.day}/{currentMonth + 1}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {c.isPast ? (
                                                <span className="text-xs text-gray-500">Já passou</span>
                                            ) : c.isToday ? (
                                                <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full animate-pulse">Hoje!</span>
                                            ) : (
                                                <span className="text-xs text-pink-600 font-bold">Em {c.daysUntil} dia{c.daysUntil > 1 ? 's' : ''}</span>
                                            )}
                                            {c.phone && (c.isToday || c.daysUntil <= 1) && (
                                                <a href={`https://wa.me/55${(c.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent('Parabéns pelo seu aniversário, ' + (c.name||'').split(' ')[0] + '! 🎉🎂 A equipe Miplace Premium deseja a você um dia incrível e muito sucesso!')}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-green-100 border border-green-300 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-green-200 transition-all hover:scale-105">
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
                        <div className="p-6 bg-gradient-to-br from-[#fdfaf4] to-white border border-[#c9a227]/20 rounded-[2rem] shadow-sm animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">👤</span>
                                <span className="font-bold text-[#0f0f0f]">Clientes Recém-Cadastrados</span>
                                <span className="ml-auto bg-[#c9a227]/10 text-[#8b6914] text-xs font-bold px-3 py-1 rounded-full">{clientsSummary.thisMonth} este mês</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="p-3 bg-white rounded-xl text-center border border-[#c9a227]/20">
                                    <p className="text-[8px] text-[#6b6560] uppercase font-bold">Total Mês</p>
                                    <p className="text-sm font-black text-[#c9a227]">{clientsSummary.thisMonth}</p>
                                </div>
                                <div className="p-3 bg-white rounded-xl text-center border border-[#c9a227]/20">
                                    <p className="text-[8px] text-[#6b6560] uppercase font-bold">vs Mês Anterior</p>
                                    <p className={`text-sm font-black ${changePercent > 0 ? 'text-green-600' : changePercent < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                        {changePercent > 0 ? '↑' : changePercent < 0 ? '↓' : '−'}{Math.abs(changePercent)}%
                                    </p>
                                </div>
                                <div className="p-3 bg-white rounded-xl text-center border border-[#c9a227]/20">
                                    <p className="text-[8px] text-[#6b6560] uppercase font-bold">Top Vendedor</p>
                                    <p className="text-sm font-black text-[#0f0f0f]">{clientsSummary.topSeller.split(' ')[0]}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {clientsSummary.recent.map((c, idx) => (
                                    <div key={c.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#c9a227]/15 hover:border-[#c9a227]/30 transition-all hover:translate-x-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#f5e4ab] rounded-full flex items-center justify-center text-[#0f0f0f] font-bold text-sm shadow">
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#0f0f0f] text-sm">{c.name}</p>
                                                <p className="text-xs text-[#6b6560] font-mono">{c.phone || 'Sem telefone'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-[#6b6560] bg-[#c9a227]/10 px-2 py-1 rounded-lg">
                                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : 'Recente'}
                                            </span>
                                            <p className="text-[10px] text-[#6b6560] mt-1">{c.createdBy}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lembretes de Hoje */}
                    {todayReminders.length > 0 && (
                        <div className="p-6 bg-gradient-to-br from-orange-50 to-white border border-orange-200/50 rounded-[2rem] shadow-sm animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">⏰</span>
                                <span className="font-bold text-[#0f0f0f]">Lembretes de Hoje</span>
                                <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">{todayReminders.length}</span>
                            </div>
                            <div className="space-y-3">
                                {todayReminders.map((r, idx) => (
                                    <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-orange-200/50 hover:border-orange-300 transition-all">
                                        <div>
                                            <p className="font-bold text-[#0f0f0f] text-sm">{r.description}</p>
                                            <p className="text-xs text-orange-600 font-mono font-bold">{r.time} • {r.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sem notificações */}
                    {hasNoNotifications && (
                        <div className="text-center py-16 animate-fade-in-up">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                                <Icons.Check className="w-12 h-12 text-green-500" />
                            </div>
                            <p className="font-bold text-[#0f0f0f] text-2xl mb-2">Tudo em dia!</p>
                            <p className="text-[#6b6560] text-sm mt-2">Você não tem notificações pendentes.</p>
                        </div>
                    )}
                </div>

                <button onClick={onGoToCalendar} className="w-full mt-8 py-4 bg-gradient-to-r from-[#c9a227] via-[#f5e4ab] to-[#c9a227] text-[#0f0f0f] rounded-[2rem] font-black hover:shadow-lg hover:shadow-[#c9a227]/40 transition-all active:scale-[0.98] hover:scale-[1.01] animate-fade-in-up border border-[#c9a227]/30" style={{ animationDelay: '500ms' }}>
                    Ver Calendário
                </button>
            </div>
        </div>
    );
}