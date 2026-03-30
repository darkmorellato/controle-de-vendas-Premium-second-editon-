import Icons from '../Icons.jsx';
import { maskCPF, maskPhone, maskDateStrict, maskCEP } from '../../utils.js';

/**
 * Modal de edição de dados do cliente (extraído do App.jsx — S-3).
 * Recebe o cliente selecionado e callbacks para alterar campos e confirmar.
 */
export default function ClientDataModal({
  isOpen,
  onClose,
  selectedClientForEdit,
  onFieldChange,
  onConfirm,
  UF_LIST,
}) {
  if (!isOpen || !selectedClientForEdit) return null;

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg no-print animate-in fade-in duration-500">
      <div className="classic-frame rounded-[3rem] p-10 w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-500 text-slate-200 relative overflow-hidden max-h-[90vh] flex flex-col backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-odoo-400 to-odoo-600" />

        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-10 relative z-10 border-b border-white/10 pb-6 mt-2">
          <h3 className="font-bold text-3xl text-white flex items-center gap-4 font-display">
            <div className="p-3 bg-white/10 rounded-2xl text-odoo-400 shadow-sm">
              <Icons.FileText className="w-8 h-8" />
            </div>
            Dados do Cliente
          </h3>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-slate-400 hover:text-white"
          >
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        {/* Campos */}
        <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar flex-1 relative z-10 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-3 mb-1 block">Nome Completo</label>
              <input type="text" value={selectedClientForEdit.name || ''} onChange={(e) => onFieldChange('name', e.target.value)} className="w-full p-5 rounded-[1.5rem] text-sm outline-none font-medium" />
            </div>
            <div className="md:col-span-4 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-3 mb-1 block">CPF</label>
              <input type="text" value={selectedClientForEdit.cpf || ''} onChange={(e) => onFieldChange('cpf', maskCPF(e.target.value))} className="w-full p-5 rounded-[1.5rem] text-sm font-mono outline-none font-medium" />
            </div>
            <div className="md:col-span-4 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-3 mb-1 block">Telefone</label>
              <input type="text" value={selectedClientForEdit.phone || ''} onChange={(e) => onFieldChange('phone', maskPhone(e.target.value))} className="w-full p-5 rounded-[1.5rem] text-sm outline-none font-medium" />
            </div>
            <div className="md:col-span-5 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-3 mb-1 block">Email</label>
              <input type="email" value={selectedClientForEdit.email || ''} onChange={(e) => onFieldChange('email', e.target.value)} className="w-full p-5 rounded-[1.5rem] text-sm outline-none font-medium" />
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-3 mb-1 block">Nascimento</label>
              <input type="text" value={selectedClientForEdit.dob || ''} onChange={(e) => onFieldChange('dob', maskDateStrict(e.target.value))} className="w-full p-5 rounded-[1.5rem] text-sm outline-none font-medium" placeholder="dd/mm/aaaa" />
            </div>

            <div className="md:col-span-12 border-t border-slate-100 my-4 relative">
              <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-white px-6 text-xs font-bold text-slate-300 uppercase tracking-widest">Endereço</span>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-3 mb-1 block">CEP</label>
              <input type="text" value={selectedClientForEdit.zip || ''} onChange={(e) => onFieldChange('zip', maskCEP(e.target.value))} className="w-full p-5 rounded-[1.5rem] text-sm outline-none font-medium" />
            </div>
            <div className="md:col-span-6 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-3 mb-1 block">Logradouro</label>
              <input type="text" value={selectedClientForEdit.address || ''} onChange={(e) => onFieldChange('address', e.target.value)} className="w-full p-5 rounded-[1.5rem] text-sm outline-none font-medium" />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-3 mb-1 block">Nº</label>
              <input type="text" value={selectedClientForEdit.number || ''} onChange={(e) => onFieldChange('number', e.target.value)} className="w-full p-5 rounded-[1.5rem] text-sm outline-none font-medium" />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-3 mb-1 block">UF</label>
              <select value={selectedClientForEdit.state || ''} onChange={(e) => onFieldChange('state', e.target.value)} className="w-full p-5 rounded-[1.5rem] text-sm outline-none font-medium">
                <option value="">UF</option>
                {UF_LIST.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div className="md:col-span-5 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-3 mb-1 block">Bairro</label>
              <input type="text" value={selectedClientForEdit.neighborhood || ''} onChange={(e) => onFieldChange('neighborhood', e.target.value)} className="w-full p-5 rounded-[1.5rem] text-sm outline-none font-medium" />
            </div>
            <div className="md:col-span-7 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-3 mb-1 block">Cidade</label>
              <input type="text" value={selectedClientForEdit.city || ''} onChange={(e) => onFieldChange('city', e.target.value)} className="w-full p-5 rounded-[1.5rem] text-sm outline-none font-medium" />
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-5 relative z-10">
          <button onClick={onClose} className="px-10 py-4 bg-white/5 text-slate-400 rounded-[2rem] font-bold hover:bg-white/10 transition-all active-scale">Fechar</button>
          <button onClick={onConfirm} className="px-10 py-4 btn-gold rounded-[2rem] font-bold shadow-vision active-scale">Atualizar Dados</button>
        </div>
      </div>
    </div>
  );
}
