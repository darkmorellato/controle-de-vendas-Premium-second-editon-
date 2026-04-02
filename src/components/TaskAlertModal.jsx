import Icons from './Icons.jsx';

const TaskAlertModal = ({ isOpen, onClose, onGoToCalendar, phase, userName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg animate-in fade-in duration-500">
            <div className="classic-frame rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-900/50 to-black rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce shadow-inner border border-amber-500/30"><Icons.AlertTriangle className="w-10 h-10 text-amber-400" /></div>
                <h3 className="font-black text-4xl mb-2 text-white font-display tracking-tight">Atenção</h3>
                <p className="text-xl font-bold text-amber-400 mb-4">{userName}</p>
                <p className="text-slate-400 mb-2 font-medium text-lg">Não esqueça de completar suas tarefas diárias</p>
                <div className="bg-amber-900/40 py-2 px-6 rounded-full inline-block mb-6 border border-amber-500/20 backdrop-blur-sm"><p className="font-black text-amber-400 uppercase tracking-widest text-xs">{phase}</p></div>
                <p className="text-slate-500 mb-10 font-medium">Existe Pendências para Finaliza-las!</p>
                <div className="flex flex-col gap-4">
                    <button onClick={onGoToCalendar} className="w-full btn-gold p-4 rounded-[2rem] shadow-vision flex items-center justify-center gap-2"><Icons.Calendar className="w-5 h-5" /> Verificar Calendário</button>
                    <button onClick={onClose} className="w-full p-4 text-slate-400 hover:text-amber-300 rounded-[2rem] font-bold transition-all active-scale uppercase tracking-wide text-xs border border-white/10 hover:border-amber-500/30 hover:bg-amber-500/10">Ver depois (fecha alerta)</button>
                </div>
            </div>
        </div>
    );
};

export default TaskAlertModal;