import Icons from '../Icons.jsx';
import { useState, useRef, useEffect } from 'react';
import Portal from '../Portal.jsx';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const formatMonth = (monthStr) => {
  if (!monthStr || monthStr === 'todos') return 'Todos os Meses';
  const [year, month] = monthStr.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  return `${MONTH_NAMES[monthIndex]} ${year}`;
};

const ClientsView = ({
    filteredClients,
    clientSearchTerm,
    setClientSearchTerm,
    sellerFilter,
    setSellerFilter,
    SELLERS_LIST,
    monthFilter,
    setMonthFilter,
    availableMonths,
    handleViewHistory,
    handleOpenClientData,
    fillClientData,
    setCurrentView
}) => {
    const [isSellerFilterOpen, setIsSellerFilterOpen] = useState(false);
    const [isMonthFilterOpen, setIsMonthFilterOpen] = useState(false);
    const sellerFilterBtnRef = useRef(null);
    const monthFilterBtnRef = useRef(null);
    const [sellerFilterPos, setSellerFilterPos] = useState({ right: 0, top: 0 });
    const [monthFilterPos, setMonthFilterPos] = useState({ right: 0, top: 0 });

    useEffect(() => {
        if (isSellerFilterOpen && sellerFilterBtnRef.current) {
            const rect = sellerFilterBtnRef.current.getBoundingClientRect();
            setSellerFilterPos({ right: window.innerWidth - rect.right, top: rect.bottom + 8 });
        }
    }, [isSellerFilterOpen]);

    useEffect(() => {
        if (isMonthFilterOpen && monthFilterBtnRef.current) {
            const rect = monthFilterBtnRef.current.getBoundingClientRect();
            setMonthFilterPos({ right: window.innerWidth - rect.right, top: rect.bottom + 8 });
        }
    }, [isMonthFilterOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isSellerFilterOpen && sellerFilterBtnRef.current && !sellerFilterBtnRef.current.contains(e.target) && !e.target.closest('.seller-filter-dropdown')) {
                setIsSellerFilterOpen(false);
            }
            if (isMonthFilterOpen && monthFilterBtnRef.current && !monthFilterBtnRef.current.contains(e.target) && !e.target.closest('.month-filter-dropdown')) {
                setIsMonthFilterOpen(false);
            }
        };
        if (isSellerFilterOpen || isMonthFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSellerFilterOpen, isMonthFilterOpen]);

    const handleSelectSeller = (seller) => {
        setSellerFilter(seller);
        setIsSellerFilterOpen(false);
    };

    const handleSelectMonth = (month) => {
        setMonthFilter(month);
        setIsMonthFilterOpen(false);
    };

    return (
        <div className="classic-frame rounded-[3rem] shadow-vision border border-white/10 overflow-hidden fade-in-up backdrop-blur-md">
            <div className="p-10 border-b border-amber-500/20 flex justify-between items-center gap-6 bg-gradient-to-r from-white/5 via-white/3 to-white/5 backdrop-blur-md flex-wrap">
                <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-4 font-display">
                    <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-2xl shadow-lg shadow-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Icons.User className="w-6 h-6" />
                    </div>
                    Carteira de Clientes
                    <span className="text-sm font-medium text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                        {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''}
                    </span>
                </h2>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Icons.Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Buscar cliente..." 
                            value={clientSearchTerm} 
                            onChange={e => setClientSearchTerm(e.target.value)} 
                            className="w-64 pl-14 pr-5 py-4 border border-amber-500/20 rounded-[1.5rem] text-sm outline-none font-medium text-slate-300 placeholder-slate-600 bg-white/5 focus:bg-white/10 focus:shadow-lg focus:shadow-amber-500/20 focus:border-amber-500/40 transition-all" 
                        />
                    </div>
                    {/* Filtro por Vendedor */}
                    <div className="relative">
                        <button 
                            ref={sellerFilterBtnRef}
                            type="button"
                            onClick={() => { setIsSellerFilterOpen(!isSellerFilterOpen); setIsMonthFilterOpen(false); }}
                            className={`p-4 rounded-[1.5rem] border transition-all duration-300 ${
                                sellerFilter !== 'todos' 
                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/20' 
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-amber-500/30 hover:text-amber-400'
                            }`}
                            title={sellerFilter !== 'todos' ? `Filtrando: ${sellerFilter}` : 'Filtrar por vendedor'}
                        >
                            <Icons.User className="w-5 h-5" />
                        </button>

                        {isSellerFilterOpen && (
                            <Portal>
                                <div 
                                    className="fixed w-80 bg-[#fdfaf4] border-2 border-[#c9a227]/50 rounded-2xl shadow-2xl overflow-hidden z-[9999] seller-filter-dropdown"
                                    style={{ 
                                        right: sellerFilterPos.right,
                                        top: sellerFilterPos.top,
                                        boxShadow: '0 10px 40px rgba(201,162,39,0.35), 0 0 60px rgba(201,162,39,0.15)'
                                    }}
                                >
                                    <div className="p-5 border-b border-[#c9a227]/40 bg-gradient-to-r from-[#c9a227]/20 via-[#c9a227]/10 to-transparent">
                                        <h3 className="font-bold text-[#0f0f0f] text-lg flex items-center gap-2 tracking-wide">
                                            <Icons.User className="w-5 h-5 text-[#c9a227]" />
                                            Filtrar por Vendedor
                                        </h3>
                                    </div>
                                    <div className="py-3 px-2 max-h-80 overflow-y-auto">
                                        <button
                                            type="button"
                                            onClick={() => handleSelectSeller('todos')}
                                            className={`w-full px-4 py-4 mx-2 my-1 rounded-xl transition-all hover:bg-[#c9a227]/20 border border-transparent hover:border-[#c9a227]/40 ${
                                                sellerFilter === 'todos' ? 'bg-[#c9a227]/20 border-[#c9a227]/40' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-[#c9a227]/20 rounded-lg border border-[#c9a227]/40">
                                                    <Icons.Users className="w-5 h-5 text-[#8b6914]" />
                                                </div>
                                                <span className={`text-base font-medium ${sellerFilter === 'todos' ? 'text-[#c9a227]' : 'text-[#0f0f0f]'}`}>Todos os Vendedores</span>
                                            </div>
                                        </button>
                                        {SELLERS_LIST.map(seller => (
                                            <button
                                                key={seller}
                                                type="button"
                                                onClick={() => handleSelectSeller(seller)}
                                                className={`w-full px-4 py-4 mx-2 my-1 rounded-xl transition-all hover:bg-[#c9a227]/20 border border-transparent hover:border-[#c9a227]/40 ${
                                                    sellerFilter === seller ? 'bg-[#c9a227]/20 border-[#c9a227]/40' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2.5 rounded-lg border ${
                                                        seller === 'Sabrina Almeida' 
                                                            ? 'bg-blue-500/20 border-blue-500/40' 
                                                            : 'bg-pink-500/20 border-pink-500/40'
                                                    }`}>
                                                        <div className={`w-5 h-5 rounded-full ${
                                                            seller === 'Sabrina Almeida' ? 'bg-blue-500' : 'bg-pink-500'
                                                        }`}></div>
                                                    </div>
                                                    <span className={`text-base font-medium ${sellerFilter === seller ? 'text-[#c9a227]' : 'text-[#0f0f0f]'}`}>{seller}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </Portal>
                        )}
                    </div>
                    {/* Filtro por Mês */}
                    <div className="relative">
                        <button 
                            ref={monthFilterBtnRef}
                            type="button"
                            onClick={() => { setIsMonthFilterOpen(!isMonthFilterOpen); setIsSellerFilterOpen(false); }}
                            className={`p-4 rounded-[1.5rem] border transition-all duration-300 ${
                                monthFilter !== 'todos' 
                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/20' 
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-amber-500/30 hover:text-amber-400'
                            }`}
                            title={monthFilter !== 'todos' ? `Filtrando: ${formatMonth(monthFilter)}` : 'Filtrar por mês'}
                        >
                            <Icons.Calendar className="w-5 h-5" />
                        </button>

                        {isMonthFilterOpen && (
                            <Portal>
                                <div 
                                    className="fixed w-80 bg-[#fdfaf4] border-2 border-[#c9a227]/50 rounded-2xl shadow-2xl overflow-hidden z-[9999] month-filter-dropdown"
                                    style={{ 
                                        right: monthFilterPos.right,
                                        top: monthFilterPos.top,
                                        boxShadow: '0 10px 40px rgba(201,162,39,0.35), 0 0 60px rgba(201,162,39,0.15)'
                                    }}
                                >
                                    <div className="p-5 border-b border-[#c9a227]/40 bg-gradient-to-r from-[#c9a227]/20 via-[#c9a227]/10 to-transparent">
                                        <h3 className="font-bold text-[#0f0f0f] text-lg flex items-center gap-2 tracking-wide">
                                            <Icons.Calendar className="w-5 h-5 text-[#c9a227]" />
                                            Filtrar por Mês
                                        </h3>
                                    </div>
                                    <div className="py-3 px-2 max-h-80 overflow-y-auto">
                                        <button
                                            type="button"
                                            onClick={() => handleSelectMonth('todos')}
                                            className={`w-full px-4 py-4 mx-2 my-1 rounded-xl transition-all hover:bg-[#c9a227]/20 border border-transparent hover:border-[#c9a227]/40 ${
                                                monthFilter === 'todos' ? 'bg-[#c9a227]/20 border-[#c9a227]/40' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-[#c9a227]/20 rounded-lg border border-[#c9a227]/40">
                                                    <Icons.Calendar className="w-5 h-5 text-[#8b6914]" />
                                                </div>
                                                <span className={`text-base font-medium ${monthFilter === 'todos' ? 'text-[#c9a227]' : 'text-[#0f0f0f]'}`}>Todos os Meses</span>
                                            </div>
                                        </button>
                                        {availableMonths.map(month => (
                                            <button
                                                key={month}
                                                type="button"
                                                onClick={() => handleSelectMonth(month)}
                                                className={`w-full px-4 py-4 mx-2 my-1 rounded-xl transition-all hover:bg-[#c9a227]/20 border border-transparent hover:border-[#c9a227]/40 ${
                                                    monthFilter === month ? 'bg-[#c9a227]/20 border-[#c9a227]/40' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-[#c9a227]/20 rounded-lg border border-[#c9a227]/40">
                                                        <span className="text-sm font-bold text-[#8b6914]">
                                                            {month.split('-')[1]}/{month.split('-')[0].slice(-2)}
                                                        </span>
                                                    </div>
                                                    <span className={`text-base font-medium ${monthFilter === month ? 'text-[#c9a227]' : 'text-[#0f0f0f]'}`}>{formatMonth(month)}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </Portal>
                        )}
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 border-b-2 border-amber-500/20 text-slate-400 font-bold text-xs uppercase tracking-widest relative overflow-hidden">
                        <tr>
                            <th className="p-6 pl-10">Nome</th>
                            <th className="p-6">Contato</th>
                            <th className="whitespace-nowrap p-6">Vendedor</th>
                            <th className="whitespace-nowrap p-6 text-right pr-10">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {filteredClients.map(c => {
                            const today = new Date();
                            const todayMM = String(today.getMonth() + 1).padStart(2, '0');
                            const todayDD = String(today.getDate()).padStart(2, '0');
                            let isBday = false;
                            if (c.dob) {
                                let mm, dd;
                                if (c.dob.includes('-')) { const p = c.dob.split('-'); mm = p[1]; dd = p[2]; }
                                else if (c.dob.includes('/')) { const p = c.dob.split('/'); dd = p[0]; mm = p[1]; }
                                isBday = mm === todayMM && dd === todayDD;
                            }
                            return (
                                <tr key={c.id} className="hover:bg-amber-500/5 transition-all duration-300 text-sm text-slate-400 group border-b border-white/5 hover:border-amber-500/20">
                                    <td className="p-6 pl-10">
                                        <div className="font-bold text-slate-200 leading-tight text-base group-hover:text-amber-400 transition-all duration-300 flex items-center gap-2">
                                            {c.name}
                                            {isBday && <span title="Aniversário hoje!" className="animate-pulse">🎂</span>}
                                        </div>
                                        <div className="text-xs text-[#78866b] mt-1 font-mono">{c.cpf}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-300">{c.phone}</span>
                                            {c.phone && (
                                                <button 
                                                    onClick={() => window.open(`https://wa.me/55${c.phone.replace(/\D/g, '')}`, '_blank')} 
                                                    className="text-green-500 hover:text-green-400 transition-all hover:scale-110 active:scale-95 p-1.5 hover:bg-green-500/10 rounded-lg" 
                                                    title="Chamar no WhatsApp"
                                                >
                                                    <Icons.WhatsApp className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-[10px] italic text-slate-600 mt-0.5">{c.email}</div>
                                    </td>
                                    <td className="whitespace-nowrap p-6">
                                        {c.createdBy === 'Sabrina Almeida' ? (
                                            <span className="inline-flex px-3 py-1.5 rounded-xl text-xs font-bold border shadow-lg bg-gradient-to-br from-white to-blue-50 text-blue-700 border-blue-300/50 shadow-blue-500/25" style={{ boxShadow: '0 0 15px rgba(78, 130, 220, 0.3), 0 2px 8px rgba(0,0,0,0.1)' }}>
                                                {c.createdBy}
                                            </span>
                                        ) : c.createdBy === 'Gabriela Ferreira' ? (
                                            <span className="inline-flex px-3 py-1.5 rounded-xl text-xs font-bold border shadow-lg bg-gradient-to-br from-white to-pink-50 text-pink-700 border-pink-300/50 shadow-pink-500/25" style={{ boxShadow: '0 0 15px rgba(236, 72, 153, 0.3), 0 2px 8px rgba(0,0,0,0.1)' }}>
                                                {c.createdBy}
                                            </span>
                                        ) : (
                                            <span className="bg-white/5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm text-slate-400 border-white/10">
                                                {c.createdBy || '-'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap p-6 text-right pr-10">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleViewHistory(c)} 
                                                className="px-5 py-3 bg-white/5 border border-white/10 text-slate-400 rounded-2xl text-xs font-bold hover:bg-white/10 hover:text-white hover:shadow-md hover:shadow-amber-500/10 hover:border-amber-500/30 transition-all active-scale"
                                            >
                                                Histórico
                                            </button>
                                            {c.phone && (
                                                <a 
                                                    href={`https://wa.me/55${(c.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent('Olá ' + (c.name||'') + '! Tudo bem? 😊')}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="px-5 py-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded-2xl text-xs font-bold hover:bg-green-500/20 hover:shadow-md hover:shadow-green-500/20 transition-all active-scale flex items-center gap-1.5"
                                                >
                                                    <Icons.WhatsApp className="w-3.5 h-3.5" />WA
                                                </a>
                                            )}
                                            <button 
                                                onClick={() => handleOpenClientData(c)} 
                                                className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl text-xs font-bold hover:bg-amber-500/20 hover:shadow-md hover:shadow-amber-500/20 transition-all active-scale"
                                            >
                                                Dados
                                            </button>
                                            <button 
                                                onClick={() => { fillClientData(c); setCurrentView('dashboard'); window.scrollTo(0, 0); }} 
                                                className="px-5 py-3 btn-gold rounded-2xl text-xs font-bold shadow-vision transition-all active-scale hover:scale-105"
                                            >
                                                Nova Venda
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientsView;