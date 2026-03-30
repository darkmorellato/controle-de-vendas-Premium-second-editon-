import Icons from '../Icons.jsx';

export default function DateLockModal({ isOpen, onClose, dateLockPassword, setDateLockPassword, onUnlock, MANAGER_HASH, hashPassword, showToast }) {
    if (!isOpen) return null;

    const handleUnlock = async () => {
        const isValid = await hashPassword(dateLockPassword, MANAGER_HASH);
        if (isValid) {
            onUnlock();
        } else {
            showToast("Senha incorreta", "error");
        }
    };

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg no-print animate-in fade-in duration-500">
            <div className="classic-frame rounded-[3rem] p-12 text-center max-w-md w-full animate-in zoom-in-95 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-slate-800"></div><div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><Icons.Lock className="w-10 h-10 text-slate-400" /></div><h3 className="font-bold text-3xl mb-3 text-slate-200 font-display">Data Bloqueada</h3><p className="text-sm text-slate-500 mb-10 font-medium">Insira a senha gerencial para alterar a data.</p><input type="password" value={dateLockPassword} onChange={e => setDateLockPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUnlock()} className="w-full p-5 rounded-[2rem] text-center mb-10 font-bold outline-none text-xl placeholder:font-normal" placeholder="Senha" autoFocus /><div className="flex gap-4"><button onClick={() => { onClose(); setDateLockPassword(''); }} className="flex-1 p-5 bg-white/5 rounded-[2rem] font-bold text-white hover:bg-white/10 transition-colors active-scale">Cancelar</button><button onClick={handleUnlock} className="flex-1 p-5 bg-sky-400 text-white rounded-[2rem] font-bold hover:bg-sky-500 shadow-lg shadow-sky-400/30 transition-all active-scale">Liberar</button></div>
            </div>
        </div>
    );
}
