import { useCallback } from 'react';
import { parseCurrency, formatCurrency, generateLocalId } from '../utils.js';
import type { SaleItem, Sale, ProductType, RAMStorageOption } from '../types';

interface UseItemHandlersProps {
  form: {
    category: string;
    newItemQty: number;
    newItemType: ProductType | '';
    newItemDesc: string;
    newItemRam: RAMStorageOption | '';
    newItemColor: string;
    newItemImei: string;
    newItemFinanced: 'Sim' | 'Não';
    newItemPrice: string;
    newItemDiscount: string;
    newItemDiscountPercent: string;
    editingItemId: number | null;
    exchangeAction: string;
    items: SaleItem[];
    setItems: (items: SaleItem[] | ((prev: SaleItem[]) => SaleItem[])) => void;
    setNewItemQty: (qty: number) => void;
    setNewItemType: (type: ProductType | '') => void;
    setNewItemDesc: (desc: string) => void;
    setNewItemRam: (ram: RAMStorageOption | '') => void;
    setNewItemColor: (color: string) => void;
    setNewItemImei: (imei: string) => void;
    setNewItemFinanced: (financed: 'Sim' | 'Não') => void;
    setNewItemPrice: (price: string) => void;
    setNewItemDiscount: (discount: string) => void;
    setNewItemDiscountPercent: (percent: string) => void;
    setEditingItemId: (id: number | null) => void;
  };
  sales: Sale[];
  editingId: string | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function useItemHandlers({
  form,
  sales,
  editingId,
  showToast,
}: UseItemHandlersProps) {
  const handleAddItem = useCallback(() => {
    if (!form.category) {
      showToast('Selecione a Categoria primeiro', 'error');
      return;
    }
    
    if (!form.newItemType) {
      showToast('Selecione o Tipo do item', 'error');
      return;
    }
    
    if (!form.newItemDesc || !form.newItemPrice) {
      showToast('Preencha Descrição e Preço', 'error');
      return;
    }
    
    if (form.newItemImei?.trim()) {
      const imeiClean = form.newItemImei.trim();
      
      if (form.items.some((i) => i.imei?.trim() === imeiClean && i.id !== form.editingItemId)) {
        showToast('⚠️ IMEI já adicionado nesta venda!', 'error');
        return;
      }
      
      if (sales.some((s) => {
        if (editingId && s.id === editingId) return false;
        return (s.items || []).some((i) => i.imei?.trim() === imeiClean);
      })) {
        showToast('⚠️ IMEI já registrado em outra venda!', 'error');
        return;
      }
    }
    
    let finalPrice = parseCurrency(form.newItemPrice);
    let finalDiscount = parseCurrency(form.newItemDiscount);
    
    if (form.category === 'Devolução') {
      finalPrice = -Math.abs(finalPrice);
      finalDiscount = -Math.abs(finalDiscount);
    } else if (form.category === 'Troca') {
      if (form.exchangeAction === 'in') {
        finalPrice = -Math.abs(finalPrice);
        finalDiscount = -Math.abs(finalDiscount);
      } else {
        finalPrice = Math.abs(finalPrice);
        finalDiscount = Math.abs(finalDiscount);
      }
    }
    
    if (form.editingItemId) {
      form.setItems((prev) => prev.map((i) => 
        i.id === form.editingItemId
          ? {
              ...i,
              quantity: form.newItemQty,
              type: form.newItemType || 'PRODUTO',
              description: form.newItemDesc,
              ram_storage: form.newItemRam,
              color: form.newItemColor,
              imei: form.newItemImei,
              financed: form.newItemFinanced,
              unitPrice: finalPrice,
              discount: finalDiscount,
            }
          : i
      ));
      form.setEditingItemId(null);
      showToast('Item atualizado!');
    } else {
      const newItem: SaleItem = {
        id: generateLocalId(),
        sequence: form.items.length + 1,
        quantity: form.newItemQty,
        type: form.newItemType || 'PRODUTO',
        description: form.newItemDesc,
        ram_storage: form.newItemRam,
        color: form.newItemColor,
        imei: form.newItemImei,
        financed: form.newItemFinanced,
        unitPrice: finalPrice,
        discount: finalDiscount,
      };
      form.setItems((prev) => [...prev, newItem]);
    }
    
    form.setNewItemQty(1);
    form.setNewItemType('');
    form.setNewItemDesc('');
    form.setNewItemRam('');
    form.setNewItemColor('');
    form.setNewItemImei('');
    form.setNewItemFinanced('Não');
    form.setNewItemPrice('');
    form.setNewItemDiscount('');
    form.setNewItemDiscountPercent('');
  }, [form, sales, editingId, showToast]);

  const handleEditItem = useCallback((item: SaleItem) => {
    form.setEditingItemId(item.id);
    form.setNewItemQty(item.quantity);
    form.setNewItemType(item.type as ProductType);
    form.setNewItemDesc(item.description);
    form.setNewItemRam((item.ram_storage as RAMStorageOption) || '');
    form.setNewItemColor(item.color || '');
    form.setNewItemImei(item.imei || '');
    form.setNewItemFinanced(item.financed);
    form.setNewItemPrice(formatCurrency(Math.abs(item.unitPrice)));
    form.setNewItemDiscount(formatCurrency(Math.abs(item.discount)));
  }, [form]);

  const handleItemPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const floatVal = parseFloat(val) / 100 || 0;
    form.setNewItemPrice(formatCurrency(floatVal));
    
    if (form.newItemDiscountPercent) {
      const pct = parseFloat(form.newItemDiscountPercent.replace(',', '.')) || 0;
      form.setNewItemDiscount(formatCurrency((floatVal * form.newItemQty) * (pct / 100)));
    }
  }, [form]);

  const handlePercentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(',', '.');
    form.setNewItemDiscountPercent(val);
    
    if (form.newItemPrice) {
      const price = parseCurrency(form.newItemPrice);
      const pct = parseFloat(val) || 0;
      form.setNewItemDiscount(formatCurrency((price * form.newItemQty) * (pct / 100)));
    }
  }, [form]);

  const handleDiscountValChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const floatVal = parseFloat(val) / 100 || 0;
    form.setNewItemDiscount(formatCurrency(floatVal));
    
    if (form.newItemPrice) {
      const price = parseCurrency(form.newItemPrice) * form.newItemQty;
      if (price > 0) {
        form.setNewItemDiscountPercent(((floatVal / price) * 100).toFixed(2).replace('.', ','));
      }
    }
  }, [form]);

  return {
    handleAddItem,
    handleEditItem,
    handleItemPriceChange,
    handlePercentChange,
    handleDiscountValChange,
  };
}