import Icons from '../Icons.jsx';

export default function LogoutModal({ isOpen, onClose, onExportBackup, onSaveToCloud, onLogout }) {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-lg no-print">
            <div className="classic-frame rounded-[3rem] p-10 text-center max-w-md w-full shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/90 border border-amber-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
                
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20 border border-red-500/30">
                        <Icons.LogOut className="w-12 h-12 text-red-500" />
                    </div>
                    <h3 className="font-bold text-3xl mb-4 text-slate-200 font-display">Sair do Sistema?</h3>
                    <p className="text-base text-slate-300 mb-10 leading-relaxed font-medium">Recomendamos <span className="text-amber-400 font-bold">salvar um backup</span> antes de trocar de vendedor para evitar perda de dados.</p>
                    
                    <div className="space-y-5">
                        <div className="flex gap-4">
                            <button onClick={onExportBackup} className="flex-1 py-4 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 rounded-2xl font-bold hover:from-amber-400 hover:to-yellow-400 shadow-lg shadow-amber-500/30 transition-all active-scale hover:scale-[1.02] uppercase tracking-wide text-xs flex items-center justify-center gap-2">
                                <Icons.Download className="w-4 h-4" /> Baixar & Sair
                            </button>
                            <button onClick={() => { onSaveToCloud(); setTimeout(onClose, 1500); }} className="flex-1 py-4 px-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl font-bold hover:from-slate-600 hover:to-slate-500 shadow-lg shadow-slate-500/20 border border-amber-500/20 hover:border-amber-400/40 transition-all active-scale hover:scale-[1.02] uppercase tracking-wide text-xs flex items-center justify-center gap-2" style={{ color: '#ffffff' }}>
                                <Icons.CloudUpload className="w-4 h-4 text-amber-400" /> Salvar Nuvem
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={onClose} className="flex-1 py-4 px-4 bg-gradient-to-r from-slate-300 to-slate-200 text-slate-800 rounded-2xl font-bold hover:from-slate-200 hover:to-white hover:shadow-lg transition-all active-scale hover:scale-[1.02] text-sm uppercase tracking-wide">Cancelar</button>
                            <button onClick={onLogout} className="flex-1 py-4 px-4 bg-white/5 border border-red-500/30 text-red-400 rounded-2xl font-bold hover:bg-red-500/10 hover:border-red-400 transition-all active-scale hover:scale-[1.02] text-sm uppercase tracking-wide">Sair sem Salvar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
