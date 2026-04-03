import { useMemo, useCallback } from 'react';
import { parseCurrency } from '../../utils.js';
import { useSaleMetadata } from '../form/useSaleMetadata.js';
import { useClientForm }   from '../form/useClientForm.js';
import { useItemForm }     from '../form/useItemForm.js';
import { usePaymentForm }  from '../form/usePaymentForm.js';

/**
 * Coordena os 4 sub-hooks do formulário de venda.
 *
 * Cada sub-hook tem seu próprio useReducer isolado:
 *   - useSaleMetadata  → date, category, editingId, clientSource, paymentObservation
 *   - useClientForm    → 11 campos do cliente
 *   - useItemForm      → items[], campos do novo item, exchangeAction
 *   - usePaymentForm   → paymentList[], campos do pagamento atual
 *
 * Expõe a mesma API pública de antes para não exigir mudanças no App.jsx.
 * Mudanças em qualquer sub-formulário não causam re-renders nos outros três.
 */
export function useSaleForm() {
  const meta    = useSaleMetadata();
  const client  = useClientForm();
  const itemF   = useItemForm();
  const payment = usePaymentForm();

  // ── Valores derivados ────────────────────────────────────────────────────
  const totalAmount = useMemo(
    () => itemF.items.reduce((acc, item) => acc + item.unitPrice * (item.quantity || 1), 0),
    [itemF.items],
  );
  const totalDiscount = useMemo(
    () => itemF.items.reduce((acc, item) => acc + (item.discount || 0), 0),
    [itemF.items],
  );
  const finalTotal = totalAmount - totalDiscount;

  const totalPaid = useMemo(
    () => payment.paymentList.reduce((acc, p) => acc + p.amount, 0),
    [payment.paymentList],
  );
  const changeAmount    = totalPaid - finalTotal;
  const remainingToPay  = Math.max(0, Math.round(((finalTotal - totalPaid) + Number.EPSILON) * 100) / 100);

  // ── Coordenação entre sub-hooks ──────────────────────────────────────────

  /** Limpa todos os sub-hooks de uma vez */
  const resetForm = useCallback(() => {
    meta.reset();
    client.reset();
    itemF.reset();
    payment.reset();
  }, [meta, client, itemF, payment]);

  /** Carrega todos os sub-hooks a partir de uma venda para edição */
  const startEdit = useCallback((sale) => {
    meta.loadFromSale(sale);
    client.loadFromSale(sale);
    itemF.loadFromSale(sale);
    payment.loadFromSale(sale);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [meta, client, itemF, payment]);

  // ── API pública (mesma superfície do hook original) ───────────────────────
  return useMemo(() => ({
    // Metadados
    date:                  meta.date,
    setDate:               meta.setDate,
    isDateLocked:          meta.isDateLocked,
    setIsDateLocked:       meta.setIsDateLocked,
    editingId:             meta.editingId,
    setEditingId:          meta.setEditingId,
    originalEmployeeName:  meta.originalEmployeeName,
    setOriginalEmployeeName: meta.setOriginalEmployeeName,
    category:              meta.category,
    setCategory:           meta.setCategory,
    clientSource:          meta.clientSource,
    setClientSource:       meta.setClientSource,
    paymentObservation:    meta.paymentObservation,
    setPaymentObservation: meta.setPaymentObservation,
    contractPdf:           meta.contractPdf,
    setContractPdf:        meta.setContractPdf,

    // Cliente
    clientName:         client.clientName,
    setClientName:      client.setClientName,
    clientCpf:          client.clientCpf,
    setClientCpf:       client.setClientCpf,
    clientPhone:        client.clientPhone,
    setClientPhone:     client.setClientPhone,
    clientEmail:        client.clientEmail,
    setClientEmail:     client.setClientEmail,
    clientDob:          client.clientDob,
    setClientDob:       client.setClientDob,
    clientAddress:      client.clientAddress,
    setClientAddress:   client.setClientAddress,
    clientNumber:       client.clientNumber,
    setClientNumber:    client.setClientNumber,
    clientCity:         client.clientCity,
    setClientCity:      client.setClientCity,
    clientZip:          client.clientZip,
    setClientZip:       client.setClientZip,
    clientState:        client.clientState,
    setClientState:     client.setClientState,
    clientNeighborhood: client.clientNeighborhood,
    setClientNeighborhood: client.setClientNeighborhood,
    fillClientData:     client.fillClientData,

    // Itens
    items:                  itemF.items,
    setItems:               itemF.setItems,
    newItemQty:             itemF.newItemQty,
    setNewItemQty:          itemF.setNewItemQty,
    newItemType:            itemF.newItemType,
    setNewItemType:         itemF.setNewItemType,
    newItemDesc:            itemF.newItemDesc,
    setNewItemDesc:         itemF.setNewItemDesc,
    newItemRam:             itemF.newItemRam,
    setNewItemRam:          itemF.setNewItemRam,
    newItemColor:           itemF.newItemColor,
    setNewItemColor:        itemF.setNewItemColor,
    newItemImei:            itemF.newItemImei,
    setNewItemImei:         itemF.setNewItemImei,
    newItemFinanced:        itemF.newItemFinanced,
    setNewItemFinanced:     itemF.setNewItemFinanced,
    newItemPrice:           itemF.newItemPrice,
    setNewItemPrice:        itemF.setNewItemPrice,
    newItemDiscount:        itemF.newItemDiscount,
    setNewItemDiscount:     itemF.setNewItemDiscount,
    newItemDiscountPercent: itemF.newItemDiscountPercent,
    setNewItemDiscountPercent: itemF.setNewItemDiscountPercent,
    editingItemId:          itemF.editingItemId,
    setEditingItemId:       itemF.setEditingItemId,
    exchangeAction:         itemF.exchangeAction,
    setExchangeAction:      itemF.setExchangeAction,
    handleEditItem:         itemF.handleEditItem,

    // Pagamentos
    paymentList:            payment.paymentList,
    setPaymentList:         payment.setPaymentList,
    currentPaymentMethod:   payment.currentPaymentMethod,
    setCurrentPaymentMethod: payment.setCurrentPaymentMethod,
    currentPaymentType:     payment.currentPaymentType,
    setCurrentPaymentType:  payment.setCurrentPaymentType,
    currentPaymentAmount:   payment.currentPaymentAmount,
    setCurrentPaymentAmount: payment.setCurrentPaymentAmount,
    currentInstallments:    payment.currentInstallments,
    setCurrentInstallments: payment.setCurrentInstallments,
    editingPaymentId:       payment.editingPaymentId,
    setEditingPaymentId:    payment.setEditingPaymentId,
    handleEditPayment:      payment.handleEditPayment,

    // Derivados
    totalAmount,
    totalDiscount,
    finalTotal,
    totalPaid,
    changeAmount,
    remainingToPay,

    // Coordenação
    resetForm,
    startEdit,
  }), [
    meta.date, meta.isDateLocked, meta.editingId, meta.originalEmployeeName,
    meta.category, meta.clientSource, meta.paymentObservation, meta.contractPdf,
    meta.setDate, meta.setIsDateLocked, meta.setEditingId, meta.setOriginalEmployeeName,
    meta.setCategory, meta.setClientSource, meta.setPaymentObservation, meta.setContractPdf,

    client.clientName, client.clientCpf, client.clientPhone, client.clientEmail,
    client.clientDob, client.clientAddress, client.clientNumber, client.clientCity,
    client.clientZip, client.clientState, client.clientNeighborhood,
    client.setClientName, client.setClientCpf, client.setClientPhone, client.setClientEmail,
    client.setClientDob, client.setClientAddress, client.setClientNumber, client.setClientCity,
    client.setClientZip, client.setClientState, client.setClientNeighborhood,
    client.fillClientData,

    itemF.items, itemF.editingItemId, itemF.exchangeAction,
    itemF.newItemQty, itemF.newItemType, itemF.newItemDesc, itemF.newItemRam,
    itemF.newItemColor, itemF.newItemImei, itemF.newItemFinanced, itemF.newItemPrice,
    itemF.newItemDiscount, itemF.newItemDiscountPercent,
    itemF.setItems, itemF.setNewItemQty, itemF.setNewItemType, itemF.setNewItemDesc,
    itemF.setNewItemRam, itemF.setNewItemColor, itemF.setNewItemImei, itemF.setNewItemFinanced,
    itemF.setNewItemPrice, itemF.setNewItemDiscount, itemF.setNewItemDiscountPercent,
    itemF.setEditingItemId, itemF.setExchangeAction, itemF.handleEditItem,

    payment.paymentList, payment.editingPaymentId,
    payment.currentPaymentMethod, payment.currentPaymentType,
    payment.currentPaymentAmount, payment.currentInstallments,
    payment.setPaymentList, payment.setCurrentPaymentMethod, payment.setCurrentPaymentType,
    payment.setCurrentPaymentAmount, payment.setCurrentInstallments,
    payment.setEditingPaymentId, payment.handleEditPayment,

    totalAmount, totalDiscount, finalTotal, totalPaid, changeAmount, remainingToPay,
    resetForm, startEdit,
  ]);
}
