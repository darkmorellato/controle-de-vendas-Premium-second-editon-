import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '../../services/salesService.js';
import { clientService } from '../../services/clientService.js';
import type { Sale, Client } from '../../types/index.ts';

interface SaleData {
  salesToUpdate: Sale[];
  clientData: Client;
}

interface UploadData {
  saleId: string;
  file: File;
}

interface ClientData {
  clientId: string;
  data: Partial<Client>;
}

export function useSalesMutations() {
  const queryClient = useQueryClient();

  const saveSale = useMutation<Sale, Error, Sale>({
    mutationFn: async (saleData) => {
      await salesService.save(saleData);
      return saleData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });

  const deleteSale = useMutation<string, Error, string>({
    mutationFn: async (saleId) => {
      await salesService.delete(saleId);
      return saleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });

  const updateClientInSales = useMutation<void, Error, SaleData>({
    mutationFn: async ({ salesToUpdate, clientData }) => {
      await salesService.updateClientInSales(salesToUpdate, clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });

  const uploadContract = useMutation<string, Error, UploadData>({
    mutationFn: async ({ saleId, file }) => {
      return await salesService.uploadContract(saleId, file);
    },
  });

  return {
    saveSale,
    deleteSale,
    updateClientInSales,
    uploadContract,
  };
}

export function useClientMutations() {
  const queryClient = useQueryClient();

  const saveClient = useMutation<Client, Error, Client>({
    mutationFn: async (clientData) => {
      await clientService.save(clientData);
      return clientData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateClient = useMutation<void, Error, ClientData>({
    mutationFn: async ({ clientId, data }) => {
      await clientService.update(clientId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return {
    saveClient,
    updateClient,
  };
}