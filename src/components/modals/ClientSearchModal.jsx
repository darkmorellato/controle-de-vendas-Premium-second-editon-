import Icons from '../Icons.jsx';

export default function ClientSearchModal({ isOpen, onClose, searchTerm, setSearchTerm, filteredClients, onSelectClient }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg no-print animate-in fade-in duration-300">
            <div className="classic-frame rounded-[3rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-8 border-b border-white/10 flex justify-between font-bold items-center text-xl bg-white/5 font-display text-slate-200"><h3>Selecionar Cliente</h3><button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors"><Icons.X className="w-6 h-6 text-slate-400" /></button></div>
                <div className="p-8"><div className="relative group"><Icons.Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-hover:text-odoo-500 transition-colors" /><input type="text" placeholder="Digite Nome ou CPF..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-16 pr-6 py-5 rounded-[2rem] outline-none text-lg shadow-sm font-medium" autoFocus /></div></div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {filteredClients.map(c => (<div key={c.id} onClick={() => onSelectClient(c)} className="p-6 mx-2 mb-4 border border-white/10 rounded-[2rem] hover:bg-white/5 hover:border-odoo-500/30 cursor-pointer flex justify-between items-center transition-all group shadow-sm hover:shadow-md hover:-translate-y-1 duration-300 bg-white/5"><div><div className="font-bold text-slate-300 text-lg group-hover:text-odoo-400">{c.name}</div><div className="text-sm text-slate-500 font-mono group-hover:text-odoo-500 bg-white/5 inline-block px-2 py-0.5 rounded-lg mt-1">{c.cpf}</div></div><div className="p-3.5 bg-white/10 rounded-2xl group-hover:bg-odoo-500 group-hover:text-white text-slate-500 transition-colors shadow-sm"><Icons.Plus className="w-6 h-6" /></div></div>))}
                    {filteredClients.length === 0 && <div className="p-10 text-center text-slate-400 text-sm italic">Nenhum cliente encontrado.</div>}
                </div>
            </div>
        </div>
    );
}
