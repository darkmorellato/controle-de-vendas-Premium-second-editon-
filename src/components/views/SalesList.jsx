import { memo } from 'react';
import Icons from '../Icons.jsx';
import DateInput from '../DateInput.jsx';

function SalesList({
    filteredSales, groupedSales, groupBy, settings, filterDate, searchTerm,
    filterMode, setFilterMode, setFilterDate, setSearchTerm,
    handlePrevDate, handleNextDate, currentPage, setCurrentPage, totalPages,
    openReceipt, startEdit, pendingEditItem, setPendingEditItem,
    setPendingAuthAction, setManagerAuthModalOpen,
    formatCurrency, formatDateBR, printSalesList, getPaymentStyles,
    openClientDetails
}) {
    const openContractPdf = (pdfUrl) => {
        if (!pdfUrl) return;
        const blob = fetch(pdfUrl).then(res => res.blob());
        blob.then(blob => {
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        });
    };
    
    return (
        <div className="max-w-6xl mx-auto px-6 space-y-10 mt-16">
            <div className="hidden print:block text-center mb-6 border-b-2 border-black pb-2"><h1 className="text-2xl font-bold uppercase">Relatório de Vendas</h1><p className="text-sm">{filterDate ? `Data: ${formatDateBR(filterDate)}` : (searchTerm ? `Filtro: ${searchTerm}` : `Geral - ${new Date().toLocaleDateString('pt-BR')}`)}</p></div>
            <div className="bg-[#fdfaf4] p-8 rounded-[2.5rem] shadow-sm border border-[#0f0f0f]/10 flex flex-col gap-8 no-print shadow-vision">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="shrink-0">
                        <div className="p-6 bg-white rounded-[2rem] border border-amber-500/20 shadow-lg shadow-amber-500/10">
                            <p className="text-[10px] text-[#0f0f0f]/60 uppercase font-bold tracking-widest mb-1">Total Listado</p>
                            <p className="text-4xl font-black text-[#0f0f0f] tracking-tighter">
                                {settings.currency} {formatCurrency(filteredSales.reduce((s, i) => s + (i.amountPaid || i.amount), 0))}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 w-full md:w-auto items-center justify-center md:justify-end">
                        <div className="flex items-center gap-2 bg-white border border-amber-500/20 p-1.5 rounded-2xl shadow-lg shadow-amber-500/10">
                            <button onClick={() => setFilterMode('daily')} className={`px-5 py-3 rounded-xl text-xs font-bold transition-all ${filterMode === 'daily' ? 'bg-gradient-to-r from-[#A1B5C9] via-[#C0D1DE] to-[#A1B5C9] text-[#0f0f0f] shadow-lg shadow-slate-400/30 active:scale-95 border border-slate-300/30' : 'text-[#0f0f0f]/60 hover:bg-slate-100 hover:text-slate-700 active:scale-95'}`}>DIÁRIO</button>
                            <button onClick={() => setFilterMode('monthly')} className={`px-5 py-3 rounded-xl text-xs font-bold transition-all ${filterMode === 'monthly' ? 'bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 text-[#0f0f0f] shadow-lg shadow-slate-400/30 active:scale-95 border border-slate-300/30' : 'text-[#0f0f0f]/60 hover:bg-slate-100 hover:text-slate-700 active:scale-95'}`}>MENSAL</button>
                            <button onClick={() => setFilterMode('yearly')} className={`px-5 py-3 rounded-xl text-xs font-bold transition-all ${filterMode === 'yearly' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#0f0f0f] shadow-lg shadow-amber-500/30 active:scale-95 border border-amber-500/30' : 'text-[#0f0f0f]/60 hover:bg-amber-500/10 hover:text-amber-600 active:scale-95'}`}>ANUAL</button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={printSalesList} className="px-6 py-4 bg-white text-[#0f0f0f] font-bold rounded-[1.5rem] hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-500/10 transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/30 active:scale-95 active:shadow-inner text-sm flex items-center gap-2 border border-amber-500/30 relative overflow-hidden">
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full hover:animate-shimmer"></span>
                                <Icons.Download className="w-5 h-5 relative z-10" /> <span className="hidden sm:inline relative z-10">Salvar PDF / Imprimir</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center pt-6 border-t border-amber-500/10">
                    <div className="flex items-center gap-3 w-full md:w-80">
                        <button onClick={handlePrevDate} className="p-4 bg-white border border-amber-500/20 rounded-2xl hover:bg-amber-500/10 hover:border-amber-500/40 transition-all shadow-md hover:shadow-amber-500/20 text-[#0f0f0f]/60 hover:text-amber-600 active:scale-95" title="Data Anterior">
                            <Icons.ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1">
                            <DateInput
                                value={filterDate}
                                onChange={e => setFilterDate(e.target.value)}
                                className="w-full p-4 rounded-[1.2rem] text-sm outline-none font-bold text-[#0f0f0f] placeholder-[#0f0f0f]/50 bg-white border border-amber-500/20 shadow-inner focus:shadow-lg focus:shadow-amber-500/20 focus:border-amber-500/40 transition-all"
                                placeholder="Filtrar Data"
                            />
                        </div>
                        <button onClick={handleNextDate} className="p-4 bg-white border border-amber-500/20 rounded-2xl hover:bg-amber-500/10 hover:border-amber-500/40 transition-all shadow-md hover:shadow-amber-500/20 text-[#0f0f0f]/60 hover:text-amber-600 active:scale-95" title="Próxima Data">
                            <Icons.ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative flex-1 w-full group">
                        <Icons.Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0f0f0f]/50 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filtrar por nome, produto..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-5 py-4 rounded-[1.2rem] outline-none text-[#0f0f0f] placeholder-[#0f0f0f]/50 bg-white border border-amber-500/20 shadow-inner text-sm font-medium focus:shadow-lg focus:shadow-amber-500/20 focus:border-amber-500/40 transition-all"
                        />
                    </div>
                    {(filterDate || searchTerm) && (
                        <button onClick={() => { setFilterDate(''); setSearchTerm(''); setFilterMode('daily'); }} className="p-4 bg-red-500/10 text-red-600 rounded-[1.2rem] hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/20 transition-all border border-red-500/20 hover:border-red-500/40 active:scale-95 shadow-md" title="Limpar Filtros">
                            <Icons.Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
            {groupedSales.length > 0 ? (
                <div className="space-y-10 print-sales-area">
                    <div className="print-header" style={{ visibility: 'hidden', height: 0, overflow: 'hidden' }}>
                        <div style={{ fontFamily: 'sans-serif' }}>
                            <h1 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', margin: 0, color: '#0f0f0f' }}>MIPLACE PREMIUM</h1>
                            <p style={{ fontSize: '9px', color: '#8a6d18', marginTop: '3px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Relatório de Vendas</p>
                            <p style={{ fontSize: '9px', color: '#6b6560', marginTop: '2px' }}>{filterDate ? `Data: ${formatDateBR(filterDate)}` : (searchTerm ? `Filtro: ${searchTerm}` : `Geral • ${new Date().toLocaleDateString('pt-BR')}`)}</p>
                        </div>
                    </div>
                    {groupedSales.map(group => (
                        <div key={group.key} className="space-y-5">
                            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-[#1e3a5f] via-[#2c5282] to-[#1e3a5f] rounded-2xl shadow-lg shadow-amber-500/20 border border-amber-500/30 relative overflow-hidden group hover:shadow-amber-500/40 hover:border-amber-500/50 transition-all duration-300 cursor-default">
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                                <h3 className="text-xl font-bold" style={{ color: '#ffffff', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{groupBy === 'date' ? formatDateBR(group.key) : "Registros"}</h3>
                                <span className="text-sm bg-white px-5 py-2 rounded-xl border border-amber-500/30 shadow-lg shadow-amber-500/20 uppercase tracking-widest font-bold flex items-center gap-2 group-hover:shadow-amber-500/40 group-hover:border-amber-500/50 transition-all duration-300">Subtotal: <span className="text-base text-amber-600 font-black tracking-normal">{formatCurrency(group.total)}</span></span>
                            </div>
                            <div className="bg-[#A1B5C9] backdrop-blur-md rounded-xl border border-[#0f0f0f]/10 shadow-vision overflow-hidden overflow-x-auto">
                                <table className="w-full sales-table"><thead className="bg-gradient-to-r from-white via-gray-100 to-white text-[#0f0f0f] border-b-2 border-[#c9a227]/60 font-bold text-[11px] uppercase tracking-widest overflow-hidden animate-shimmer"><tr className="relative"><th className="p-4 pl-6 text-left" style={{ width: '16%' }}>Cliente</th><th className="p-4 text-left" style={{ width: '33%' }}>Itens & Detalhes</th><th className="p-4 text-center" style={{ width: '9%' }}>Vendedor</th><th className="p-4 text-left" style={{ width: '25%' }}>Pagamento</th><th className="p-4 text-right" style={{ width: '12%' }}>Total Pago</th><th className="p-4 text-center no-print" style={{ width: '5%' }}></th></tr></thead>
                                    <tbody className="divide-y divide-[#0f0f0f]/10 bg-[#fdfaf4]">
                                        {group.items.map(s => (
                                            <tr key={s.id} className="hover:bg-amber-500/5 transition-all duration-300 group border-b border-[#0f0f0f]/10 last:border-0 hover:shadow-md hover:shadow-amber-500/10">
                                                <td className="p-4 pl-6 align-top">
                                                    <button onClick={() => openClientDetails && openClientDetails(s)} className="text-left hover:text-amber-600 transition-colors">
                                                        <div className="font-bold text-[#0f0f0f] leading-tight mb-1 hover:underline" style={{ fontSize: '15px' }}>{s.clientName}</div>
                                                        <div className="font-mono text-[#0f0f0f]/50" style={{ fontSize: '11px' }}>{s.clientCpf}</div>
                                                    </button>
                                                </td>
                                                <td className="p-4 align-top">
                                                    <div className="space-y-2">{(s.items || []).map((i, idx) => (
                                                        <div key={idx} className="pb-2 border-b border-[#0f0f0f]/5 last:border-0">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div className="flex-1">
                                                                    <span className="font-bold text-[#c9a227] mr-1" style={{ fontSize: '13px' }}>{i.quantity}x</span>
                                                                    <span className="font-semibold text-[#0f0f0f]" style={{ fontSize: '13px' }}>{i.type} • {i.description}</span>
                                                                    <div className="flex flex-wrap gap-1 mt-0.5" style={{ fontSize: '11px', color: 'rgba(15,15,15,0.5)', fontWeight: 600, textTransform: 'uppercase' }}>
                                                                        {i.ram_storage && <span>{i.ram_storage}</span>}
                                                                        {i.color && <span>• {i.color}</span>}
                                                                        {i.imei && <span className="text-[#3cb371]">• IMEI: {i.imei}</span>}
                                                                        <span className={i.financed === 'Sim' ? 'text-[#a52a2a] font-bold' : ''}>{i.financed === 'Sim' ? '• Financiado' : '• À Vista'}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    {i.discount > 0 && <div className="text-[#0f0f0f]/40 font-medium line-through" style={{ fontSize: '11px' }}>{formatCurrency(i.unitPrice * i.quantity)}</div>}
                                                                    <div className="font-bold text-[#0f0f0f]" style={{ fontSize: '14px' }}>{formatCurrency((i.unitPrice * i.quantity) - i.discount)}</div>
                                                                    {i.discount > 0 && <div className="text-red-600 font-bold" style={{ fontSize: '11px' }}>-{formatCurrency(i.discount)}</div>}
                                                                    {(s.category === 'Troca' || s.category === 'Devolução') && <div className="font-black uppercase" style={{ fontSize: '10px', color: i.unitPrice > 0 ? '#2e7d32' : '#c0392b' }}>{i.unitPrice > 0 ? 'Levou' : 'Devolveu'}</div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}</div>
                                                </td>
                                                <td className={`p-4 align-top text-center font-bold uppercase leading-snug ${s.employeeName === 'Gabriela Ferreira' ? 'text-[#c0392b]' : s.employeeName === 'Sabrina Almeida' ? 'text-[#2c3e9e]' : 'text-[#0f0f0f]/50'}`} style={{ fontSize: '11px' }}>{s.employeeName}</td>
                                                <td className="p-4 align-top">
                                                    {(s.category === 'Devolução' || (s.category === 'Troca' && (s.amountPaid || s.amount) < 0)) && (<div className="mb-2 font-bold text-red-600 text-center uppercase tracking-wider" style={{ fontSize: '10px' }}>DEVOLUÇÃO</div>)}
                                                    <div className="space-y-1">{(s.payments || []).map((p, idx) => { let styles = getPaymentStyles(p.type); if (["Devolução Dinheiro", "Devolução Pix", "Devolução Estorno Cartão"].includes(p.method)) { styles = { wrapper: 'bg-red-500/10 border-red-500/20 text-red-600', amount: 'text-red-700' }; } return (<div key={idx} className={`flex justify-between px-3 py-1.5 rounded-xl border items-center ${styles.wrapper}`}><div className="flex-1 mr-2"><div className="font-bold leading-tight" style={{ fontSize: '13px' }}>{p.method}</div><div className="uppercase font-bold opacity-60" style={{ fontSize: '10px' }}>{p.installments ? `${p.installments} ` : ''}{p.type || 'Integral'}</div></div><span className={`font-mono font-bold whitespace-nowrap ${styles.amount}`} style={{ fontSize: '13px' }}>{formatCurrency(p.amount)}</span></div>); })}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-top text-right">
                                                    <div className="font-black text-[#0f0f0f]" style={{ fontSize: '17px', whiteSpace: 'nowrap' }}>{formatCurrency(s.amountPaid || s.amount)}</div>
                                                    {s.clientSource && <div className="mt-1 font-bold text-orange-600 uppercase tracking-wider text-center" style={{ fontSize: '10px' }}>{s.clientSource}</div>}
                                                </td>
                                                <td className="p-4 align-top text-center no-print"><div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-3 group-hover:translate-x-0"><button onClick={() => openReceipt(s)} title="Ver Recibo" className="p-2 text-[#0f0f0f]/60 hover:text-[#0f0f0f] hover:bg-[#0f0f0f]/10 rounded-xl transition-colors"><Icons.Receipt className="w-5 h-5" /></button>{s.contractPdfUrl && (<button onClick={() => openContractPdf(s.contractPdfUrl)} title="Ver Contrato PDF" className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"><Icons.FileText className="w-5 h-5" /></button>)}{s.clientPhone && (<button onClick={() => window.open(`https://wa.me/55${s.clientPhone.replace(/\D/g, '')}`, '_blank')} title="WhatsApp" className="p-2 text-[#0f0f0f]/60 hover:text-[#598c73] hover:bg-[#0f0f0f]/10 rounded-xl transition-colors"><Icons.WhatsApp className="w-5 h-5" /></button>)}<button onClick={() => { setPendingEditItem(s); setPendingAuthAction('edit'); setManagerAuthModalOpen(true); }} className="p-2 text-[#0f0f0f]/60 hover:text-[#0f0f0f] hover:bg-[#0f0f0f]/10 rounded-xl transition-colors"><Icons.Edit className="w-5 h-5" /></button></div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-center items-center gap-6 py-8 no-print"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-6 py-3 bg-white/5 border border-white/10 rounded-[1.2rem] hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5 font-bold text-slate-400 hover:text-white transition-all active-scale text-sm shadow-sm">Anterior</button><span className="text-slate-400 font-bold text-xs uppercase tracking-widest bg-white/5 px-5 py-2.5 rounded-full shadow-sm border border-white/10 backdrop-blur-sm">Página {currentPage} de {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-6 py-3 bg-white/5 border border-white/10 rounded-[1.2rem] hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5 font-bold text-slate-400 hover:text-white transition-all active-scale text-sm shadow-sm">Próxima</button></div>
                </div>
            ) : (<div className="classic-frame p-24 text-center rounded-[3rem] border border-dashed border-white/10 text-slate-500 flex flex-col items-center"><div className="p-8 bg-white/5 rounded-full mb-8 shadow-inner ring-1 ring-white/5"><Icons.Search className="w-16 h-16 opacity-20 text-white" /></div><p className="font-bold text-2xl text-slate-400 mb-2">Nenhum registro encontrado</p><p className="text-sm">Tente ajustar os filtros de busca ou data.</p></div>)}
        </div>
    );
}

export default memo(SalesList);
