import { useCallback, useRef, useState } from 'react';
import type { Sale } from '../types/index.ts';

interface UseReceiptHandlersProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function useReceiptHandlers({ showToast }: UseReceiptHandlersProps) {
  const [currentReceipt, setCurrentReceipt] = useState<Sale | null>(null);
  const fileInputInternalRef = useRef<HTMLInputElement | null>(null);

  const openReceipt = useCallback((sale: Sale) => {
    setCurrentReceipt(sale);
  }, []);

  const handleExportReceiptPDF = useCallback(() => {
    const element = document.getElementById('receipt-paper');
    if (!element) { showToast('Recibo não encontrado', 'error'); return; }
    const clientName = currentReceipt?.clientName || 'Venda';
    const receiptHtml = element.outerHTML;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Recibo - ${clientName}</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><style>*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;box-sizing:border-box;margin:0;padding:0}html,body{background:#d0cdc8;display:flex;justify-content:center;padding:24px;font-family:'Plus Jakarta Sans',sans-serif}#receipt-paper{width:360px!important;overflow:hidden}img{max-width:100%}@media print{@page{size:80mm auto;margin:0}html,body{background:white;padding:0;display:block}#receipt-paper{width:80mm!important;border-radius:0!important}}</style></head><body>${receiptHtml}<script>document.fonts.ready.then(function(){setTimeout(function(){window.print()},800)})<\/script></body></html>`;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    const win = iframe.contentWindow;
    if (!win) { document.body.removeChild(iframe); return; }
    const iframeDoc = win.document;
    iframeDoc.open(); iframeDoc.write(html); iframeDoc.close();
    win.focus();
    setTimeout(() => {
      try { win.print(); showToast('Dialogo de impressao aberto!'); }
      catch (e: any) { showToast('Erro: ' + e.message, 'error'); }
      setTimeout(() => document.body.removeChild(iframe), 60_000);
    }, 1000);
  }, [currentReceipt, showToast]);

  return {
    currentReceipt,
    setCurrentReceipt,
    openReceipt,
    handleExportReceiptPDF,
    fileInputInternalRef,
  };
}