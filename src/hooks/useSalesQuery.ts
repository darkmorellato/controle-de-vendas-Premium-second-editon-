import { useQuery } from '@tanstack/react-query';
import { salesService } from '../services';
import { SALES_WINDOW_DAYS } from '../constants';

export function useSalesQuery() {
  const cutoffDate = (() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - SALES_WINDOW_DAYS);
    return cutoff.toISOString().split('T')[0];
  })();

  return useQuery({
    queryKey: ['sales', cutoffDate],
    queryFn: () => salesService.getAll(cutoffDate),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useSaleById(saleId: string | null) {
  return useQuery({
    queryKey: ['sale', saleId],
    queryFn: () => saleId ? salesService.getById(saleId) : null,
    enabled: !!saleId,
  });
}