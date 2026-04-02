import Icons from './Icons.jsx';
import { useMemo, useRef, useEffect } from 'react';
import { countUnits } from '../utils.js'; // S-4: versão canônica unificada

export default function NotificationsDropdown({ isOpen, onClose, onMarkAsRead, onOpenFullModal, sales, settings, clients, reminders, GOAL_SELLERS, GOAL_MANAGER, ELIGIBLE_FOR_GOAL }) {
    const dropdownRef = useRef(null);

    // BUG-8 fix: estabilizar 'now' para que os useMemos não recomputem a cada render
    const today = useMemo(() => {
        const d = new Date();
        return {
            obj: d,
            month: d.getMonth(),
            year: d.getFullYear(),
            str: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            date: d.getDate(),
        };
    }, []); // recalcula apenas na montagem — a data do dia não muda durante uma sessão

    const now = today.obj;
    const currentMonth = today.month;
    const currentYear = today.year;
    const isManager = settings.employeeName === "Sabrina Almeida";
    const myTarget = isManager ? GOAL_MANAGER : GOAL_SELLERS;
    const monthNames = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

    const sellerSales = sales.filter(s => {
        const d = new Date((s.date||'') + 'T00:00:00');
        if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return false;
        return isManager ? true : s.employeeName === settings.employeeName;
    });
    const units = countUnits(sellerSales, ELIGIBLE_FOR_GOAL);
    const remaining = Math.max(0, myTarget - units);
    const progress = Math.min((units / myTarget) * 100, 100);

    const todayStr = today.str;
    const todayReminders = reminders.filter(r => r.date === todayStr && !r.completed);

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

    const upcomingBirthdays = useMemo(() => {
        if (!clients || clients.length === 0) return [];
        const result = [];
        for (let i = 0; i <= 5; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() + i);
            const dMM = String(d.getMonth() + 1).padStart(2, '0');
            const dDD = String(d.getDate()).padStart(2, '0');
            const dayLabel = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : `Em ${i}d`;
            
            clients.forEach(c => {
                const { mm, dd } = parseDob(c.dob);
                if (mm === dMM && dd === dDD) {
                    result.push({ ...c, daysUntil: i, dayLabel });
                }
            });
        }
        return result.sort((a, b) => a.daysUntil - b.daysUntil);
    }, [clients, now]);

    const recentClients = useMemo(() => {
        if (!clients || clients.length === 0) return [];
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffStr = thirtyDaysAgo.toISOString().split('T')[0];
        return clients.filter(c => c.createdAt && c.createdAt >= cutoffStr).sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        }).slice(0, 3);
    }, [clients, now]);

    const sellerGoals = useMemo(() => {
        const SELLERS_LIST = ['Gabriela Ferreira', 'Sabrina Almeida'];
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysLeft = daysInMonth - today.date;
        const result = [];
        
        SELLERS_LIST.forEach(seller => {
            const isMgr = seller === "Sabrina Almeida";
            const target = isMgr ? GOAL_MANAGER : GOAL_SELLERS;
            const sellerSalesData = sales.filter(s => {
                const d = new Date((s.date || '') + 'T00:00:00');
                if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return false;
                return isMgr ? true : s.employeeName === seller;
            });
            const sold = countUnits(sellerSalesData, ELIGIBLE_FOR_GOAL);
            const pct = Math.min((sold / target) * 100, 100);
            const missing = Math.max(0, target - sold);
            
            result.push({
                name: seller.split(' ')[0],
                fullName: seller,
                isManager: isMgr,
                sold,
                target,
                missing,
                pct,
                daysLeft,
                needsAttention: daysLeft <= 5 && missing > 0
            });
        });
        return result;
    }, [sales, currentMonth, currentYear, now]);

    const totalNotifications = recentClients.length + sellerGoals.filter(g => g.needsAttention).length + upcomingBirthdays.filter(b => b.daysUntil <= 1).length + todayReminders.length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                const notificationsBtn = document.querySelector('.notifications-dropdown');
                if (notificationsBtn && notificationsBtn.contains(event.target)) {
                    return;
                }
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div ref={dropdownRef} className="absolute right-0 top-full mt-3 w-96 bg-gradient-to-b from-[#fffdf7] via-[#faf6eb] to-[#f5edd8] border-2 border-[#c9a227]/40 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-fade-in-up" style={{ boxShadow: '0 15px 50px rgba(201,162,39,0.25), 0 0 80px rgba(201,162,39,0.1)' }}>
            <div className="p-4 border-b border-[#c9a227]/30 bg-gradient-to-r from-[#c9a227]/15 via-[#c9a227]/5 to-transparent">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#1a1a1a] text-base flex items-center gap-2 tracking-wide">
                        <Icons.Bell className="w-4 h-4 text-[#c9a227]" />
                        Notificações
                    </h3>
                    <div className="flex items-center gap-2">
                        {totalNotifications > 0 && (
                            <span className="bg-[#c9a227] text-[#1a1a1a] text-[10px] font-black px-2 py-1 rounded-full">
                                {totalNotifications}
                            </span>
                        )}
                        {totalNotifications > 0 && onMarkAsRead && (
                            <button onClick={onMarkAsRead} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a227]/20 hover:bg-[#c9a227]/40 border border-[#c9a227]/40 rounded-lg text-[10px] font-bold text-[#8b6914] transition-all hover:scale-105 active:scale-95">
                                <Icons.Check className="w-3 h-3" />
                                Marcar como lido
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-3">
                {recentClients.length > 0 && (
                    <div className="p-3 bg-gradient-to-br from-[#c9a227]/10 via-[#c9a227]/5 to-transparent border border-[#c9a227]/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">👤</span>
                            <span className="text-xs font-bold text-[#8b6914] uppercase tracking-wider">Recém-Cadastrados</span>
                        </div>
                        <div className="space-y-2">
                            {recentClients.map(c => (
                                <div key={c.id} className="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-[#c9a227]/15 hover:border-[#c9a227]/30 transition-all">
                                    <div className="w-8 h-8 bg-gradient-to-br from-[#c9a227] to-[#dbb84d] rounded-full flex items-center justify-center text-[#1a1a1a] font-bold text-xs shadow-sm">
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-[#1a1a1a] text-xs truncate">{c.name}</p>
                                        <p className="text-[10px] text-[#8b6914]/70">{c.phone || 'Sem telefone'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="p-3 bg-gradient-to-br from-[#c9a227]/10 via-[#c9a227]/5 to-transparent border border-[#c9a227]/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">🎯</span>
                        <span className="text-xs font-bold text-[#8b6914] uppercase tracking-wider">Sua Meta - {monthNames[currentMonth]}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-[#1a1a1a]/60 font-mono">{units}/{myTarget}</span>
                        <div className="flex-1 bg-[#c9a227]/20 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : progress >= 70 ? 'bg-gradient-to-r from-[#c9a227] to-[#dbb84d]' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <span className="text-[10px] font-bold text-[#8b6914]">{Math.round(progress)}%</span>
                    </div>
                    {remaining > 0 ? (
                        <p className="text-[10px] text-[#c9a227] font-semibold">Faltam {remaining} aparelhos</p>
                    ) : (
                        <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">✓ Meta atingida!</p>
                    )}
                </div>

                {sellerGoals.some(g => g.needsAttention) && (
                    <div className="p-3 bg-gradient-to-br from-purple-50 via-purple-50/50 to-purple-100/30 border border-purple-200/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">⚠️</span>
                            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Metas em Risco</span>
                        </div>
                        <div className="space-y-2">
                            {sellerGoals.filter(g => g.needsAttention).map(seller => (
                                <div key={seller.fullName} className="flex items-center justify-between p-2 bg-white/60 rounded-lg border border-purple-200/30">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${seller.isManager ? 'bg-purple-500' : 'bg-cyan-500'}`}></span>
                                        <span className="text-xs font-semibold text-[#1a1a1a]">{seller.name}</span>
                                        {seller.isManager && <span className="text-[8px] bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded-full uppercase">Gerente</span>}
                                    </div>
                                    <span className="text-[10px] text-amber-600 font-semibold">{seller.missing} un</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {upcomingBirthdays.length > 0 && (
                    <div className="p-3 bg-gradient-to-br from-pink-50 via-pink-50/50 to-pink-100/30 border border-pink-200/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">🎂</span>
                            <span className="text-xs font-bold text-pink-700 uppercase tracking-wider">Aniversários</span>
                        </div>
                        <div className="space-y-2">
                            {upcomingBirthdays.slice(0, 3).map(c => (
                                <div key={c.id} className="flex items-center justify-between p-2 bg-white/60 rounded-lg border border-pink-200/30 hover:border-pink-300/50 transition-all">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">🎂</span>
                                        <span className="text-xs font-semibold text-[#1a1a1a]">{c.name.split(' ')[0]}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.daysUntil === 0 ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-pink-100 text-pink-700'}`}>
                                        {c.dayLabel}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {todayReminders.length > 0 && (
                    <div className="p-3 bg-gradient-to-br from-orange-50 via-orange-50/50 to-orange-100/30 border border-orange-200/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">⏰</span>
                            <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Lembretes</span>
                            <span className="ml-auto bg-orange-200 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{todayReminders.length}</span>
                        </div>
                        <div className="space-y-1">
                            {todayReminders.slice(0, 2).map(r => (
                                <p key={r.id} className="text-[10px] text-[#1a1a1a]/70 truncate">{r.time} - {r.description}</p>
                            ))}
                        </div>
                    </div>
                )}

                {totalNotifications === 0 && (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Icons.Check className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="font-semibold text-[#1a1a1a] text-sm">Tudo em dia!</p>
                        <p className="text-[10px] text-[#1a1a1a]/50 mt-1">Sem notificações pendentes</p>
                    </div>
                )}

                {/* Botão Ver Mais */}
                <div className="p-3 border-t border-[#c9a227]/30">
                    <button 
                        onClick={() => { onClose(); if (onOpenFullModal) onOpenFullModal(); }}
                        className="w-full py-3 bg-gradient-to-r from-[#c9a227] to-[#dbb84d] text-[#1a1a1a] rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#c9a227]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Icons.Bell className="w-4 h-4" />
                        Ver Todas as Notificações
                    </button>
                </div>
            </div>
        </div>
    );
}