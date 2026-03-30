import Icons from '../Icons.jsx';

export default function ConfirmChangeModal({ isOpen, onClose, onConfirm, changeAmount, formatCurrency }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[190] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg no-print animate-in fade-in duration-500">
            <div className="classic-frame rounded-[3rem] p-10 text-center max-w-sm w-full animate-in zoom-in-95 shadow-2xl relative overflow-hidden">
                <div className="w-28 h-28 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-slow shadow-inner border border-orange-500/20"><Icons.DollarSign className="w-14 h-14 text-orange-500" /></div>
                <h3 className="font-bold text-3xl mb-4 text-slate-200 font-display">Atenção ao Troco</h3>
                <p className="text-sm text-slate-400 mb-6 px-4 font-medium">O cliente deu um valor maior que o total.</p>
                <p className="text-2xl font-mono text-orange-400 font-bold mb-10">Troco: {formatCurrency(changeAmount)}</p>
                <div className="flex gap-4"><button onClick={onClose} className="flex-1 p-5 bg-white/5 rounded-2xl font-bold text-slate-400 hover:bg-white/10 transition-colors active-scale">Corrigir</button><button onClick={onConfirm} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/30 transition-all active-scale">Confirmar Troco</button></div>
            </div>
        </div>
    );
}
