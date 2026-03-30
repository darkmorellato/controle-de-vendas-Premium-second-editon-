import { useState } from 'react';
import Icons from '../Icons.jsx';

const getTypeStyle = (type) => {
    switch (type) {
        case 'Ligação': return { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', icon: '📞', glow: 'shadow-green-500/20' };
        case 'Reunião': return { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400', icon: '🤝', glow: 'shadow-purple-500/20' };
        case 'Cobrança': return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', icon: '💰', glow: 'shadow-red-500/20' };
        default: return { bg: 'bg-odoo-500/20', border: 'border-odoo-500/30', text: 'text-odoo-400', icon: '📌', glow: 'shadow-odoo-500/20' };
    }
};

const getDayType = (dateStr, reminders) => {
    const dayRemindersCount = reminders.filter(r => r.date === dateStr).length;
    if (dayRemindersCount === 0) return null;
    const hasUncompleted = reminders.some(r => r.date === dateStr && !r.completed);
    const hasCompleted = reminders.some(r => r.date === dateStr && r.completed);
    return { count: dayRemindersCount, hasUncompleted, hasCompleted };
};

const CalendarGrid = ({ currentDate, setCurrentDate, reminders }) => {
    const [hoveredDay, setHoveredDay] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return (
        <div className="flex-1 classic-frame rounded-[2.5rem] shadow-vision border border-white/60 overflow-hidden transition-all hover:shadow-2xl">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md">
                <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-4 font-display">
                    <div className="p-3 bg-gradient-to-br from-odoo-500 to-odoo-600 rounded-2xl shadow-lg shadow-odoo-500/30 text-white animate-float">
                        <Icons.Calendar className="w-6 h-6" />
                    </div>
                    <span className="bg-gradient-to-r from-odoo-400 to-odoo-500 bg-clip-text text-transparent">{monthNames[month]}</span>
                    <span className="text-slate-500 font-light">{year}</span>
                </h2>
                <div className="flex gap-3">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-3 hover:bg-white/10 rounded-2xl transition-all hover:scale-110 active-scale shadow-sm bg-white/5 text-slate-300 hover:text-odoo-400 border border-white/10 hover:border-odoo-500/30"><Icons.ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-6 py-3 text-sm font-bold text-odoo-400 hover:text-white hover:bg-gradient-to-r from-odoo-500 to-odoo-600 rounded-2xl transition-all active-scale bg-white/5 border border-white/10 hover:shadow-lg hover:shadow-odoo-500/30">Hoje</button>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-3 hover:bg-white/10 rounded-2xl transition-all hover:scale-110 active-scale shadow-sm bg-white/5 text-slate-300 hover:text-odoo-400 border border-white/10 hover:border-odoo-500/30"><Icons.ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 bg-white/5 gap-px border-b border-white/10 backdrop-blur-sm">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d, i) => (
                    <div key={d} className={`bg-white/5 p-4 text-center text-xs font-bold uppercase tracking-widest ${i === 0 ? 'text-red-400' : i === 6 ? 'text-odoo-400' : 'text-slate-400'}`}>{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="bg-white/5/30 h-28 sm:h-36 animate-fade-in"></div>)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                    const isSelected = d === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear();
                    const dayType = getDayType(dateStr, reminders);
                    const dayRemindersList = reminders.filter(r => r.date === dateStr);

                    return (
                        <div
                            key={d}
                            onClick={() => setCurrentDate(new Date(year, month, d))}
                            onMouseEnter={() => setHoveredDay(d)}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`
                                h-28 sm:h-36 p-3 border-white/5 relative group cursor-pointer transition-all duration-500 hover:bg-white/10
                                ${isSelected ? 'bg-gradient-to-br from-odoo-900/60 to-odoo-800/40 ring-inset ring-2 ring-odoo-500/50 shadow-lg shadow-odoo-500/20' : 'bg-white/5 hover:bg-white/10'}
                                ${isToday && !isSelected ? 'bg-gradient-to-br from-odoo-600/20 to-odoo-500/10' : ''}
                            `}
                        >
                            {isToday && (
                                <div className="absolute inset-0 bg-gradient-to-br from-odoo-500/10 to-transparent pointer-events-none animate-pulse-slow rounded-2xl"></div>
                            )}
                            <span className={`
                                text-sm font-bold w-9 h-9 flex items-center justify-center rounded-full transition-all duration-500 relative z-10
                                ${isToday ? 'bg-gradient-to-br from-odoo-500 to-odoo-600 text-white shadow-lg shadow-odoo-500/50 scale-110 animate-pulse-slow' : isSelected ? 'bg-gradient-to-br from-odoo-400 to-odoo-500 text-white shadow-lg shadow-odoo-400/40' : 'text-slate-400 group-hover:bg-white/20 group-hover:text-slate-200'}
                            `}>
                                {d}
                                {isToday && <span className="absolute inset-0 rounded-full animate-ping bg-odoo-400/30"></span>}
                            </span>

                            {dayType && (
                                <div className="absolute top-3 right-3 flex gap-1">
                                    {dayType.hasUncompleted && (
                                        <span className="w-2.5 h-2.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse shadow-lg shadow-amber-500/50"></span>
                                    )}
                                    {dayType.hasCompleted && dayType.hasUncompleted === false && (
                                        <span className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-500/50"></span>
                                    )}
                                </div>
                            )}

                            <div className="mt-2 space-y-1 overflow-hidden">
                                {dayRemindersList.slice(0, 2).map((r, idx) => {
                                    const style = getTypeStyle(r.type);
                                    return (
                                        <div
                                            key={idx}
                                            className={`
                                                text-[9px] font-bold truncate px-1.5 py-0.5 rounded-md border transition-all duration-300 flex items-center gap-1
                                                ${r.completed ? 'bg-slate-800/60 text-slate-500 line-through border-transparent' : `${style.bg} ${style.border} ${style.text} shadow-sm ${style.glow}`}
                                            `}
                                        >
                                            <span>{style.icon}</span>
                                            <span className="truncate">{r.description}</span>
                                        </div>
                                    );
                                })}
                                {dayType && dayType.count > 2 && (
                                    <div className="text-[9px] font-bold text-slate-500 px-1.5">+{dayType.count - 2} mais</div>
                                )}
                            </div>

                            {hoveredDay === d && !isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-t from-odoo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarGrid;
