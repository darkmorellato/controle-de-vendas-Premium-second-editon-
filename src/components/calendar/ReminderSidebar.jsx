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

const ReminderSidebar = ({ currentDate, reminders }) => {
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [newReminder, setNewReminder] = useState({ desc: '', time: '', type: 'Geral' });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const dayReminders = reminders.filter(r => r.date === selectedDateStr).sort((a, b) => a.time.localeCompare(b.time));

    const handleAddReminder = () => {
        if (!newReminder.desc || !window.db) return;
        const docRef = window.db.collection('lembretes').doc();
        docRef.set({ id: docRef.id, date: selectedDateStr, description: newReminder.desc, time: newReminder.time || '09:00', type: newReminder.type, completed: false });
        setNewReminder({ desc: '', time: '', type: 'Geral' });
        setIsReminderModalOpen(false);
    };

    const toggleReminder = (id) => {
        if (!window.db) return;
        const r = reminders.find(r => r.id === id);
        if (r) window.db.collection('lembretes').doc(id).update({ completed: !r.completed });
    };

    const deleteReminder = (id) => { if (window.db) window.db.collection('lembretes').doc(id).delete(); };

    return (
        <div className="w-full lg:w-96 flex flex-col gap-6">
            <div className="classic-frame rounded-[2.5rem] shadow-vision border border-white/60 p-8 flex flex-col h-full backdrop-blur-xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="font-bold text-2xl text-slate-200 font-display flex items-center gap-2">
                            <span className="bg-gradient-to-r from-odoo-400 to-odoo-500 bg-clip-text text-transparent">Agenda</span>
                        </h3>
                        <p className="text-xs text-odoo-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 bg-odoo-500 rounded-full animate-pulse"></span>
                            {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsReminderModalOpen(true)}
                        className="p-4 bg-gradient-to-br from-odoo-500 to-odoo-600 hover:from-odoo-600 hover:to-odoo-700 text-white rounded-[1.2rem] shadow-lg shadow-odoo-500/30 transition-all active-scale hover:rotate-90 duration-500 hover:scale-110"
                    >
                        <Icons.Plus className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                    {dayReminders.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 animate-float shadow-inner border border-white/10">
                                <Icons.Calendar className="w-10 h-10 opacity-30 text-slate-600" />
                            </div>
                            <p className="text-sm font-medium">Sem tarefas agendadas.</p>
                            <p className="text-xs text-slate-600 mt-2">Clique no + para adicionar</p>
                        </div>
                    ) : (
                        dayReminders.map(r => {
                            const style = getTypeStyle(r.type);
                            return (
                                <div
                                    key={r.id}
                                    className={`
                                        p-5 rounded-[1.5rem] border transition-all duration-500 group hover:-translate-y-1 hover:shadow-xl
                                        ${r.completed
                                            ? 'bg-white/5 border-white/5 opacity-40'
                                            : `bg-gradient-to-r ${style.bg} border ${style.border} shadow-sm hover:shadow-lg`
                                        }
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => toggleReminder(r.id)}
                                            className={`
                                                mt-0.5 min-w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center transition-all duration-300
                                                ${r.completed
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-500 text-white scale-110 shadow-lg shadow-green-500/30'
                                                    : `border-slate-600 hover:border-odoo-500 hover:scale-110`
                                                }
                                            `}
                                        >
                                            {r.completed && <Icons.Check className="w-3.5 h-3.5" />}
                                        </button>
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium leading-tight transition-all duration-300 ${r.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                                {r.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                <span className={`w-2 h-2 rounded-full ring-2 ring-black shadow-sm bg-gradient-to-r ${style.bg.replace('/20', '')} ${style.glow.replace('/20', '/50')}`}></span>
                                                <span className="text-xs text-slate-500 font-mono font-bold">{r.time}</span>
                                                <span className={`
                                                    text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full flex items-center gap-1
                                                    ${r.completed ? 'bg-slate-800 border-slate-700 text-slate-500' : `${style.bg} ${style.border} ${style.text}`}
                                                `}>
                                                    {style.icon} {r.type}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteReminder(r.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all active-scale hover:rotate-3"
                                        >
                                            <Icons.Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            {isReminderModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-500" onClick={() => setIsReminderModalOpen(false)}>
                    <div className="classic-frame rounded-[3rem] p-10 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-500 border border-white/20 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-odoo-400 via-odoo-500 to-odoo-600 animate-gradient-x"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-odoo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <h3 className="font-bold text-3xl mb-8 text-slate-200 font-display text-center">Novo Lembrete</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-3 mb-2 block tracking-wider">Descrição</label>
                                <input
                                    type="text"
                                    value={newReminder.desc}
                                    onChange={e => setNewReminder({ ...newReminder, desc: e.target.value })}
                                    className="w-full p-5 rounded-[1.5rem] text-sm outline-none font-medium bg-white/5 border border-white/10 focus:border-odoo-500 focus:shadow-lg focus:shadow-odoo-500/20 transition-all"
                                    placeholder="Ex: Ligar para cliente..."
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-3 mb-2 block tracking-wider">Horário</label>
                                    <input
                                        type="time"
                                        value={newReminder.time}
                                        onChange={e => setNewReminder({ ...newReminder, time: e.target.value })}
                                        className="w-full p-5 rounded-[1.5rem] text-sm outline-none font-bold bg-white/5 border border-white/10 focus:border-odoo-500 focus:shadow-lg focus:shadow-odoo-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-3 mb-2 block tracking-wider">Tipo</label>
                                    <select
                                        value={newReminder.type}
                                        onChange={e => setNewReminder({ ...newReminder, type: e.target.value })}
                                        className="w-full p-5 rounded-[1.5rem] text-sm outline-none font-medium bg-white/5 border border-white/10 focus:border-odoo-500 focus:shadow-lg focus:shadow-odoo-500/20 transition-all"
                                    >
                                        <option value="Geral">📌 Geral</option>
                                        <option value="Ligação">📞 Ligação</option>
                                        <option value="Reunião">🤝 Reunião</option>
                                        <option value="Cobrança">💰 Cobrança</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={() => setIsReminderModalOpen(false)}
                                    className="flex-1 p-5 bg-white/5 text-slate-400 rounded-[2rem] font-bold hover:bg-white/10 transition-colors active-scale border border-white/10 hover:border-white/20"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddReminder}
                                    className="flex-1 btn-gold rounded-[2rem] font-bold shadow-vision transition-all active-scale hover:scale-105 hover:shadow-xl"
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReminderSidebar;
