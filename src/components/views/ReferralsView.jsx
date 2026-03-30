import Icons from '../Icons.jsx';

const ReferralsView = ({ sales, formatCurrency, formatDateBR }) => {
    const colorPalette = [
        { from: 'from-amber-600', to: 'to-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/20' },
        { from: 'from-emerald-600', to: 'to-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/20' },
        { from: 'from-blue-600', to: 'to-blue-400', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'shadow-blue-500/20' },
        { from: 'from-violet-600', to: 'to-violet-400', text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', glow: 'shadow-violet-500/20' },
        { from: 'from-rose-600', to: 'to-rose-400', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-rose-500/20' },
        { from: 'from-cyan-600', to: 'to-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', glow: 'shadow-cyan-500/20' },
        { from: 'from-orange-600', to: 'to-orange-400', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'shadow-orange-500/20' },
        { from: 'from-teal-600', to: 'to-teal-400', text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', glow: 'shadow-teal-500/20' },
        { from: 'from-pink-600', to: 'to-pink-400', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', glow: 'shadow-pink-500/20' },
        { from: 'from-lime-600', to: 'to-lime-400', text: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/20', glow: 'shadow-lime-500/20' },
    ];
    
    const getColor = (index) => colorPalette[index % colorPalette.length];

    return (
        <div className="space-y-8">
            <div className="classic-frame rounded-[3rem] shadow-vision border border-white/60 p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                    <h2 className="text-3xl font-bold text-slate-200 flex items-center gap-4 font-display">
                        <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-2xl text-amber-400 shadow-lg shadow-amber-500/20 border border-amber-500/30">
                            <Icons.UserPlus className="w-8 h-8" />
                        </div>
                        Análise de Indicações
                    </h2>
                </div>
                {(() => {
                    const normStr = (s) => s.trim().toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

                    const STOP = new Set(['de','do','da','dos','das','e','a','o','as','os','em','com','para','por','um','uma','no','na','nos','nas','ao','aos','que','se','via','pelo','pela','antiga','antigo','novo','nova']);

                    const extractKw = (s) => {
                        const words = normStr(s).split(' ').filter(w => w.length > 2 && !STOP.has(w));
                        return new Set(words.length ? words : [normStr(s)]);
                    };

                    const salesWithSource = sales.filter(s => s.clientSource && s.clientSource.trim());
                    const uniqueSrcs = [...new Set(salesWithSource.map(s => s.clientSource.trim()))];
                    const kwMap = {};
                    uniqueSrcs.forEach(s => { kwMap[s] = extractKw(s); });

                    const FORCED_GROUPS = [
                        { aliases: ['pri almeida', 'pri almeida sabrina', 'pri', 'pri almeida bianca', 'pri almeida e bianca', 'pri almeida/bianca', 'pri almeida / bianca', 'pri almeida /bianca', 'pri almeida /b'], canonical: 'Pri Almeida' },
                        { aliases: ['bianca', 'bibi', 'bia'], canonical: 'Bianca' },
                        { aliases: ['sabrina almeida', 'sabrina', 'sa'], canonical: 'Sabrina' },
                    ];

                    const parent = {};
                    uniqueSrcs.forEach(s => { parent[s] = s; });
                    const find = (x) => { if (parent[x] !== x) parent[x] = find(parent[x]); return parent[x]; };
                    const unite = (x, y) => { parent[find(x)] = find(y); };

                    const forcedMember = new Set();
                    const canonicalOverrides = {};
                    FORCED_GROUPS.forEach(({ aliases, canonical }) => {
                        const matching = uniqueSrcs.filter(s => aliases.includes(normStr(s)));
                        matching.forEach(s => {
                            forcedMember.add(s);
                            canonicalOverrides[s] = canonical;
                        });
                        for (let i = 1; i < matching.length; i++) unite(matching[0], matching[i]);
                    });

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

                    const clusters = {};
                    uniqueSrcs.forEach(s => {
                        const root = find(s);
                        if (!clusters[root]) clusters[root] = [];
                        clusters[root].push(s);
                    });
                    const srcToCanonical = {};
                    Object.values(clusters).forEach(group => {
                        const freq = {};
                        group.forEach(s => { freq[s] = salesWithSource.filter(x => x.clientSource.trim() === s).length; });
                        const canonical = canonicalOverrides[group[0]] || [...group].sort((a, b) => freq[b] - freq[a])[0];
                        group.forEach(s => { srcToCanonical[s] = canonical; });
                    });

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
                    const allRevenue = sales.reduce((a, s) => a + (s.amountPaid || s.amount || 0), 0);
                    const sources = Object.entries(sourceMap).sort((a, b) => b[1].count - a[1].count);
                    const topSource = sources[0] ? sources[0][0] : '—';
                    const maxCount = sources[0] ? sources[0][1].count : 1;
                    const maxRev = Math.max(...sources.map(([,d]) => d.revenue), 1);
                    const referralRate = allRevenue > 0 ? (totalRevenue / allRevenue * 100).toFixed(1) : '0.0';
                    const mergedGroups = sources.filter(([,d]) => d.aliases.size > 0).length;

                    const kpis = [
                        { label: 'Total Indicações', val: totalReferrals, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Icons.Users, glow: 'shadow-amber-500/20' },
                        { label: 'Grupos Únicos', val: sources.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Icons.Layers, glow: 'shadow-blue-500/20' },
                        { label: 'Principal Fonte', val: topSource, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Icons.Star, glow: 'shadow-emerald-500/20' },
                        { label: 'Fat. Indicações', val: `R$ ${formatCurrency(totalRevenue)}`, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', icon: Icons.DollarSign, glow: 'shadow-violet-500/20' },
                        { label: '% do Fat. Total', val: `${referralRate}%`, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: Icons.Percent, glow: 'shadow-rose-500/20' },
                    ];
                    return (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                                {kpis.map((k, idx) => (
                                    <div key={k.label} className={`p-5 rounded-[2rem] border ${k.bg} hover:-translate-y-2 hover:shadow-xl ${k.glow} transition-all duration-300 group`} style={{  }}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`p-2 rounded-xl ${k.bg}`}>
                                                <k.icon className={`w-4 h-4 ${k.color}`} />
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{k.label}</p>
                                        </div>
                                        <p className={`text-lg font-black ${k.color} leading-tight break-all group-hover:scale-105 transition-transform`}>{k.val}</p>
                                    </div>
                                ))}
                            </div>
                            {mergedGroups > 0 && (
                                <div className="mb-8 flex items-center gap-3 px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs font-bold text-amber-400 hover:shadow-lg hover:shadow-amber-500/20 transition-all cursor-default">
                                    <span className="text-lg">🔗</span>
                                    {mergedGroups} grupo{mergedGroups !== 1 ? 's mesclados' : ' mesclado'} automaticamente por palavras-chave semelhantes
                                </div>
                            )}
                            {sources.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                        <div className="p-8 bg-gradient-to-br from-white/10 to-white/5 rounded-[2rem] border border-white/10 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 backdrop-blur-md">
                                            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <div className="p-1.5 bg-amber-500/20 rounded-lg"><Icons.BarChart className="w-3 h-3" /></div>
                                                Indicações por Quantidade
                                            </h3>
                                            <div className="space-y-5">
                                                {sources.slice(0, 10).map(([src, data], idx) => {
                                                    const colors = getColor(idx);
                                                    return (
                                                        <div key={src} className="group" style={{  }}>
                                                            <div className="flex justify-between items-center mb-1">
                                                                <div>
                                                                    <span className={`text-sm font-bold ${colors.text} group-hover:text-white transition-colors`}>{src}</span>
                                                                    {data.aliases.size > 0 && <span className="ml-2 text-[10px] text-amber-400 font-bold">+{data.aliases.size} variaç{data.aliases.size !== 1 ? 'ões' : 'ão'}</span>}
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-400">{data.count} venda{data.count !== 1 ? 's' : ''}</span>
                                                            </div>
                                                            {data.aliases.size > 0 && <p className="text-[10px] text-slate-500 mb-1 italic">{[...data.aliases].join(' • ')}</p>}
                                                            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden shadow-inner">
                                                                <div className={`h-full rounded-full bg-gradient-to-r ${colors.from} ${colors.to} transition-all duration-1000 shadow-md group-hover:shadow-lg ${colors.glow}`} style={{ width: `${(data.count / maxCount) * 100}%` }}>
                                                                    <div className="h-full w-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shimmer"></div>
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] text-slate-500 mt-1 text-right">Ticket médio: R$ {formatCurrency(data.revenue / data.count)}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="p-8 bg-gradient-to-br from-white/10 to-white/5 rounded-[2rem] border border-white/10 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 backdrop-blur-md">
                                            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <div className="p-1.5 bg-emerald-500/20 rounded-lg"><Icons.DollarSign className="w-3 h-3" /></div>
                                                Faturamento por Fonte
                                            </h3>
                                            <div className="space-y-5">
                                                {[...sources].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 10).map(([src, data], idx) => (
                                                    <div key={src} className="group" style={{  }}>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{src}</span>
                                                            <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">R$ {formatCurrency(data.revenue)}</span>
                                                        </div>
                                                        <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden shadow-inner">
                                                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400 transition-all duration-1000 shadow-md group-hover:shadow-lg shadow-emerald-500/20" style={{ width: `${(data.revenue / maxRev) * 100}%` }}>
                                                                <div className="h-full w-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shimmer"></div>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 mt-1 text-right">{data.count} venda{data.count !== 1 ? 's' : ''}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#fdfaf4] rounded-[2.5rem] border border-amber-500/20 overflow-hidden shadow-lg shadow-amber-500/10">
                                        <div className="p-6 border-b border-amber-500/20 flex items-center gap-3 bg-gradient-to-r from-amber-500/5 to-transparent">
                                            <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-lg shadow-amber-500/30">
                                                <Icons.UserPlus className="w-5 h-5 text-amber-950" />
                                            </div>
                                            <h3 className="font-bold text-amber-900 text-lg">Detalhamento das Indicações</h3>
                                            <span className="ml-auto text-xs font-bold text-amber-900/40 uppercase tracking-wider">{salesWithSource.length} registro{salesWithSource.length !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-amber-500/5 text-amber-900 text-[10px] font-bold uppercase tracking-widest border-b border-amber-500/20">
                                                    <tr>
                                                        <th className="p-4 pl-6 text-left">Data</th>
                                                        <th className="p-4 text-left">Cliente</th>
                                                        <th className="p-4 text-left">Vendedor</th>
                                                        <th className="p-4 text-left">Grupo / Original</th>
                                                        <th className="p-4 text-left">Produto Principal</th>
                                                        <th className="p-4 text-right pr-6">Valor</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-amber-500/10">
                                                    {[...salesWithSource].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map((s, idx) => {
                                                        const raw = s.clientSource.trim();
                                                        const canon = srcToCanonical[raw] || raw;
                                                        const isMerged = raw.toLowerCase() !== canon.toLowerCase();
                                                        return (
                                                            <tr key={s.id} className="hover:bg-amber-500/10 transition-all duration-300 group" style={{  }}>
                                                                <td className="p-4 pl-6 text-amber-900/50 font-mono text-xs whitespace-nowrap">{formatDateBR(s.date)}</td>
                                                                <td className="p-4 font-semibold text-amber-900 group-hover:text-amber-700 transition-colors">{s.clientName || '—'}</td>
                                                                <td className="p-4 text-amber-900/50 text-xs font-bold uppercase">{s.employeeName}</td>
                                                                <td className="p-4">
                                                                    {(() => {
                                                                        const presets = {
                                                                            'Pri Almeida': { from: 'from-purple-500/30', to: 'to-violet-500/20', text: 'text-purple-800', border: 'border-purple-500/40', shadow: 'shadow-purple-500/20' },
                                                                            'Bianca': { from: 'from-pink-500/30', to: 'to-rose-500/20', text: 'text-pink-800', border: 'border-pink-500/40', shadow: 'shadow-pink-500/20' },
                                                                            'Sabrina': { from: 'from-blue-500/30', to: 'to-cyan-500/20', text: 'text-blue-800', border: 'border-blue-500/40', shadow: 'shadow-blue-500/20' },
                                                                        };
                                                                        const colorSets = [
                                                                            { from: 'from-amber-500/30', to: 'to-yellow-500/20', text: 'text-amber-800', border: 'border-amber-500/40', shadow: 'shadow-amber-500/20' },
                                                                            { from: 'from-emerald-500/30', to: 'to-teal-500/20', text: 'text-emerald-800', border: 'border-emerald-500/40', shadow: 'shadow-emerald-500/20' },
                                                                            { from: 'from-cyan-500/30', to: 'to-sky-500/20', text: 'text-cyan-800', border: 'border-cyan-500/40', shadow: 'shadow-cyan-500/20' },
                                                                            { from: 'from-indigo-500/30', to: 'to-blue-500/20', text: 'text-indigo-800', border: 'border-indigo-500/40', shadow: 'shadow-indigo-500/20' },
                                                                            { from: 'from-rose-500/30', to: 'to-pink-500/20', text: 'text-rose-800', border: 'border-rose-500/40', shadow: 'shadow-rose-500/20' },
                                                                            { from: 'from-orange-500/30', to: 'to-amber-500/20', text: 'text-orange-800', border: 'border-orange-500/40', shadow: 'shadow-orange-500/20' },
                                                                            { from: 'from-teal-500/30', to: 'to-emerald-500/20', text: 'text-teal-800', border: 'border-teal-500/40', shadow: 'shadow-teal-500/20' },
                                                                            { from: 'from-violet-500/30', to: 'to-purple-500/20', text: 'text-violet-800', border: 'border-violet-500/40', shadow: 'shadow-violet-500/20' },
                                                                        ];
                                                                        const match = Object.keys(presets).find(k => canon.toLowerCase().includes(k.toLowerCase()));
                                                                        const hash = canon.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
                                                                        const colors = match ? presets[match] : colorSets[hash % colorSets.length];
                                                                        return (
                                                                            <span className={`bg-gradient-to-r ${colors.from} ${colors.to} ${colors.text} border ${colors.border} px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide shadow-sm ${colors.shadow}`}>{canon}</span>
                                                                        );
                                                                    })()}
                                                                    {isMerged && <p className="text-[10px] text-amber-900/40 mt-1 italic">digitado: "{raw}"</p>}
                                                                </td>
                                                                <td className="p-4 text-amber-900/60 text-xs">{(s.items || [])[0] ? `${s.items[0].type} ${s.items[0].description}` : '—'}</td>
                                                                <td className="p-4 text-right pr-6 font-mono font-bold text-amber-900 whitespace-nowrap group-hover:text-amber-700 transition-colors">R$ {formatCurrency(s.amountPaid || s.amount || 0)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-24 text-slate-500 flex flex-col items-center">
                                    <div className="p-8 bg-gradient-to-br from-white/10 to-white/5 rounded-full mb-8 shadow-inner ring-1 ring-white/5 border border-white/10 group-hover:shadow-xl transition-all">
                                        <Icons.UserPlus className="w-16 h-16 opacity-20 text-white group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="font-bold text-2xl text-slate-400 mb-2">Nenhuma indicação registrada</p>
                                    <p className="text-sm">Preencha o campo "Conheceu a loja?" ao registrar uma venda.</p>
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>
        </div>
    );
};

export default ReferralsView;
