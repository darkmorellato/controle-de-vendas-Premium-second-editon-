import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

/**
 * Hook de filtros e paginação das vendas.
 * Aceita `clients` para resolver dados de cliente tanto do modelo novo (clientId)
 * quanto do modelo legado (campos embutidos).
 *
 * @param {any[]} sales
 * @param {any[]} [clients=[]]
 */
export function useFilters(sales, clients = []) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterMode, setFilterMode] = useState('daily');
  const [groupBy, setGroupBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSetSearchTerm = useCallback((val) => {
    setSearchTerm(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 300);
  }, []);

  const filteredSales = useMemo(() => {
    let f = sales;

    // Filtro por data
    if (filterDate) {
      if (filterMode === 'daily') {
        f = f.filter((s) => s.date === filterDate);
      } else if (filterMode === 'monthly') {
        const [year, month] = filterDate.split('-');
        f = f.filter((s) => s.date?.startsWith(`${year}-${month}`));
      } else if (filterMode === 'yearly') {
        const [year] = filterDate.split('-');
        f = f.filter((s) => s.date?.startsWith(year));
      }
    }

    // Filtro por texto — suporta modelo novo (clientId) e legado (campos embutidos)
    if (debouncedSearch) {
      const lowerTerm = debouncedSearch.toLowerCase();
      f = f.filter((s) => {
        // Resolve cliente pelo modelo novo ou legado
        const client = s.clientId ? clients.find((c) => c.id === s.clientId) : null;
        const name = (client?.name || s.clientName || '').toLowerCase();
        const cpf = client?.cpf || s.clientCpf || '';

        return (
          name.includes(lowerTerm) ||
          cpf.includes(lowerTerm) ||
          (s.items || []).some(
            (i) =>
              (i.description || '').toLowerCase().includes(lowerTerm) ||
              (i.imei && i.imei.includes(lowerTerm)),
          )
        );
      });
    }

    return f;
  }, [sales, clients, debouncedSearch, filterDate, filterMode]);

  const uniqueDates = useMemo(() => {
    const dates = [...new Set(sales.map((s) => s.date))];
    return dates.sort((a, b) => (a || '').localeCompare(b || ''));
  }, [sales]);

  const handlePrevDate = useCallback(() => {
    if (!filterDate) {
      if (uniqueDates.length > 0) setFilterDate(uniqueDates[uniqueDates.length - 1]);
      return;
    }
    const idx = uniqueDates.indexOf(filterDate);
    if (idx > 0) setFilterDate(uniqueDates[idx - 1]);
  }, [filterDate, uniqueDates]);

  const handleNextDate = useCallback(() => {
    if (!filterDate) {
      if (uniqueDates.length > 0) setFilterDate(uniqueDates[0]);
      return;
    }
    const idx = uniqueDates.indexOf(filterDate);
    if (idx !== -1 && idx < uniqueDates.length - 1) setFilterDate(uniqueDates[idx + 1]);
  }, [filterDate, uniqueDates]);

  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSales, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const groupedSales = useMemo(() => {
    const g = {};
    paginatedSales.forEach((s) => {
      const k = groupBy === 'date' ? s.date : 'todas';
      if (!g[k]) g[k] = [];
      g[k].push(s);
    });
    return Object.keys(g)
      .sort((a, b) => b.localeCompare(a))
      .map((k) => ({
        key: k,
        items: g[k],
        total: g[k].reduce((acc, s) => acc + (s.amountPaid || s.amount), 0),
      }));
  }, [paginatedSales, groupBy]);

  // Resetar página quando filtros mudam
  const prevFilterRef = useRef({ filterDate, debouncedSearch });
  useEffect(() => {
    const prev = prevFilterRef.current;
    if (prev.filterDate !== filterDate || prev.debouncedSearch !== debouncedSearch) {
      prevFilterRef.current = { filterDate, debouncedSearch };
      setCurrentPage(1);
    }
  }, [filterDate, debouncedSearch]);

  useEffect(() => {
    const handleBeforePrint = () => setItemsPerPage(10_000);
    const handleAfterPrint = () => setItemsPerPage(50);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  return useMemo(
    () => ({
      searchTerm,
      setSearchTerm: handleSetSearchTerm,
      filterDate,
      setFilterDate,
      filterMode,
      setFilterMode,
      groupBy,
      setGroupBy,
      currentPage,
      setCurrentPage,
      itemsPerPage,
      setItemsPerPage,
      filteredSales,
      uniqueDates,
      handlePrevDate,
      handleNextDate,
      paginatedSales,
      totalPages,
      groupedSales,
    }),
    [
      searchTerm, handleSetSearchTerm, filterDate, filterMode, groupBy,
      currentPage, itemsPerPage, filteredSales, uniqueDates,
      handlePrevDate, handleNextDate, paginatedSales, totalPages, groupedSales,
    ],
  );
}
