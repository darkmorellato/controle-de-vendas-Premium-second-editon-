import { useCallback, useState } from 'react';
import { formatDateBR } from '../utils.js';
import { salesService, clientService } from '../services/index.js';
import type { Sale, Client } from '../types/index.ts';

interface UseClientDataModalProps {
  clients: Client[];
  sales: Sale[];
  openModal: (modal: string) => void;
  closeModal: (modal: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  selectedClientForEdit: Client | null;
  setSelectedClientForEdit: (client: Client | null) => void;
}

export function useClientDataModal({
  clients,
  sales,
  openModal,
  closeModal,
  showToast,
  selectedClientForEdit,
  setSelectedClientForEdit,
}: UseClientDataModalProps) {
  const [selectedClientHistory, setSelectedClientHistory] = useState<{ client: Client; history: Sale[] } | null>(null);
  const [clientDetailsData, setClientDetailsData] = useState<any>(null);

  const handleViewHistory = useCallback((client: Client) => {
    const cleanTargetCpf = client.cpf ? client.cpf.replace(/\D/g, '') : null;
    const targetName = (client.name || '').trim().toLowerCase();
    const clientSales = sales.filter((s) => {
      if (s.clientId && s.clientId === client.id) return true;
      const saleCpf = s.clientCpf ? s.clientCpf.replace(/\D/g, '') : null;
      if (cleanTargetCpf?.length === 11) return saleCpf && cleanTargetCpf === saleCpf;
      return (s.clientName || '').trim().toLowerCase() === targetName && !(saleCpf?.length === 11);
    });
    setSelectedClientHistory({ client, history: clientSales });
    openModal('clientHistory');
  }, [sales, openModal]);

  const handleOpenClientData = useCallback((client: Client) => {
    setSelectedClientForEdit({ ...client });
    openModal('clientData');
  }, [openModal, setSelectedClientForEdit]);

  const handleClientDataChange = useCallback((field: string, value: any) => {
    if (selectedClientForEdit) {
      setSelectedClientForEdit({ ...selectedClientForEdit, [field]: value });
    }
  }, [selectedClientForEdit, setSelectedClientForEdit]);

  const performClientUpdate = useCallback(async () => {
    if (!selectedClientForEdit) return;
    const originalClient = clients.find((c) => c.id === selectedClientForEdit.id);
    const originalCpf = originalClient?.cpf ? originalClient.cpf.replace(/\D/g, '') : null;
    const originalName = (originalClient?.name || '').trim().toLowerCase();
    const salesToUpdate = sales.filter((s) => {
      const saleCpf = s.clientCpf ? s.clientCpf.replace(/\D/g, '') : null;
      return (
        (s.clientId && s.clientId === selectedClientForEdit.id) ||
        (originalCpf && saleCpf && originalCpf === saleCpf) ||
        ((s.clientName || '').trim().toLowerCase() === originalName && originalName !== '')
      );
    });
    try {
      await clientService.update(selectedClientForEdit.id, selectedClientForEdit);
      await salesService.updateClientInSales(salesToUpdate, selectedClientForEdit);
      showToast('Dados atualizados!');
      closeModal('confirmClientUpdate');
      closeModal('clientData');
    } catch (error: any) { showToast('Erro: ' + error.message, 'error'); }
  }, [selectedClientForEdit, clients, sales, closeModal, showToast]);

  const confirmClientUpdate = useCallback(() => {
    openModal('managerAuth');
  }, [openModal]);

  const openClientDetails = useCallback((sale: Sale) => {
    const clientData = {
      clientName: sale.clientName,
      clientCpf: sale.clientCpf,
      clientPhone: sale.clientPhone,
      clientEmail: sale.clientEmail,
      clientDob: sale.clientDob ? formatDateBR(sale.clientDob) : '',
      clientAddress: sale.clientAddress,
      clientNumber: sale.clientNumber,
      clientNeighborhood: sale.clientNeighborhood,
      clientCity: sale.clientCity,
      clientState: sale.clientState,
      clientZip: sale.clientZip,
    };
    setClientDetailsData(clientData);
    openModal('clientDetails');
  }, [openModal]);

  return {
    selectedClientHistory,
    setSelectedClientHistory,
    clientDetailsData,
    setClientDetailsData,
    handleViewHistory,
    handleOpenClientData,
    handleClientDataChange,
    performClientUpdate,
    confirmClientUpdate,
    openClientDetails,
  };
}