/**
 * Agrupa fontes de indicação semelhantes usando:
 * 1. Grupos forçados por aliases exatos
 * 2. Palavras-chave como fallback para variações não previstas
 * 3. Similaridade Jaccard para fontes restantes
 */

const normStr = (s) => s.trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const STOP = new Set(['de','do','da','dos','das','e','a','o','as','os','em','com','para','por','um','uma','no','na','nos','nas','ao','aos','que','se','via','pelo','pela','antiga','antigo','novo','nova']);

const extractKw = (s) => {
  const words = normStr(s).split(' ').filter(w => w.length > 2 && !STOP.has(w));
  return new Set(words.length ? words : [normStr(s)]);
};

const matchKeywords = (normalized, keywords) => {
  const words = normalized.split(' ');
  return keywords.find(kw => words.some(w => w === kw || w.startsWith(kw)));
};

// Grupos forçados por aliases exatos
const FORCED_GROUPS = [
  { aliases: ['pri almeida', 'pri almeida sabrina', 'pri almeida bianca', 'pri almeida e bianca', 'pri almeida/bianca', 'pri almeida / bianca', 'pri almeida /bianca', 'pri almeida /b'], canonical: 'Pri Almeida' },
  { aliases: ['bianca', 'bibi', 'bia'], canonical: 'Bianca' },
  { aliases: ['sabrina almeida', 'sabrina', 'sa'], canonical: 'Sabrina' },
];

// Palavras-chave catch-all para variações não previstas
const CANONICAL_KEYWORDS = [
  { canonical: 'Pri Almeida', keywords: ['pri', 'priscila', 'pris'] },
  { canonical: 'Bianca', keywords: ['bianca', 'bianka'] },
  { canonical: 'Sabrina', keywords: ['sabrina', 'sabri', 'brina'] },
];

/**
 * @param {Array} salesWithSource - vendas com clientSource preenchido
 * @param {Array} allFilteredSales - todas as vendas do período (para cálculo de receita total)
 * @returns {Object} { sources, totalReferrals, totalRevenue, allRevenue, topSource, maxCount, maxRev, referralRate, mergedGroups, srcToCanonical }
 */
export function analyzeReferrals(salesWithSource, allFilteredSales) {
  const uniqueSrcs = [...new Set(salesWithSource.map(s => s.clientSource.trim()))];
  const kwMap = {};
  uniqueSrcs.forEach(s => { kwMap[s] = extractKw(s); });

  // Union-Find
  const parent = {};
  uniqueSrcs.forEach(s => { parent[s] = s; });
  const find = (x) => { if (parent[x] !== x) parent[x] = find(parent[x]); return parent[x]; };
  const unite = (x, y) => { parent[find(x)] = find(y); };

  const forcedMember = new Set();
  const canonicalOverrides = {};

  // 1) Aliases exatos
  FORCED_GROUPS.forEach(({ aliases, canonical }) => {
    const matching = uniqueSrcs.filter(s => aliases.includes(normStr(s)));
    matching.forEach(s => {
      forcedMember.add(s);
      canonicalOverrides[s] = canonical;
    });
    for (let i = 1; i < matching.length; i++) unite(matching[0], matching[i]);
  });

  // 2) Keyword matching
  CANONICAL_KEYWORDS.forEach(({ canonical, keywords }) => {
    uniqueSrcs.forEach(s => {
      if (forcedMember.has(s)) return;
      const normalized = normStr(s);
      if (matchKeywords(normalized, keywords)) {
        forcedMember.add(s);
        canonicalOverrides[s] = canonical;
      }
    });
  });

  // Unir membros do mesmo canonical
  const canonicalMembers = {};
  Object.entries(canonicalOverrides).forEach(([s, canon]) => {
    if (!canonicalMembers[canon]) canonicalMembers[canon] = [];
    canonicalMembers[canon].push(s);
  });
  Object.values(canonicalMembers).forEach(members => {
    for (let i = 1; i < members.length; i++) unite(members[0], members[i]);
  });

  // 3) Jaccard similarity para fontes não forçadas
  for (let i = 0; i < uniqueSrcs.length; i++) {
    for (let j = i + 1; j < uniqueSrcs.length; j++) {
      const a = uniqueSrcs[i], b = uniqueSrcs[j];
      if (forcedMember.has(a) || forcedMember.has(b)) continue;
      const ka = kwMap[a], kb = kwMap[b];
      const inter = [...ka].filter(k => kb.has(k)).length;
      const unionSz = new Set([...ka, ...kb]).size;
      const jaccard = inter / unionSz;
      const isSubset = [...ka].every(k => kb.has(k)) || [...kb].every(k => ka.has(k));
      if (jaccard >= 0.4 || (inter >= 1 && isSubset)) unite(a, b);
    }
  }

  // Construir clusters
  const clusters = {};
  uniqueSrcs.forEach(s => {
    const root = find(s);
    if (!clusters[root]) clusters[root] = [];
    clusters[root].push(s);
  });

  // Mapear para canonical
  const srcToCanonical = {};
  Object.values(clusters).forEach(group => {
    const freq = {};
    group.forEach(s => { freq[s] = salesWithSource.filter(x => x.clientSource.trim() === s).length; });
    const canonical = canonicalOverrides[group[0]] || [...group].sort((a, b) => freq[b] - freq[a])[0];
    group.forEach(s => { srcToCanonical[s] = canonical; });
  });

  // Agregar por fonte canônica
  const sourceMap = {};
  salesWithSource.forEach(s => {
    const raw = s.clientSource.trim();
    const canon = srcToCanonical[raw] || raw;
    if (!sourceMap[canon]) sourceMap[canon] = { count: 0, revenue: 0, sales: [], aliases: new Set() };
    sourceMap[canon].count++;
    sourceMap[canon].revenue += (s.amountPaid || s.amount || 0);
    sourceMap[canon].sales.push({ ...s, _rawSource: raw });
    if (raw.toLowerCase() !== canon.toLowerCase()) sourceMap[canon].aliases.add(raw);
  });

  const totalReferrals = salesWithSource.length;
  const totalRevenue = salesWithSource.reduce((a, s) => a + (s.amountPaid || s.amount || 0), 0);
  const allRevenue = allFilteredSales.reduce((a, s) => a + (s.amountPaid || s.amount || 0), 0);
  const sources = Object.entries(sourceMap).sort((a, b) => b[1].count - a[1].count);
  const topSource = sources[0] ? sources[0][0] : '—';
  const maxCount = sources[0] ? sources[0][1].count : 1;
  const maxRev = Math.max(...sources.map(([,d]) => d.revenue), 1);
  const referralRate = allRevenue > 0 ? (totalRevenue / allRevenue * 100).toFixed(1) : '0.0';
  const mergedGroups = sources.filter(([,d]) => d.aliases.size > 0).length;

  return { sources, totalReferrals, totalRevenue, allRevenue, topSource, maxCount, maxRev, referralRate, mergedGroups, srcToCanonical };
}
