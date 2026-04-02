import { useState } from 'react';
import type { Client, Sale } from '../types/index.ts';

export function useClientDataHandlers() {
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<Client | null>(null);
  const [selectedClientHistory, setSelectedClientHistory] = useState<{ client: Client; history: Sale[] } | null>(null);
  const [clientDetailsData, setClientDetailsData] = useState<any>(null);

  return {
    selectedClientForEdit,
    setSelectedClientForEdit,
    selectedClientHistory,
    setSelectedClientHistory,
    clientDetailsData,
    setClientDetailsData,
  };
}