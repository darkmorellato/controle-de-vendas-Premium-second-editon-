import Icons from '../Icons.jsx';

export default function ConfirmSaleModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[190] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg no-print animate-in fade-in duration-500">
            <div className="classic-frame rounded-[3rem] p-10 text-center max-w-sm w-full animate-in zoom-in-95 shadow-2xl relative overflow-hidden">
                <div className="w-28 h-28 bg-odoo-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-slow shadow-inner border border-odoo-500/20"><Icons.Check className="w-14 h-14 text-odoo-500" /></div><h3 className="font-bold text-3xl mb-4 text-slate-200 font-display">Confirmar Venda</h3><p className="text-sm text-slate-400 mb-10 px-4 font-medium">Você confirma o recebimento do pagamento e o lançamento dos itens?</p>
                <div className="flex gap-4"><button onClick={onClose} className="flex-1 p-5 bg-white/5 rounded-2xl font-bold text-slate-400 hover:bg-white/10 transition-colors active-scale">Voltar</button><button onClick={onConfirm} className="flex-1 btn-gold rounded-2xl font-bold shadow-vision transition-all active-scale">Confirmar!</button></div>
            </div>
        </div>
    );
}
