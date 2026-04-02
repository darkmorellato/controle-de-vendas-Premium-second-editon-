import Icons from '../Icons.jsx';

export default function ClientDetailsModal({ isOpen, onClose, clientData, formatDateBR }) {
    if (!isOpen || !clientData) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg no-print animate-in fade-in duration-500" onClick={onClose}>
            <div className="classic-frame rounded-[3rem] w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 border border-white/20" onClick={e => e.stopPropagation()}>
                <div className="p-8 border-b border-white/10 bg-white/5 backdrop-blur-md flex justify-between items-center">
                    <h3 className="font-bold text-xl text-slate-200 flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-xl shadow-lg text-amber-400 border border-amber-500/30">
                            <Icons.User className="w-5 h-5" />
                        </div>
                        Dados do Cliente
                    </h3>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
                        <Icons.X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nome</p>
                            <p className="text-lg font-bold text-slate-200">{clientData.clientName || '-'}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">CPF</p>
                                <p className="text-sm font-bold text-slate-200 font-mono">{clientData.clientCpf || '-'}</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Telefone</p>
                                <p className="text-sm font-bold text-slate-200">{clientData.clientPhone || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email</p>
                                <p className="text-sm font-bold text-slate-200">{clientData.clientEmail || '-'}</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Data Nasc.</p>
                                <p className="text-sm font-bold text-slate-200">{clientData.clientDob || '-'}</p>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Endereço</p>
                            <p className="text-sm font-bold text-slate-200">
                                {clientData.clientAddress}{clientData.clientNumber ? `, ${clientData.clientNumber}` : ''}
                                {clientData.clientNeighborhood ? ` - ${clientData.clientNeighborhood}` : ''}
                                {clientData.clientCity ? ` - ${clientData.clientCity}/${clientData.clientState}` : ''}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">CEP</p>
                                <p className="text-sm font-bold text-slate-200">{clientData.clientZip || '-'}</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Cidade</p>
                                <p className="text-sm font-bold text-slate-200">{clientData.clientCity || '-'}</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">UF</p>
                                <p className="text-sm font-bold text-slate-200">{clientData.clientState || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-white/10 bg-white/5">
                    <button onClick={onClose} className="w-full py-4 bg-white/10 text-white text-sm font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}