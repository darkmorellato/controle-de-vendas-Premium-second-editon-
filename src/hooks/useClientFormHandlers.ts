import { useCallback } from 'react';
import { maskCPF, maskCEP, validateCPF } from '../utils.js';
import { clientService } from '../services/index.js';
import type { Client } from '../types/index.ts';

interface UseClientFormHandlersProps {
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
  employeeName: string;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function useClientFormHandlers({ form, clients, employeeName, showToast }: UseClientFormHandlersProps) {
  const handleCpfChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = maskCPF(e.target.value);
    form.setClientCpf(val);
    if (val.replace(/\D/g, '').length === 11) {
      const found = clients.find(
        (c) => c.cpf && c.cpf.replace(/\D/g, '') === val.replace(/\D/g, ''),
      );
      if (found) { showToast('Cliente encontrado!', 'info'); form.fillClientData(found); }
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
    if (!form.clientName) { showToast('Nome é obrigatório', 'error'); return null; }
    if (form.clientCpf && !validateCPF(form.clientCpf)) { showToast('CPF Inválido', 'error'); return null; }
    const existingClient = clients.find(
      (c) =>
        (c.cpf && form.clientCpf && c.cpf.replace(/\D/g, '') === form.clientCpf.replace(/\D/g, '')) ||
        (c.name && form.clientName && c.name.trim().toLowerCase() === form.clientName.trim().toLowerCase()),
    );
    const clientId = existingClient ? existingClient.id : clientService.generateId();
    const clientData = {
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

  return {
    handleCpfChange,
    handleZipChange,
    handleSaveClient,
  };
}