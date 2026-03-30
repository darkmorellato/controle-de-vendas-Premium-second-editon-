import Icons from '../Icons.jsx';

export default function ClientHistoryModal({ isOpen, onClose, selectedClientHistory, openReceipt, formatCurrency, formatDateBR }) {
    if (!isOpen || !selectedClientHistory) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg no-print animate-in fade-in duration-500" onClick={onClose}>
            <div className="classic-frame rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 border border-white/20" onClick={e => e.stopPropagation()}>
                <div className="p-10 border-b border-white/10 bg-white/5 backdrop-blur-md flex justify-between items-center sticky top-0 z-10"><div><h3 className="font-bold text-2xl text-slate-200 flex items-center gap-4 font-display"><div className="p-3 bg-white/10 rounded-2xl shadow-sm text-slate-400 border border-white/5"><Icons.History className="w-6 h-6" /></div> Histórico de Compras</h3><p className="text-base text-slate-500 mt-2 ml-2 font-medium">{(selectedClientHistory.client.name || 'Cliente')} • <span className="font-mono text-sm">{selectedClientHistory.client.cpf}</span></p></div><button onClick={onClose} className="p-4 hover:bg-white/10 rounded-2xl transition-colors"><Icons.X className="w-6 h-6 text-slate-400" /></button></div>
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    {selectedClientHistory.history.length === 0 ? (<div className="text-center py-24"><div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-500 shadow-inner border border-white/10"><Icons.History className="w-16 h-16" /></div><p className="text-slate-400 font-bold text-xl">Nenhuma compra registrada.</p></div>) : (
                        <div className="space-y-8">
                            {selectedClientHistory.history.map(sale => (
                                <div key={sale.id} className="bg-white/5 rounded-[2.5rem] shadow-sm border border-white/10 p-8 flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all hover:-translate-y-1 duration-500 group">
                                    <div className="md:w-36 flex flex-col justify-center items-center bg-white/5 rounded-[2rem] p-6 border border-white/10 group-hover:bg-odoo-500/10 group-hover:border-odoo-500/20 transition-colors"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-odoo-400">Data</span><span className="text-3xl font-black text-slate-200 group-hover:text-odoo-500">{formatDateBR(sale.date).split('/')[0]}</span><span className="text-sm font-bold text-slate-500 uppercase">{new Date(sale.date).toLocaleString('default', { month: 'short' })}</span><span className="text-xs font-bold text-slate-600 mt-1">{formatDateBR(sale.date).split('/')[2]}</span></div>
                                    <div className="flex-1"><span className="text-xs font-bold text-slate-400 uppercase mb-4 block tracking-widest pl-1">Produtos</span><div className="space-y-4">{(sale.items || []).map((item, idx) => {
                                        const itemTotal = (item.unitPrice * item.quantity) - item.discount;
                                        const hasDiscount = item.discount > 0;
                                        return (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:shadow-sm transition-all">
                                        <div>
                                            <span className="font-bold text-sm text-odoo-400 bg-white/5 px-2.5 py-1 rounded-lg mr-2 border border-white/10">{item.quantity}x</span> 
                                            <span className="text-base font-bold text-slate-300">{item.description}</span> 
                                            <div className="text-xs text-slate-500 ml-1 mt-1 font-medium pl-10 uppercase tracking-wide">{item.ram_storage} • {item.color}</div>
                                        </div>
                                        <div className="text-right font-bold font-mono">
                                            {hasDiscount && <div className="text-xs text-slate-500 line-through mr-2">{formatCurrency(item.unitPrice * item.quantity)}</div>}
                                            <div className={hasDiscount ? "text-amber-600" : "text-slate-300"}>{formatCurrency(itemTotal)}</div>
                                        </div>
                                    </div>
                                        );
                                    })}</div></div>
                                    <div className="md:w-64 flex flex-col justify-between border-l border-white/10 pl-8 border-dashed"><div><span className="text-xs font-bold text-slate-400 uppercase mb-4 block tracking-widest">Pagamento</span><div className="space-y-3">{(sale.payments || []).map((p, idx) => (<div key={idx} className="flex justify-between text-xs font-bold text-slate-400 uppercase bg-white/5 p-2 rounded-lg"><span>{p.method}</span><span className="font-mono">{formatCurrency(p.amount)}</span></div>))}</div></div><div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center"><span className="text-xs font-black text-slate-400 uppercase tracking-wider">Total</span><span className="text-2xl font-black text-slate-200">{formatCurrency(sale.amountPaid || sale.amount)}</span></div><button onClick={() => openReceipt(sale)} className="w-full mt-5 py-4 bg-white/10 text-white text-xs font-bold rounded-2xl hover:bg-white/20 transition-all shadow-lg active:scale-95 uppercase tracking-wide border border-white/10">Ver Recibo</button>
                                                {selectedClientHistory.client.phone && (
                                                    <a href={`https://wa.me/55${(selectedClientHistory.client.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent('Olá ' + (selectedClientHistory.client.name||'') + '! Tudo bem? 😊 Passando para saber se está satisfeito(a) com sua compra na Miplace Premium. Qualquer dúvida estamos à disposição!')}`} target="_blank" rel="noopener noreferrer" className="w-full mt-2 py-4 bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold rounded-2xl hover:bg-green-500/20 transition-all shadow-lg active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2">
                                                        <Icons.WhatsApp className="w-4 h-4" /> Follow-up WhatsApp
                                                    </a>
                                                )}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
