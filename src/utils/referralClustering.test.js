import { describe, it, expect } from 'vitest';
import { analyzeReferrals } from './referralClustering.js';

describe('analyzeReferrals', () => {
  const makeSale = (source, amount = 100, date = '2026-04-01') => ({
    id: `sale-${Math.random()}`,
    date,
    clientSource: source,
    amountPaid: amount,
    amount,
    clientName: 'Test',
    employeeName: 'Test',
    items: [],
  });

  it('returns empty results when no sales with source', () => {
    const result = analyzeReferrals([], []);
    expect(result.sources).toEqual([]);
    expect(result.totalReferrals).toBe(0);
    expect(result.totalRevenue).toBe(0);
    expect(result.mergedGroups).toBe(0);
  });

  it('groups exact alias "pri almeida" to canonical', () => {
    const sales = [makeSale('Pri Almeida'), makeSale('pri almeida')];
    const result = analyzeReferrals(sales, sales);
    expect(result.sources.length).toBe(1);
    expect(result.sources[0][0]).toBe('Pri Almeida');
    expect(result.sources[0][1].count).toBe(2);
  });

  it('groups "Pri" keyword to Pri Almeida', () => {
    const sales = [makeSale('Pri'), makeSale('pri')];
    const result = analyzeReferrals(sales, sales);
    expect(result.sources.length).toBe(1);
    expect(result.sources[0][0]).toBe('Pri Almeida');
  });

  it('groups "Priscila" keyword to Pri Almeida', () => {
    const sales = [makeSale('Priscila')];
    const result = analyzeReferrals(sales, sales);
    expect(result.sources.length).toBe(1);
    expect(result.sources[0][0]).toBe('Pri Almeida');
  });

  it('groups "Andressa/Pri" via keyword match', () => {
    const sales = [makeSale('Andressa/Pri')];
    const result = analyzeReferrals(sales, sales);
    expect(result.sources.length).toBe(1);
    expect(result.sources[0][0]).toBe('Pri Almeida');
  });

  it('groups "Bianca" aliases', () => {
    const sales = [makeSale('Bianca'), makeSale('bibi'), makeSale('bia')];
    const result = analyzeReferrals(sales, sales);
    expect(result.sources.length).toBe(1);
    expect(result.sources[0][0]).toBe('Bianca');
  });

  it('groups "Sabrina" aliases', () => {
    const sales = [makeSale('Sabrina'), makeSale('sabrina almeida')];
    const result = analyzeReferrals(sales, sales);
    expect(result.sources.length).toBe(1);
    expect(result.sources[0][0]).toBe('Sabrina');
  });

  it('keeps distinct sources separate', () => {
    const sales = [makeSale('Instagram'), makeSale('Facebook')];
    const result = analyzeReferrals(sales, sales);
    expect(result.sources.length).toBe(2);
  });

  it('tracks aliases correctly', () => {
    const sales = [makeSale('Pri Almeida'), makeSale('Pri')];
    const result = analyzeReferrals(sales, sales);
    const aliases = result.sources[0][1].aliases;
    expect(aliases.size).toBe(1);
    expect([...aliases]).toContain('Pri');
  });

  it('calculates revenue correctly', () => {
    const sales = [makeSale('Pri', 200), makeSale('Pri', 300)];
    const result = analyzeReferrals(sales, sales);
    expect(result.sources[0][1].revenue).toBe(500);
  });

  it('calculates referral rate against all sales', () => {
    const referralSales = [makeSale('Pri', 100)];
    const allSales = [makeSale('Pri', 100), makeSale(null, 400)];
    const result = analyzeReferrals(referralSales, allSales);
    expect(result.referralRate).toBe('20.0');
  });

  it('handles mixed forced and Jaccard grouping', () => {
    const sales = [
      makeSale('Pri Almeida'),
      makeSale('Instagram'),
      makeSale('instagram'),
    ];
    const result = analyzeReferrals(sales, sales);
    // Pri Almeida is forced, Instagram variants are Jaccard-matched
    expect(result.sources.length).toBe(2);
  });
});
