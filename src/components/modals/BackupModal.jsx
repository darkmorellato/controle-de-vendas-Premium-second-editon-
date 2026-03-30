import Icons from '../Icons.jsx';

export default function BackupModal({ isOpen, onClose, onExport, onSaveToCloud, fileInputRef }) {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg no-print animate-in fade-in duration-500">
            <div className="classic-frame rounded-[3rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-500 text-slate-200 relative overflow-hidden border border-amber-500/20 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/90">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-600/10 rounded-full blur-3xl"></div>
                
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <h3 className="font-bold text-xl text-slate-200 font-display flex items-center gap-3">
                        <span className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <Icons.Download className="w-5 h-5 text-amber-950" />
                        </span>
                        Backup do Sistema
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors hover:rotate-90 transition-transform duration-300">
                        <Icons.X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="p-5 bg-gradient-to-br from-white/8 to-white/3 rounded-2xl border border-amber-500/15 hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-600/10 text-amber-400 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-md shadow-amber-500/15 flex-shrink-0">
                                <Icons.Download className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base text-white mb-1">Salvar Backup</h4>
                                <p className="text-xs text-slate-400 leading-relaxed mb-4">Gere um arquivo de segurança (.json) contendo todos os dados de vendas e clientes.</p>
                                <div className="flex gap-2">
                                    <button onClick={onExport} className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 rounded-xl font-bold hover:from-amber-400 hover:to-yellow-400 transition-all active-scale shadow-md shadow-amber-500/25 text-xs uppercase tracking-wide flex items-center justify-center gap-2">
                                        <Icons.Download className="w-3.5 h-3.5" /> Baixar
                                    </button>
                                    <button onClick={onSaveToCloud} className="flex-1 py-2.5 px-3 bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 rounded-xl font-bold hover:from-slate-600 hover:to-slate-500 transition-all active-scale shadow-md border border-amber-500/15 hover:border-amber-400/30 text-xs uppercase tracking-wide flex items-center justify-center gap-2">
                                        <Icons.CloudUpload className="w-3.5 h-3.5 text-amber-400" /> Nuvem
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-white/8 to-white/3 rounded-2xl border border-amber-500/15 hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-600/10 text-amber-400 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-md shadow-amber-500/15 flex-shrink-0">
                                <Icons.Upload className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base text-white mb-1">Importar Backup</h4>
                                <p className="text-xs text-slate-400 leading-relaxed mb-4">Restaure dados de um arquivo salvo anteriormente. Isso unificará com os dados atuais.</p>
                                <input type="file" accept=".json" multiple ref={fileInputRef} className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 rounded-xl font-bold hover:from-amber-400 hover:to-yellow-400 transition-all active-scale shadow-md shadow-amber-500/25 text-xs uppercase tracking-wide flex items-center justify-center gap-2">
                                    <Icons.Upload className="w-3.5 h-3.5" /> Selecionar Arquivos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-amber-500/10 text-center text-[10px] text-amber-500/40 uppercase font-black tracking-[0.2em]">
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                        Miplace Premium 2026
                    </span>
                </div>
            </div>
        </div>
    );
}
