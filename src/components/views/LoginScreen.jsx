import { useState, useEffect, useMemo } from 'react';
import Icons from '../Icons.jsx';

export default function LoginScreen({
    toasts,
    setToasts,
    SELLERS_LIST,
    ADM_NAME,
    handleLoginClick,
    loginModalOpen,
    selectedUserForLogin,
    loginPasswordInput,
    setLoginPasswordInput,
    performLogin,
    sessionPromptOpen,
    setSessionPromptOpen,
    setSettings,
    setIsAdm,
    setIsLoggedIn,
    showToast,
    setLoginModalOpen
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const particles = useMemo(() => {
        return [...Array(8)].map((_, i) => ({
            id: i,
            size: Math.random() * 8 + 4,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 3,
            duration: Math.random() * 4 + 4
        }));
    }, []);

    const handlePerformLogin = async () => {
        setIsLoading(true);
        try {
            await performLogin();
        } catch (error) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (loginPasswordInput) {
            setShake(false);
        }
    }, [loginPasswordInput]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f0e8 0%, #e8e0d0 50%, #f0e8d8 100%)' }}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(201,162,39,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(201,162,39,0.08) 0%, transparent 50%)' }}></div>
            
            {/* Floating particles */}
            {particles.map(p => (
                <div 
                    key={p.id}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        background: 'rgba(201,162,39,0.3)',
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`
                    }}
                />
            ))}

            <ToastContainer toasts={toasts} removeToast={id => setToasts(p => p.filter(t => t.id !== id))} />
            <div className={`rounded-[3rem] w-full max-w-md overflow-hidden relative ${shake ? 'animate-shake' : ''}`} style={{ background: '#fdfaf4', border: '2px solid rgba(201,162,39,0.55)', boxShadow: '0 8px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(201,162,39,0.12), inset 0 1px 0 rgba(255,255,255,0.8)' }}>

                {/* ── HEADER NEGRO GRADIENTE ── */}
                <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a1a1a 0%, #0a0a0a 40%, #111 60%, #222 100%)', padding: '2.8rem 2rem 2.2rem' }}>
                    {/* Brilho animado */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 blur-3xl pointer-events-none animate-pulse-slow" style={{ background: 'radial-gradient(ellipse, rgba(201,162,39,0.18) 0%, transparent 70%)' }}></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 blur-2xl pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(201,162,39,0.08) 0%, transparent 70%)' }}></div>
                    <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.6), transparent)' }}></div>

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Logo com animação de hover e pulsação */}
                        <div className="mb-5 group cursor-default animate-float"
                            style={{ transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), filter 0.4s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.transform='scale(1.10) translateY(-4px)'; e.currentTarget.style.filter='drop-shadow(0 8px 24px rgba(201,162,39,0.55))'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform='scale(1) translateY(0)'; e.currentTarget.style.filter='drop-shadow(0 2px 8px rgba(201,162,39,0.2))'; }}>
                            <div className="relative">
                                {/* Anel pulsante */}
                                <div className="absolute inset-0 rounded-full opacity-20" style={{ background: '#c9a227', animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                                <div style={{ width:'88px', height:'88px', borderRadius:'50%', overflow:'hidden', border:'2.5px solid rgba(201,162,39,0.55)', boxShadow:'0 0 0 4px rgba(201,162,39,0.12), 0 4px 20px rgba(201,162,39,0.25), inset 0 0 20px rgba(201,162,39,0.1)', background:'#111' }}>
                                    <img src="/logo.png" alt="Miplace Logo"
                                        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                                        onError={e => {
                                            const img = e.target; const parent = img.parentElement;
                                            img.style.display = 'none';
                                            Object.assign(parent.style, { display:'flex', alignItems:'center', justifyContent:'center' });
                                            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                            svg.setAttribute('width','40'); svg.setAttribute('height','40');
                                            svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','none');
                                            svg.setAttribute('stroke','#c9a227'); svg.setAttribute('stroke-width','2');
                                            svg.setAttribute('stroke-linecap','round'); svg.setAttribute('stroke-linejoin','round');
                                            const path = document.createElementNS('http://www.w3.org/2000/svg','path');
                                            path.setAttribute('d','M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z');
                                            const poly = document.createElementNS('http://www.w3.org/2000/svg','polyline');
                                            poly.setAttribute('points','9 22 9 12 15 12 15 22');
                                            svg.appendChild(path); svg.appendChild(poly); parent.appendChild(svg);
                                        }} />
                                </div>
                            </div>
                        </div>

                        {/* Título com gradiente animado */}
                        <h1 className="font-display font-bold tracking-tight mb-1 animate-gradient-x" style={{ fontSize:'2rem', background:'linear-gradient(110deg, #886918 0%, #c9a227 20%, #f5e4ab 45%, #fff8e7 50%, #f5e4ab 60%, #c9a227 80%, #886918 100%)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Miplace</h1>
                        
                        {/* Premium com animação de brilho */}
                        <p className="font-bold uppercase tracking-[0.35em] text-xs relative" style={{ color:'rgba(201,162,39,0.65)' }}>
                            <span className="absolute -inset-2 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent animate-shimmer rounded-full"></span>
                            Premium
                        </p>
                    </div>
                </div>

                {/* ── LISTA DE USUÁRIOS ── */}
                <div className="p-10 space-y-4">
                    <p className="text-center text-sm font-medium mb-4 animate-fade-in-up" style={{ color:'#6b6560', animationDelay: '0.1s' }}>Selecione seu perfil para entrar</p>

                    {SELLERS_LIST.map((n, index) => (
                        <button key={n} onClick={() => handleLoginClick(n)}
                            className="w-full py-5 px-6 rounded-[2rem] flex items-center justify-between active-scale relative overflow-hidden group animate-fade-in-up"
                            style={{ background:'rgba(15,15,15,0.04)', border:'1.5px solid rgba(15,15,15,0.14)', transition:'border-color 0.3s, box-shadow 0.3s', animationDelay: `${0.2 + index * 0.1}s` }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,162,39,0.5)'; e.currentTarget.style.boxShadow='0 4px 24px rgba(201,162,39,0.12)'; e.currentTarget.style.transform='translateX(4px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(15,15,15,0.14)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateX(0)'; }}>
                            {/* Efeito de brilho deslizante */}
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none" style={{ background:'linear-gradient(105deg, transparent 30%, rgba(201,162,39,0.13) 50%, transparent 70%)', backgroundSize:'200% 100%', transition:'opacity 0.3s', animation: 'loginSweep 0.6s ease forwards' }}></span>
                            {/* Ícone de usuário com animação */}
                            <div className="p-2.5 rounded-full relative z-10 group-hover:scale-110 transition-transform" style={{ background:'rgba(15,15,15,0.06)', transition:'background 0.3s' }}>
                                <Icons.User className="w-5 h-5" style={{ color:'#6b6560', transition: 'color 0.3s' }} />
                            </div>
                            <span className="font-bold relative z-10 group-hover:text-amber-700" style={{ color:'#1c1c1c', transition: 'color 0.3s' }}>{n}</span>
                            <div className="p-2.5 rounded-full relative z-10 group-hover:scale-110 transition-all duration-300" style={{ background:'rgba(15,15,15,0.06)', transition:'background 0.3s' }}>
                                <Icons.ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color:'#6b6560' }} />
                            </div>
                        </button>
                    ))}

                    <div style={{ borderTop:'1px solid rgba(201,162,39,0.2)', paddingTop:'1.1rem', marginTop:'0.5rem' }}>
                        <button onClick={() => handleLoginClick(ADM_NAME)}
                            className="w-full py-5 px-6 rounded-[2rem] flex items-center justify-between active-scale relative overflow-hidden group animate-fade-in-up"
                            style={{ background:'rgba(201,162,39,0.05)', border:'1.5px solid rgba(201,162,39,0.32)', transition:'border-color 0.3s, box-shadow 0.3s', animationDelay: '0.4s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,162,39,0.7)'; e.currentTarget.style.boxShadow='0 4px 28px rgba(201,162,39,0.2)'; e.currentTarget.style.transform='translateX(4px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(201,162,39,0.32)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateX(0)'; }}>
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none" style={{ background:'linear-gradient(105deg, transparent 25%, rgba(201,162,39,0.18) 50%, transparent 75%)', transition:'opacity 0.3s' }}></span>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="p-1.5 rounded-lg animate-pulse-slow" style={{ background:'rgba(201,162,39,0.15)' }}>
                                    <Icons.Key className="w-4 h-4" style={{ color:'#c9a227' }} />
                                </div>
                                <div className="text-left">
                                    <span className="font-bold block leading-tight group-hover:text-amber-600 transition-colors" style={{ color:'#c9a227' }}>{ADM_NAME}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'rgba(201,162,39,0.55)' }}>Administrador</span>
                                </div>
                            </div>
                            <div className="p-2.5 rounded-full relative z-10 group-hover:scale-110 transition-all duration-300" style={{ background:'rgba(201,162,39,0.12)' }}>
                                <Icons.ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color:'#c9a227' }} />
                            </div>
                        </button>
                    </div>
                </div>

                {sessionPromptOpen && (
                    <div className="absolute inset-0 rounded-[3rem] z-[25] flex flex-col items-center justify-center p-8" style={{ background: '#fdfaf4', borderTop: '1px solid rgba(201,162,39,0.35)' }}>
                        {/* Glow effect behind icon */}
                        <div className="absolute w-24 h-24 rounded-full animate-pulse-slow pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.2) 0%, transparent 70%)' }}></div>
                        
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg,#c9a227,#e4ba4a)', border: '2px solid rgba(201,162,39,0.4)', boxShadow: '0 8px 24px rgba(201,162,39,0.3)' }}>
                            <Icons.User className="w-8 h-8" style={{ color: '#0f0f0f' }} />
                        </div>
                        <h3 className="text-3xl text-center font-bold mb-4 font-display" style={{ color: '#0f0f0f' }}>Bem-vindo de volta!</h3>
                        <p className="mb-8 text-sm font-medium text-center" style={{ color: '#6b6560' }}>Deseja continuar logado como <b className="text-amber-600">{selectedUserForLogin}</b>?</p>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => { setSessionPromptOpen(false); setSettings({ employeeName: null }); }} 
                                className="flex-1 p-4 rounded-[1.5rem] font-bold transition-all active-scale hover:scale-[1.02] hover:shadow-lg"
                                style={{ background: 'rgba(15,15,15,0.06)', border: '1.5px solid rgba(201,162,39,0.25)', color: '#4a4640' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,162,39,0.5)'; e.currentTarget.style.background='rgba(201,162,39,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(201,162,39,0.25)'; e.currentTarget.style.background='rgba(15,15,15,0.06)'; }}
                            >Não, Sair</button>
                            <button onClick={() => { setIsLoggedIn(true); setSessionPromptOpen(false); if (selectedUserForLogin === ADM_NAME) setIsAdm(true); showToast(`Sessão restaurada para ${selectedUserForLogin}`); }} 
                                className="flex-1 btn-gold rounded-[1.5rem] font-bold transition-all shadow-md active-scale hover:scale-[1.02] hover:shadow-xl p-4 text-onyx-900"
                                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 28px rgba(201,162,39,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow=''; }}
                            >Sim, Continuar</button>
                        </div>
                    </div>
                )}

                {loginModalOpen && (
                    <div className={`absolute inset-0 rounded-[3rem] z-20 flex flex-col items-center justify-center p-8 ${shake ? 'animate-shake' : ''}`} style={{ background: '#fdfaf4', borderTop: '1px solid rgba(201,162,39,0.35)' }}>
                        {/* Glow effect behind icon */}
                        <div className="absolute w-20 h-20 rounded-full animate-pulse-slow pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.2) 0%, transparent 70%)' }}></div>
                        
                        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 shadow-lg" style={{ background: 'linear-gradient(135deg,#c9a227,#e4ba4a)', border: '2px solid rgba(201,162,39,0.4)', boxShadow: '0 6px 20px rgba(201,162,39,0.3)' }}>
                            <Icons.Lock className="w-6 h-6" style={{ color: '#0f0f0f' }} />
                        </div>
                        <h3 className="text-2xl font-bold mb-1 font-display" style={{ color: '#0f0f0f' }}>Olá, {selectedUserForLogin}!</h3>
                        <p className="mb-8 text-sm font-medium" style={{ color: '#6b6560' }}>Digite sua senha para acessar.</p>
                        
                        <div className="relative w-full mb-2" style={{ }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={loginPasswordInput} 
                                onChange={e => setLoginPasswordInput(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && handlePerformLogin()} 
                                className="w-full p-4 pr-12 rounded-[1.5rem] text-center mb-2 font-bold outline-none transition-all text-xl placeholder:font-normal shadow-sm focus:shadow-lg focus:shadow-amber-500/25"
                                style={{ background: '#fff', border: '1.5px solid rgba(201,162,39,0.35)', color: '#0f0f0f' }} 
                                placeholder="••••••" 
                                autoFocus
                                autoComplete="off"
                                spellCheck="false"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-amber-100 transition-colors"
                            >
                                {showPassword ? 
                                    <Icons.EyeOff className="w-5 h-5 text-amber-600" /> : 
                                    <Icons.Eye className="w-5 h-5 text-slate-400" />
                                }
                            </button>
                        </div>
                        
                        {/* Hint text */}
                        <p className="text-xs text-amber-600/70 mb-6" style={{  }}>
                            <span className="inline-flex items-center gap-1">
                                <Icons.Enter className="w-3 h-3" /> Pressione Enter para entrar
                            </span>
                        </p>
                        
                        <div className="flex gap-3 w-full" style={{  }}>
                            <button onClick={() => setLoginModalOpen(false)} 
                                className="flex-1 p-4 rounded-[1.5rem] font-bold transition-all active-scale hover:scale-[1.02] hover:shadow-lg"
                                style={{ background: 'rgba(15,15,15,0.06)', border: '1.5px solid rgba(201,162,39,0.25)', color: '#4a4640' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,162,39,0.5)'; e.currentTarget.style.background='rgba(201,162,39,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(201,162,39,0.25)'; e.currentTarget.style.background='rgba(15,15,15,0.06)'; }}
                            >Voltar</button>
                            <button onClick={handlePerformLogin} 
                                disabled={isLoading}
                                className="flex-1 btn-gold rounded-[1.5rem] font-bold transition-all active-scale hover:scale-[1.02] hover:shadow-xl p-4 text-onyx-900 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                onMouseEnter={e => { if(!isLoading) e.currentTarget.style.boxShadow='0 8px 28px rgba(201,162,39,0.4)'; }}
                                onMouseLeave={e => { if(!isLoading) e.currentTarget.style.boxShadow=''; }}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Entrando...
                                    </>
                                ) : 'Entrar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className={`pointer-events-auto px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in-up ${t.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    <span className="text-lg">{t.message}</span>
                    <button onClick={() => removeToast(t.id)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
                </div>
            ))}
        </div>
    );
}
