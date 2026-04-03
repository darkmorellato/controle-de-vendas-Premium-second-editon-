import { describe, it, expect } from 'vitest';
import {
  validateCPF,
  hashPassword,
  verifyPassword,
  formatCurrency,
  parseCurrency,
  formatDateBR,
  maskCPF,
  maskPhone,
  maskCEP,
  maskIMEI,
  countUnits,
  resolveClientForSale,
  buildPrintHeader,
} from './utils.js';

// ─── validateCPF ─────────────────────────────────────────────────────────────

describe('validateCPF', () => {
  it('valida CPF correto com formatação', () => {
    expect(validateCPF('529.982.247-25')).toBe(true);
  });

  it('valida CPF correto sem formatação', () => {
    expect(validateCPF('52998224725')).toBe(true);
  });

  it('rejeita CPF com todos os dígitos iguais', () => {
    expect(validateCPF('111.111.111-11')).toBe(false);
    expect(validateCPF('000.000.000-00')).toBe(false);
  });

  it('rejeita CPF com dígito verificador errado', () => {
    expect(validateCPF('529.982.247-26')).toBe(false);
  });

  it('rejeita CPF com menos de 11 dígitos', () => {
    expect(validateCPF('123.456.789')).toBe(false);
  });
});

// ─── hashPassword / verifyPassword ───────────────────────────────────────────

describe('hashPassword / verifyPassword', () => {
  it('gera hash PBKDF2 com prefixo "pbkdf2:"', async () => {
    const hash = await hashPassword('miplace123');
    expect(hash).toMatch(/^pbkdf2:/);
  });

  it('verifica senha correta contra hash PBKDF2', async () => {
    const hash = await hashPassword('miplace123');
    expect(await verifyPassword('miplace123', hash)).toBe(true);
  });

  it('rejeita senha incorreta contra hash PBKDF2', async () => {
    const hash = await hashPassword('miplace123');
    expect(await verifyPassword('errada', hash)).toBe(false);
  });

  it('gera hashes diferentes para a mesma senha (salt aleatório)', async () => {
    const h1 = await hashPassword('senha');
    const h2 = await hashPassword('senha');
    expect(h1).not.toBe(h2);
  });

  it('verifica hash SHA-256 legado (formato sem prefixo)', async () => {
    // SHA-256 de 'test' — calculado externamente para validar retrocompatibilidade
    const legacyHash = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';
    expect(await verifyPassword('test', legacyHash)).toBe(true);
    expect(await verifyPassword('wrong', legacyHash)).toBe(false);
  });

  it('retorna false para hash vazio ou undefined', async () => {
    expect(await verifyPassword('senha', '')).toBe(false);
    expect(await verifyPassword('senha', undefined)).toBe(false);
  });
});

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formata inteiro', () => {
    expect(formatCurrency(1000)).toBe('1.000,00');
  });

  it('formata com decimais', () => {
    expect(formatCurrency(1234.56)).toBe('1.234,56');
  });

  it('arredonda corretamente meio centavo', () => {
    expect(formatCurrency(1.005)).toBe('1,01');
  });

  it('formata zero', () => {
    expect(formatCurrency(0)).toBe('0,00');
  });

  it('formata valor negativo (devolução)', () => {
    expect(formatCurrency(-500)).toBe('-500,00');
  });
});

// ─── parseCurrency ────────────────────────────────────────────────────────────

describe('parseCurrency', () => {
  it('converte string no formato brasileiro', () => {
    expect(parseCurrency('1.234,56')).toBe(1234.56);
  });

  it('converte string simples', () => {
    expect(parseCurrency('99,90')).toBe(99.9);
  });

  it('passa número direto', () => {
    expect(parseCurrency(42)).toBe(42);
    expect(parseCurrency(42.5)).toBe(42.5);
  });

  it('retorna 0 para string vazia', () => {
    expect(parseCurrency('')).toBe(0);
  });

  it('retorna 0 para tipo inválido', () => {
    expect(parseCurrency(null)).toBe(0);
    expect(parseCurrency(undefined)).toBe(0);
  });
});

// ─── formatDateBR ─────────────────────────────────────────────────────────────

describe('formatDateBR', () => {
  it('converte ISO para dd/mm/yyyy', () => {
    expect(formatDateBR('2025-03-27')).toBe('27/03/2025');
  });

  it('retorna string vazia para entrada vazia', () => {
    expect(formatDateBR('')).toBe('');
    expect(formatDateBR(null)).toBe('');
    expect(formatDateBR(undefined)).toBe('');
  });
});

// ─── Máscaras ─────────────────────────────────────────────────────────────────

describe('maskCPF', () => {
  it('aplica máscara correta', () => {
    expect(maskCPF('52998224725')).toBe('529.982.247-25');
  });

  it('limita a 14 caracteres com máscara', () => {
    expect(maskCPF('529982247251234')).toBe('529.982.247-25');
  });
});

describe('maskPhone', () => {
  it('aplica máscara celular', () => {
    expect(maskPhone('11999990000')).toBe('(11) 99999-0000');
  });

  it('formata número fixo sem hífen (máscara otimizada para celular)', () => {
    // maskPhone é projetada para celular (11 dígitos + DDD = 13 chars com máscara).
    // Para fixo com 10 dígitos, aplica DDD mas não insere hífen pela regex atual.
    expect(maskPhone('1132223333')).toBe('(11) 32223333');
  });
});

describe('maskCEP', () => {
  it('aplica máscara CEP', () => {
    expect(maskCEP('01001000')).toBe('01001-000');
  });
});

describe('maskIMEI', () => {
  it('limita a 15 dígitos numéricos', () => {
    expect(maskIMEI('123456789012345ABC')).toBe('123456789012345');
  });
});

// ─── countUnits ───────────────────────────────────────────────────────────────

const ELIGIBLE = ['SAMSUNG', 'IPHONE', 'MOTOROLA'];

describe('countUnits', () => {
  it('conta unidades elegíveis com preço positivo', () => {
    const sales = [{ items: [{ type: 'SAMSUNG', quantity: 2, unitPrice: 1000 }] }];
    expect(countUnits(sales, ELIGIBLE)).toBe(2);
  });

  it('subtrai devoluções (preço negativo)', () => {
    const sales = [{
      items: [
        { type: 'SAMSUNG', quantity: 2, unitPrice: 1000 },
        { type: 'SAMSUNG', quantity: 1, unitPrice: -1000 },
      ],
    }];
    expect(countUnits(sales, ELIGIBLE)).toBe(1);
  });

  it('ignora tipos não elegíveis', () => {
    const sales = [{ items: [{ type: 'CABOS', quantity: 5, unitPrice: 20 }] }];
    expect(countUnits(sales, ELIGIBLE)).toBe(0);
  });

  it('soma múltiplas vendas', () => {
    const sales = [
      { items: [{ type: 'SAMSUNG', quantity: 3, unitPrice: 1000 }] },
      { items: [{ type: 'IPHONE', quantity: 2, unitPrice: 3000 }] },
    ];
    expect(countUnits(sales, ELIGIBLE)).toBe(5);
  });

  it('retorna 0 para array vazio', () => {
    expect(countUnits([], ELIGIBLE)).toBe(0);
  });

  it('lida com venda sem items', () => {
    expect(countUnits([{ items: [] }], ELIGIBLE)).toBe(0);
    expect(countUnits([{}], ELIGIBLE)).toBe(0);
  });
});

// ─── resolveClientForSale ────────────────────────────────────────────────────

describe('resolveClientForSale', () => {
  const clients = [
    { id: 'c1', name: 'João Silva', cpf: '529.982.247-25', phone: '(11) 99999-0000' },
  ];

  it('resolve pelo clientId (modelo novo)', () => {
    const sale = { clientId: 'c1', clientName: 'Legado' };
    const result = resolveClientForSale(sale, clients);
    expect(result.name).toBe('João Silva');
  });

  it('cai para campos legados quando clientId não encontrado', () => {
    const sale = { clientId: 'inexistente', clientName: 'Legado', clientCpf: '000' };
    const result = resolveClientForSale(sale, clients);
    expect(result.name).toBe('Legado');
    expect(result.cpf).toBe('000');
  });

  it('usa campos legados quando sem clientId', () => {
    const sale = { clientName: 'Maria', clientPhone: '(11) 91111-2222' };
    const result = resolveClientForSale(sale, clients);
    expect(result.name).toBe('Maria');
    expect(result.phone).toBe('(11) 91111-2222');
  });
});

// ─── buildPrintHeader ─────────────────────────────────────────────────────────

describe('buildPrintHeader', () => {
  it('retorna string HTML com o total formatado', () => {
    const html = buildPrintHeader(1500, formatCurrency);
    expect(html).toContain('1.500,00');
    expect(html).toContain('TOTAL LISTADO');
  });

  it('é uma função pura — sem efeitos colaterais no DOM', () => {
    const before = document.body.innerHTML;
    buildPrintHeader(100, formatCurrency);
    expect(document.body.innerHTML).toBe(before);
  });
});
