import Icons from '../Icons.jsx';

export default function ReceiptModal({ isOpen, onClose, receipt, onPrint, formatCurrency, formatDateBR }) {
    if (!isOpen || !receipt) return null;

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl no-print receipt-modal-wrapper animate-in fade-in duration-300" onClick={onClose}>
            <div className="w-full max-w-[378px] animate-in zoom-in-95 duration-300 receipt-modal-content overflow-y-auto transform scale-95 origin-center" style={{ maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>

                <div className="flex justify-between items-center mb-3 no-print px-1">
                    <button onClick={() => onPrint('print')} className="flex items-center gap-2 bg-odoo-500 text-black font-black py-2 px-4 rounded-full shadow-lg shadow-odoo-500/30 hover:bg-odoo-400 transition-all active:scale-95 text-xs uppercase tracking-wide">
                        <Icons.Printer className="w-4 h-4" /> Imprimir / PDF
                    </button>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all active:scale-90 shadow-md">
                        <Icons.X className="w-4 h-4 text-white" />
                    </button>
                </div>

                <div id="receipt-paper" className="receipt-paper overflow-hidden shadow-2xl" style={{ background: '#f9f6f0', color: '#0f0f0f', borderRadius: '2rem', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>

                    <div className="text-center relative overflow-hidden" style={{ background: '#f9f6f0', padding: '36px 24px 20px', borderBottom: '1.5px dashed rgba(15,15,15,0.12)' }}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(15,15,15,0.15)', margin: '0 auto 14px', background: '#111', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
                            <img src="logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                onError={e => {
                                const img = e.target; const parent = img.parentElement;
                                img.style.display = 'none';
                                Object.assign(parent.style, { display:'flex', alignItems:'center', justifyContent:'center' });
                                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                svg.setAttribute('width','32'); svg.setAttribute('height','32');
                                svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','none');
                                svg.setAttribute('stroke','#c9a227'); svg.setAttribute('stroke-width','2');
                                svg.setAttribute('stroke-linecap','round'); svg.setAttribute('stroke-linejoin','round');
                                const path = document.createElementNS('http://www.w3.org/2000/svg','path');
                                path.setAttribute('d','M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z');
                                const poly = document.createElementNS('http://www.w3.org/2000/svg','polyline');
                                poly.setAttribute('points','9 22 9 12 15 12 15 22');
                                svg.appendChild(path); svg.appendChild(poly); parent.appendChild(svg);
                            }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#0f0f0f', margin: '0 0 2px', fontFamily: '"Playfair Display", serif' }}>MIPLACE PREMIUM</h2>
                        <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#6b6560', margin: '0 0 10px' }}>Recibo de Venda</p>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b6560', margin: 0 }}>{formatDateBR(receipt.date)}</p>
                    </div>

                    <div style={{ padding: '0 24px 28px' }}>

                        <div style={{ borderBottom: '1.5px dashed rgba(15,15,15,0.12)', padding: '20px 0' }}>
                            <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b6560', marginBottom: '10px' }}>Cliente</p>
                            <p style={{ fontSize: '15px', fontWeight: 800, color: '#0f0f0f', margin: '0 0 6px' }}>{receipt.clientName || '—'}</p>
                            {receipt.clientCpf && <p style={{ fontSize: '12px', fontWeight: 700, color: '#0f0f0f', margin: '0 0 4px', letterSpacing: '0.03em' }}>CPF</p>}
                            {receipt.clientCpf && <p style={{ fontSize: '13px', fontWeight: 800, color: '#0f0f0f', margin: '0 0 6px', letterSpacing: '0.05em' }}>{receipt.clientCpf}</p>}
                            <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b6560', margin: '8px 0 2px' }}>Vendedor(a)</p>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: '#0f0f0f', margin: 0 }}>{receipt.employeeName}</p>
                        </div>

                        <div style={{ borderBottom: '1.5px dashed rgba(15,15,15,0.12)', padding: '20px 0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '6px 12px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6b6560' }}>Item</span>
                                <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6b6560', textAlign: 'center' }}>Qtd</span>
                                <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6b6560', textAlign: 'right' }}>Total</span>
                            </div>
                            <div style={{ borderTop: '1.5px solid rgba(15,15,15,0.15)', paddingTop: '10px' }}>
                                {(receipt.items || []).sort((a, b) => { if (receipt.category === 'Troca') return a.unitPrice - b.unitPrice; return 0; }).map((it, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '4px 12px', padding: '8px 0', borderBottom: '1px solid rgba(15,15,15,0.07)' }}>
                                        <div>
                                            <p style={{ fontSize: '12px', fontWeight: 700, color: it.unitPrice < 0 ? '#c0392b' : '#0f0f0f', margin: '0 0 2px', textTransform: 'uppercase' }}>{it.type} - {it.description}</p>
                                            <p style={{ fontSize: '10px', color: '#6b6560', margin: 0 }}>
                                                {[it.ram_storage, it.color, it.imei ? `IMEI: ${it.imei}` : null, it.financed === 'Sim' ? 'Financiado' : null].filter(Boolean).join(' • ')}
                                            </p>
                                            {receipt.category === 'Troca' && <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: it.unitPrice > 0 ? '#2e7d32' : '#c0392b', marginTop: '2px' }}>{it.unitPrice > 0 ? '↑ Levou' : '↓ Devolveu'}</p>}
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f0f0f', textAlign: 'center', alignSelf: 'start', paddingTop: '2px' }}>{it.quantity}</span>
                                        <div style={{ textAlign: 'right', alignSelf: 'start', paddingTop: '2px' }}>
                                            {it.discount > 0 && <span style={{ fontSize: '10px', fontWeight: 600, color: '#6b6560', textDecoration: 'line-through', display: 'block' }}>{formatCurrency(it.unitPrice * it.quantity)}</span>}
                                            <span style={{ fontSize: '13px', fontWeight: 800, color: it.unitPrice < 0 ? '#c0392b' : '#0f0f0f' }}>{formatCurrency((it.unitPrice * it.quantity) - it.discount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ borderBottom: '1.5px dashed rgba(15,15,15,0.12)', padding: '16px 0' }}>
                            <div style={{ background: 'rgba(15,15,15,0.04)', borderRadius: '1rem', padding: '14px 16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560' }}>Subtotal:</span>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f0f0f' }}>R${formatCurrency(receipt.amount)}</span>
                                </div>
                                {receipt.discount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#c0392b' }}>Desconto:</span>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#c0392b' }}>-R${formatCurrency(receipt.discount)}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid rgba(15,15,15,0.1)', paddingTop: '10px', marginTop: '4px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f0f0f' }}>TOTAL:</span>
                                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f0f0f', letterSpacing: '-0.02em' }}>R${formatCurrency(receipt.amountPaid || receipt.amount)}</span>
                                </div>
                            </div>
                        </div>

                        {(receipt.payments || []).length > 0 && (
                            <div style={{ borderBottom: '1.5px dashed rgba(15,15,15,0.12)', padding: '16px 0' }}>
                                <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b6560', marginBottom: '10px' }}>Pagamento</p>
                                {(receipt.payments || []).map((p, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(15,15,15,0.06)' }}>
                                        <div>
                                            <p style={{ fontSize: '12px', fontWeight: 700, color: '#0f0f0f', margin: 0, textTransform: 'uppercase' }}>{p.method}{p.installments ? ` (${p.installments})` : ''}</p>
                                            <p style={{ fontSize: '9px', fontWeight: 600, color: '#6b6560', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.type || 'Integral'}</p>
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 800, color: p.amount < 0 ? '#c0392b' : '#0f0f0f' }}>{formatCurrency(p.amount)}</span>
                                    </div>
                                ))}
                                {receipt.change > 0.01 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#2e7d32', textTransform: 'uppercase' }}>Troco</span>
                                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#2e7d32' }}>{formatCurrency(receipt.change)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {receipt.paymentObservation && (
                            <div style={{ padding: '14px 0', borderBottom: '1.5px dashed rgba(15,15,15,0.12)' }}>
                                <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b6560', marginBottom: '4px' }}>Observação</p>
                                <p style={{ fontSize: '11px', color: '#0f0f0f', margin: 0 }}>{receipt.paymentObservation}</p>
                            </div>
                        )}

                        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
                            <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c9a227', marginBottom: '2px' }}>OBRIGADO PELA PREFERÊNCIA!</p>
                            <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6b6560', marginBottom: '14px' }}>GARANTIA CONFORME OS TERMOS.</p>
                            <div style={{ background: 'linear-gradient(110deg,#886918,#c9a227,#f5e4ab,#c9a227,#886918)', backgroundSize: '200% auto', borderRadius: '1rem', padding: '12px 16px', marginBottom: '12px' }}>
                                <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(15,15,15,0.6)', margin: '0 0 2px' }}>WhatsApp / Suporte</p>
                                <p style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.08em', color: '#0f0f0f', margin: 0, fontFamily: '"Space Mono", monospace' }}>(19) 99497-5131</p>
                            </div>
                            <p style={{ fontSize: '9px', fontWeight: 600, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vendedor: {receipt.employeeName} • {receipt.category}</p>
                        </div>

                    </div>

                    <div className="h-4" style={{ background: 'linear-gradient(45deg, transparent 33.333%, #f9f6f0 33.333%, #f9f6f0 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #f9f6f0 33.333%, #f9f6f0 66.667%, transparent 66.667%)', backgroundSize: '12px 24px', backgroundPosition: '0 -12px', transform: 'rotate(180deg)', backgroundColor: 'rgba(201,162,39,0.1)' }}></div>
                </div>

            </div>
        </div>
    );
}
