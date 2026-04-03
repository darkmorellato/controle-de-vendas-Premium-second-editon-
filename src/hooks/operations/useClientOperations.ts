/**
 * Unified client operations hook.
 * Merges: useClientHandlers + useClientFormHandlers + useClientDataModal
 * Single source of truth for all client-related logic.
 */
import { useCallback } from 'react';
import { clientService, salesService } from '../../services/index.js';
import { maskCPF, maskCEP, validateCPF } from '../../utils.js';
import type { Client, Sale } from '../../types/index.ts';

interface UseClientOperationsProps {
  form: {
    clientName: string;
    clientCpf: string;
    clientPhone: string;
    clientEmail: string;
    clientDob: string;
    clientAddress: string;
    clientNumber: string;
    clientCity: string;
    clientZip: string;
    clientState: string;
    clientNeighborhood: string;
    fillClientData: (client: Client) => void;
    setClientCpf: (cpf: string) => void;
    setClientZip: (zip: string) => void;
    setClientAddress: (address: string) => void;
    setClientCity: (city: string) => void;
    setClientState: (state: string) => void;
    setClientNeighborhood: (neighborhood: string) => void;
  };
  clients: Client[];
  sales: Sale[];
  employeeName: string;
  selectedClientForEdit: Client | null;
  setSelectedClientForEdit: (client: Client | null | ((prev: Client | null) => Client | null)) => void;
  openModal: (modal: string, data?: unknown) => void;
  closeModal: (modal: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function useClientOperations({
  form,
  clients,
  sales,
  employeeName,
  selectedClientForEdit,
  setSelectedClientForEdit,
  openModal,
  closeModal,
  showToast,
}: UseClientOperationsProps) {
  const handleCpfChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = maskCPF(e.target.value);
    form.setClientCpf(val);

    if (val.replace(/\D/g, '').length === 11) {
      const found = clients.find(
        (c) => c.cpf && c.cpf.replace(/\D/g, '') === val.replace(/\D/g, ''),
      );
      if (found) {
        showToast('Cliente encontrado!', 'info');
        form.fillClientData(found);
      }
    }
  }, [clients, showToast, form]);

  const handleZipChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = maskCEP(e.target.value);
    form.setClientZip(value);

    if (value.replace(/\D/g, '').length === 8) {
      try {
        showToast('Buscando endereço...', 'info');
        const res = await fetch(`https://viacep.com.br/ws/${value.replace(/\D/g, '')}/json/`);
        const data = await res.json();

        if (!data.erro) {
          form.setClientAddress(data.logradouro);
          form.setClientCity(data.localidade);
          form.setClientState(data.uf);
          form.setClientNeighborhood(data.bairro);
          showToast('Endereço encontrado!');
        } else {
          showToast('CEP não encontrado. Verifique o número.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Erro ao buscar o CEP. Verifique sua conexão.', 'error');
      }
    }
  }, [showToast, form]);

  const handleSaveClient = useCallback(() => {
    if (!form.clientName) {
      showToast('Nome é obrigatório', 'error');
      return null;
    }

    if (form.clientCpf && !validateCPF(form.clientCpf)) {
      showToast('CPF Inválido', 'error');
      return null;
    }

    const existingClient = clients.find(
      (c) =>
        (c.cpf && form.clientCpf && c.cpf.replace(/\D/g, '') === form.clientCpf.replace(/\D/g, '')) ||
        (c.name && form.clientName && c.name.trim().toLowerCase() === form.clientName.trim().toLowerCase()),
    );

    const clientId = existingClient ? existingClient.id : clientService.generateId();
    const clientData: Client = {
      id: clientId,
      name: form.clientName,
      cpf: form.clientCpf,
      phone: form.clientPhone,
      email: form.clientEmail,
      dob: form.clientDob,
      address: form.clientAddress,
      number: form.clientNumber,
      neighborhood: form.clientNeighborhood,
      city: form.clientCity,
      zip: form.clientZip,
      state: form.clientState,
      createdBy: existingClient ? existingClient.createdBy : employeeName,
      createdAt: existingClient ? existingClient.createdAt : new Date().toISOString(),
    };

    clientService.save(clientData)
      .then(() => showToast('Dados salvos!'))
      .catch((err) => showToast('Erro: ' + err.message, 'error'));

    return clientId;
  }, [form, clients, employeeName, showToast]);

  const handleViewHistory = useCallback((client: Client) => {
    const cleanTargetCpf = client.cpf ? client.cpf.replace(/\D/g, '') : null;
    const targetName = (client.name || '').trim().toLowerCase();

    const clientSales = sales.filter((s) => {
      if (s.clientId && s.clientId === client.id) return true;
      const saleCpf = s.clientCpf ? s.clientCpf.replace(/\D/g, '') : null;
      if (cleanTargetCpf?.length === 11) return saleCpf && cleanTargetCpf === saleCpf;
      return (s.clientName || '').trim().toLowerCase() === targetName && !(saleCpf?.length === 11);
    });

    openModal('clientHistory', { client, history: clientSales });
  }, [sales, openModal]);

  const handleOpenClientData = useCallback((client: Client) => {
    setSelectedClientForEdit({ ...client });
    openModal('clientData');
  }, [setSelectedClientForEdit, openModal]);

  const handleClientDataChange = useCallback((field: string, value: string) => {
    setSelectedClientForEdit((prev) => prev ? { ...prev, [field]: value } as Client : null);
  }, [setSelectedClientForEdit]);

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
    } catch (error) {
      showToast('Erro: ' + (error as Error).message, 'error');
    }
  }, [selectedClientForEdit, clients, sales, closeModal, showToast]);

  const confirmClientUpdate = useCallback(() => {
    openModal('managerAuth', { action: 'update_client' });
  }, [openModal]);

  return {
    handleCpfChange,
    handleZipChange,
    handleSaveClient,
    handleViewHistory,
    handleOpenClientData,
    handleClientDataChange,
    performClientUpdate,
    confirmClientUpdate,
  };
}
