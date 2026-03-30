import Icons from '../Icons.jsx';

export default function BirthdayAlertModal({ isOpen, onClose, todayBirthdays }) {
    if (!isOpen || todayBirthdays.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg animate-in fade-in duration-500">
            <div className="classic-frame rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-red-400 to-pink-400"></div>
                <div className="text-6xl mb-6">🎂</div>
                <h3 className="font-bold text-2xl mb-2 text-slate-200 font-display">Aniversariantes Hoje!</h3>
                <p className="text-sm text-slate-500 mb-8">Não esqueça de parabenizar seus clientes.</p>
                <div className="space-y-4 mb-8">
                    {todayBirthdays.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl">
                            <div className="text-left">
                                <p className="font-bold text-slate-200 text-sm">{c.name}</p>
                                <p className="text-xs text-slate-500 font-mono">{c.phone}</p>
                            </div>
                            {c.phone && (
                                <a href={`https://wa.me/55${(c.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent('Parabéns pelo seu aniversário, ' + (c.name||'').split(' ')[0] + '! 🎉🎂 A equipe Miplace Premium deseja a você um dia incrível e muito sucesso!')}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-600 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-green-500/30 transition-colors">
                                    <Icons.WhatsApp className="w-4 h-4" /> Parabenizar
                                </a>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="w-full py-4 btn-gold rounded-[2rem] font-bold uppercase tracking-wide">Fechar</button>
            </div>
        </div>
    );
}
