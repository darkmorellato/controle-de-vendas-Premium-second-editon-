import Icons from '../Icons.jsx';

export default function ConfirmClientUpdateModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[190] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-lg no-print animate-in fade-in duration-500">
            <div className="bg-black/90 border border-white/10 rounded-[2.5rem] p-10 text-center max-w-sm w-full animate-in zoom-in-95 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-odoo-500"></div><div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><Icons.UserCheck className="w-12 h-12 text-odoo-400" /></div><h3 className="font-bold text-2xl mb-4 text-white font-display">Confirmar Alteração</h3><p className="text-sm text-slate-400 mb-10 leading-relaxed font-medium">Deseja realmente atualizar os dados cadastrais deste cliente?</p>
                <div className="flex gap-4"><button onClick={onClose} className="flex-1 p-4 bg-white/5 text-slate-400 rounded-[1.5rem] font-bold hover:bg-white/10 transition-all active-scale">Cancelar</button><button onClick={onConfirm} className="flex-1 p-4 bg-odoo-600 text-white rounded-[1.5rem] font-bold hover:bg-odoo-700 shadow-lg shadow-odoo-500/30 transition-all active-scale">Confirmar</button></div>
            </div>
        </div>
    );
}
