import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../Icons.jsx', () => ({
  default: {
    Search: ({ className }) => <svg data-testid="search-icon" className={className} />,
    ChevronLeft: ({ className }) => <svg data-testid="chevron-left" className={className} />,
    ChevronRight: ({ className }) => <svg data-testid="chevron-right" className={className} />,
    Trash2: ({ className }) => <svg data-testid="trash-icon" className={className} />,
    Download: ({ className }) => <svg data-testid="download-icon" className={className} />,
    Receipt: ({ className }) => <svg data-testid="receipt-icon" className={className} />,
    Edit: ({ className }) => <svg data-testid="edit-icon" className={className} />,
    FileText: ({ className }) => <svg data-testid="file-icon" className={className} />,
    WhatsApp: ({ className }) => <svg data-testid="whatsapp-icon" className={className} />,
  },
}));

vi.mock('../DateInput.jsx', () => ({
  default: ({ value, onChange, className, placeholder }) => (
    <input data-testid="date-input" value={value} onChange={onChange} className={className} placeholder={placeholder} />
  ),
}));

const SalesList = (await import('../views/SalesList.jsx')).default;

const defaultProps = {
  filteredSales: [],
  groupedSales: [],
  groupBy: 'date',
  settings: { currency: 'R$' },
  filterDate: '',
  searchTerm: '',
  filterMode: 'daily',
  setFilterMode: vi.fn(),
  setFilterDate: vi.fn(),
  setSearchTerm: vi.fn(),
  handlePrevDate: vi.fn(),
  handleNextDate: vi.fn(),
  currentPage: 1,
  setCurrentPage: vi.fn(),
  totalPages: 1,
  openReceipt: vi.fn(),
  _startEdit: vi.fn(),
  _pendingEditItem: null,
  setPendingEditItem: vi.fn(),
  setPendingAuthAction: vi.fn(),
  setManagerAuthModalOpen: vi.fn(),
  formatCurrency: (v) => v.toFixed(2).replace('.', ','),
  formatDateBR: (d) => d ? d.split('-').reverse().join('/') : '',
  printSalesList: vi.fn(),
  getPaymentStyles: () => ({ wrapper: '', amount: '' }),
  openClientDetails: vi.fn(),
};

describe('SalesList', () => {
  it('shows empty state when no sales', () => {
    render(<SalesList {...defaultProps} />);
    expect(screen.getByText('Nenhum registro encontrado')).toBeTruthy();
  });

  it('shows sales grouped by date', () => {
    const groupedSales = [
      {
        key: '2025-03-01',
        total: 1500,
        items: [
          {
            id: 's1',
            clientName: 'João Silva',
            clientCpf: '123.456.789-00',
            employeeName: 'Gabriela Ferreira',
            amount: 1500,
            amountPaid: 1500,
            items: [{ type: 'SAMSUNG', description: 'Galaxy A54', quantity: 1, unitPrice: 1500, discount: 0, ram_storage: '128GB', color: 'Preto', financed: 'Não' }],
            payments: [{ method: 'Pix', type: 'Integral', amount: 1500 }],
            clientSource: 'Instagram',
          },
        ],
      },
    ];
    render(<SalesList {...defaultProps} groupedSales={groupedSales} filteredSales={groupedSales[0].items} />);
    expect(screen.getByText('João Silva')).toBeTruthy();
    expect(screen.getByText('SAMSUNG • Galaxy A54')).toBeTruthy();
  });

  it('shows filter mode buttons', () => {
    render(<SalesList {...defaultProps} />);
    expect(screen.getByText('DIÁRIO')).toBeTruthy();
    expect(screen.getByText('MENSAL')).toBeTruthy();
    expect(screen.getByText('ANUAL')).toBeTruthy();
  });

  it('calls setFilterMode when clicking monthly button', () => {
    render(<SalesList {...defaultProps} />);
    screen.getByText('MENSAL').click();
    expect(defaultProps.setFilterMode).toHaveBeenCalledWith('monthly');
  });

  it('shows clear filters button when searchTerm is set', () => {
    render(<SalesList {...defaultProps} searchTerm="João" />);
    expect(screen.getByTitle('Limpar Filtros')).toBeTruthy();
  });

  it('shows pagination when there are multiple pages', () => {
    const groupedSales = [{ key: '2025-03-01', total: 500, items: [{ id: 's1', clientName: 'João', clientCpf: '', employeeName: 'João', amount: 500, amountPaid: 500, items: [], payments: [] }] }];
    render(<SalesList {...defaultProps} totalPages={5} currentPage={2} groupedSales={groupedSales} filteredSales={groupedSales[0].items} />);
    expect(screen.getByText('Página 2 de 5')).toBeTruthy();
  });

  it('disables previous button on first page', () => {
    const groupedSales = [{ key: '2025-03-01', total: 500, items: [{ id: 's1', clientName: 'João', clientCpf: '', employeeName: 'João', amount: 500, amountPaid: 500, items: [], payments: [] }] }];
    render(<SalesList {...defaultProps} totalPages={3} currentPage={1} groupedSales={groupedSales} filteredSales={groupedSales[0].items} />);
    const prevBtn = screen.getByText('Anterior');
    expect(prevBtn).toBeDisabled();
  });

  it('disables next button on last page', () => {
    const groupedSales = [{ key: '2025-03-01', total: 500, items: [{ id: 's1', clientName: 'João', clientCpf: '', employeeName: 'João', amount: 500, amountPaid: 500, items: [], payments: [] }] }];
    render(<SalesList {...defaultProps} totalPages={3} currentPage={3} groupedSales={groupedSales} filteredSales={groupedSales[0].items} />);
    const nextBtn = screen.getByText('Próxima');
    expect(nextBtn).toBeDisabled();
  });
});
