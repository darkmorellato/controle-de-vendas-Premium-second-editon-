import { useCallback } from 'react';
import { formatCurrency } from '../utils.js';
import type { Sale, GroupedSale } from '../types';

interface UsePrintHandlersProps {
  currentReceipt: Sale | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setItemsPerPage: (count: number) => void;
  setCurrentReceipt: (sale: Sale | null) => void;
  openModal: (modal: string, data?: unknown) => void;
}

export function usePrintHandlers({
  currentReceipt,
  showToast,
  setItemsPerPage,
  setCurrentReceipt,
  openModal,
}: UsePrintHandlersProps) {
  const handleExportReceiptPDF = useCallback(() => {
    const element = document.getElementById('receipt-paper');
    if (!element) {
      showToast('Recibo não encontrado', 'error');
      return;
    }
    
    const clientName = currentReceipt?.clientName || 'Venda';
    const receiptHtml = element.outerHTML;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Recibo - ${clientName}</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><style>*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;box-sizing:border-box;margin:0;padding:0}html,body{background:#d0cdc8;display:flex;justify-content:center;padding:24px;font-family:'Plus Jakarta Sans',sans-serif}#receipt-paper{width:360px!important;overflow:hidden}img{max-width:100%}@media print{@page{size:80mm auto;margin:0}html,body{background:white;padding:0;display:block}#receipt-paper{width:80mm!important;border-radius:0!important}}</style></head><body>${receiptHtml}<script>document.fonts.ready.then(function(){setTimeout(function(){window.print()},800)})<\/script></body></html>`;
    
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      showToast('Erro ao criar iframe de impressão', 'error');
      return;
    }
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
    
    const contentWindow = iframe.contentWindow;
    if (!contentWindow) return;
    
    contentWindow.focus();
    
    setTimeout(() => {
      try {
        contentWindow.print();
        showToast('Diálogo de impressão aberto!');
      } catch (e) {
        showToast('Erro: ' + (e as Error).message, 'error');
      }
      setTimeout(() => document.body.removeChild(iframe), 60_000);
    }, 1000);
  }, [currentReceipt, showToast]);

  const printSalesList = useCallback(() => {
    setItemsPerPage(10_000);
    
    setTimeout(() => {
      const source = document.querySelector('.print-sales-area');
      if (!source) {
        showToast('Nenhum dado para imprimir', 'error');
        setItemsPerPage(50);
        return;
      }
      
      const clone = source.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.no-print').forEach((el) => el.remove());
      
      const totalValue = Array.from(clone.querySelectorAll('.sales-table tbody tr'))
        .reduce((sum, row) => {
          const totalCell = row.querySelector('td:nth-child(5) div:first-child');
          if (totalCell) {
            const text = totalCell.textContent || '';
            const num = parseFloat(text.replace(/[R$ .\d,]/g, '').replace(',', '.'));
            return sum + (isNaN(num) ? 0 : num);
          }
          return sum;
        }, 0);
      
      const ph = clone.querySelector('.print-header') as HTMLElement | null;
      if (ph) {
        ph.innerHTML = '';
        Object.assign(ph.style, { display:'block', textAlign:'center', marginBottom:'10px', paddingBottom:'8px', borderBottom:'2px solid #000', fontFamily:'Arial,sans-serif' });
        const div = document.createElement('div');
        Object.assign(div.style, { fontSize:'12px', fontWeight:'bold', color:'#000', marginTop:'5px', letterSpacing:'1px' });
        div.textContent = `TOTAL LISTADO: R$ ${formatCurrency(totalValue)}`;
        ph.appendChild(div);
      }
      
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
      document.body.appendChild(iframe);
      
      const win = iframe.contentWindow;
      if (!win) return;
      
      win.document.write(`<html><head><title>Relatorio de Vendas</title><style>@page{margin:10mm;size:A4 portrait}body{margin:0;padding:0;font-family:Arial,sans-serif;font-size:10pt;color:#000;background:#fff;line-height:1.3}*{color:#000!important;background:transparent!important;box-shadow:none!important;text-shadow:none!important;border-color:#000!important;border-radius:0!important}table{border-collapse:collapse;width:100%;table-layout:fixed;margin-bottom:20px}table tr{page-break-inside:avoid;border-bottom:1px solid #ddd}table th,table td{padding:8px 4px;text-align:left;vertical-align:top;word-wrap:break-word}table th{font-weight:bold;border-bottom:2px solid #000;font-size:9pt;text-transform:uppercase;color:#333!important}.flex{display:flex;align-items:center;justify-content:space-between;border-left:3px solid #000;padding-left:8px;margin-bottom:8px;margin-top:15px;background:#f9f9f9!important;padding:4px 8px}table th:nth-child(1),table td:nth-child(1){width:18%}table th:nth-child(2),table td:nth-child(2){width:38%}table th:nth-child(3),table td:nth-child(3){width:10%;text-align:center}table th:nth-child(4),table td:nth-child(4){width:20%}table th:nth-child(5),table td:nth-child(5){width:14%;text-align:right}table td:nth-child(5) div:first-child{font-weight:bold;font-size:11pt}b,strong{font-weight:bold}h3{margin:0;font-size:11pt;font-weight:bold;text-transform:uppercase}.space-y-10>div{margin-bottom:20px}.print-header{text-align:center;margin-bottom:20px;border-bottom:2px solid #000;padding-bottom:15px}p{margin:3px 0}svg{display:none!important}*{font-size:10pt!important;line-height:1.3!important}h3,h3*{font-size:11pt!important}table th,table th*{font-size:9pt!important}table td:nth-child(5) div:first-child,table td:nth-child(5) div:first-child*{font-size:11pt!important}td div.flex{display:block!important;border:none!important;padding:0!important;margin:0!important;background:transparent!important}td .flex-1,td .text-right,td .flex-shrink-0{display:block!important}</style></head><body>${clone.innerHTML}</body></html>`);
      
      win.document.close();
      win.focus();
      
      setTimeout(() => {
        win.print();
        document.body.removeChild(iframe);
        setItemsPerPage(50);
      }, 350);
    }, 250);
  }, [showToast, setItemsPerPage]);

  const openReceipt = useCallback((sale: Sale) => {
    setCurrentReceipt(sale);
    openModal('receipt');
  }, [setCurrentReceipt, openModal]);

  return {
    handleExportReceiptPDF,
    printSalesList,
    openReceipt,
  };
}