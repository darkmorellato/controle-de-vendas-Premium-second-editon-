import { useQuery } from '@tanstack/react-query';
import { clientService } from '../../services';

export function useClientsQuery() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAll(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useClientById(clientId: string | null) {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientId ? clientService.getById(clientId) : null,
    enabled: !!clientId,
  });
}