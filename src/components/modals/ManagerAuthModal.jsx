import Icons from '../Icons.jsx';

export default function ManagerAuthModal({ isOpen, onClose, managerPassword, setManagerPassword, onAuth, pendingAuthAction }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg no-print animate-in fade-in duration-500" onClick={onClose}>
            <div className="classic-frame rounded-[3rem] p-12 text-center max-w-sm w-full animate-in zoom-in-95 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div><div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><Icons.Key className="w-10 h-10 text-red-500" /></div><h3 className="font-bold text-2xl mb-3 text-slate-200 font-display">Acesso Restrito</h3>
                <p className="text-sm text-slate-400 mb-10 leading-relaxed font-medium">
                    {pendingAuthAction === 'edit' ? 'Autorização necessária para editar o lançamento.' :
                            pendingAuthAction === 'delete' ? 'Tem certeza que deseja excluir? Esta ação é irreversível.' :
                                pendingAuthAction === 'update_client' ? 'Confirme a senha gerencial para atualizar o cadastro.' :
                                    'Divergência de valores. Insira a senha para forçar o lançamento.'}
                </p>
                <input type="password" value={managerPassword} onChange={e => setManagerPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && onAuth()} className="w-full p-5 rounded-[2rem] text-center mb-10 font-bold outline-none text-xl placeholder:font-normal" placeholder="Senha Gerencial" autoFocus />
                <div className="flex gap-4"><button onClick={onClose} className="flex-1 p-5 bg-white/5 rounded-[2rem] font-bold text-slate-400 hover:bg-white/10 transition-colors active-scale">Cancelar</button><button onClick={onAuth} className="flex-1 p-5 bg-red-600 text-white rounded-[2rem] font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all active-scale">Autorizar</button></div>
            </div>
        </div>
    );
}
