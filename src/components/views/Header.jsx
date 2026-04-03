import { useState } from 'react';
import Icons from '../Icons.jsx';
import { HeaderClock } from '../Clock.jsx';
import NotificationsDropdown from '../NotificationsDropdown.jsx';
import { useHeaderCalculations } from '../../hooks/ui/useHeaderCalculations.ts';

export default function Header({
    settings,
    isAdm,
    isOnline,
    currentView,
    setCurrentView,
    setLogoutModalOpen,
    isNotificationsDropdownOpen,
    setIsNotificationsDropdownOpen,
    setIsHelpDropdownOpen,
    isHelpDropdownOpen,
    HELP_LINKS,
    ADM_NAME,
    isBackupOpen,
    setIsBackupOpen,
    APP_VERSION,
    sales,
    clients,
    reminders,
    GOAL_SELLERS,
    GOAL_MANAGER,
    ELIGIBLE_FOR_GOAL,
    onOpenNotificationsModal
}) {
    const [notificationsRead, setNotificationsRead] = useState(false);

    const {
        todayReminders: _todayReminders,
        recentClients: _recentClients,
        sellerGoalsAtRisk: _sellerGoalsAtRisk,
        upcomingBirthdays: _upcomingBirthdays,
        hasNotifications,
        totalNotifications
    } = useHeaderCalculations({
        sales,
        clients,
        reminders,
        GOAL_SELLERS,
        GOAL_MANAGER,
        ELIGIBLE_FOR_GOAL
    });

    const hasUnreadNotifications = hasNotifications && !notificationsRead;
    return (
        <div className="classic-frame sticky top-4 z-50 no-print transition-all duration-300 mx-4 md:mx-auto max-w-6xl rounded-[2.5rem] mt-4 shadow-vision mb-8 border border-white/60">
            <div className="px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-5">
                    <div style={{ width:'48px', height:'48px', borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(201,162,39,0.5)', boxShadow:'0 0 0 3px rgba(201,162,39,0.1), 0 2px 12px rgba(201,162,39,0.2)', background:'#111', flexShrink:0, transition:'transform 0.3s ease, box-shadow 0.3s ease', cursor:'default' }}
                        onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.08)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(201,162,39,0.25), 0 4px 20px rgba(201,162,39,0.35)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(201,162,39,0.1), 0 2px 12px rgba(201,162,39,0.2)'; }}>
                        <img src="/logo.png" alt="Logo" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                            onError={e=>{
                                const img = e.target; const parent = img.parentElement;
                                img.style.display = 'none';
                                Object.assign(parent.style, { display:'flex', alignItems:'center', justifyContent:'center' });
                                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                svg.setAttribute('width','24'); svg.setAttribute('height','24');
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
                    <div><h1 className="font-bold text-xl leading-none text-slate-200 font-display mb-1">Miplace</h1><span className="font-bold text-[10px] text-odoo-500 uppercase tracking-[0.2em]">{settings.employeeName}</span></div>
                    <div className="h-10 w-px bg-white/10 mx-2"></div>
                    <a href="https://miplace.odoo.com/odoo/action-1581" target="_blank"
                        className="p-3 rounded-2xl border border-transparent text-slate-400 active-scale relative overflow-hidden group"
                        style={{ background:'rgba(255,255,255,0.04)', transition:'border-color 0.3s, box-shadow 0.3s' }}
                        onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(201,162,39,0.4)'; e.currentTarget.style.boxShadow='0 0 14px rgba(201,162,39,0.18)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.boxShadow='none'; }}
                        title="Lista de Preço">
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none" style={{ background:'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.22) 0%, transparent 70%)', transition:'opacity 0.3s' }}></span>
                        <Icons.Tag className="w-5 h-5 relative z-10" />
                    </a>
                </div>
                <HeaderClock />
                {!isOnline && (
                    <div className="hidden md:flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full animate-pulse">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Offline</span>
                    </div>
                )}
                {isOnline && (
                    <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_6px_#10b981]"></div>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Online</span>
                    </div>
                )}
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-[2rem] border border-white/10 shadow-sm backdrop-blur-md">
                    <button onClick={() => setCurrentView('dashboard')}
                        className={`p-3 rounded-[1.5rem] transition-all duration-300 active-scale relative overflow-hidden group ${currentView === 'dashboard' ? 'btn-gold text-onyx-900 shadow-md ring-1 ring-black/5' : 'text-slate-400'}`}
                        onMouseEnter={e=>{ if(currentView!=='dashboard'){ e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow='0 0 14px rgba(201,162,39,0.15)'; }}}
                        onMouseLeave={e=>{ if(currentView!=='dashboard'){ e.currentTarget.style.background=''; e.currentTarget.style.boxShadow=''; }}}
                        title="Home">
                        {currentView !== 'dashboard' && <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none" style={{ background:'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.2) 0%, transparent 70%)', transition:'opacity 0.3s' }}></span>}
                        <Icons.Home className="w-5 h-5 relative z-10" />
                    </button>

                    <button onClick={() => setCurrentView(currentView === 'clients' ? 'dashboard' : 'clients')}
                        className={`p-3 rounded-[1.5rem] transition-all duration-300 active-scale relative overflow-hidden group ${currentView === 'clients' ? 'btn-gold text-onyx-900 shadow-md ring-1 ring-black/5' : 'text-slate-400'}`}
                        onMouseEnter={e=>{ if(currentView!=='clients'){ e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow='0 0 14px rgba(201,162,39,0.15)'; }}}
                        onMouseLeave={e=>{ if(currentView!=='clients'){ e.currentTarget.style.background=''; e.currentTarget.style.boxShadow=''; }}}
                        title="Carteira de Clientes">
                        {currentView !== 'clients' && <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none" style={{ background:'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.2) 0%, transparent 70%)', transition:'opacity 0.3s' }}></span>}
                        <Icons.Users className="w-5 h-5 relative z-10" />
                    </button>

                    <button onClick={() => setCurrentView(currentView === 'referrals' ? 'dashboard' : 'referrals')}
                        className={`p-3 rounded-[1.5rem] transition-all duration-300 active-scale relative overflow-hidden group ${currentView === 'referrals' ? 'btn-gold text-onyx-900 shadow-md ring-1 ring-black/5' : 'text-slate-400'}`}
                        onMouseEnter={e=>{ if(currentView!=='referrals'){ e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow='0 0 14px rgba(201,162,39,0.15)'; }}}
                        onMouseLeave={e=>{ if(currentView!=='referrals'){ e.currentTarget.style.background=''; e.currentTarget.style.boxShadow=''; }}}
                        title="Indicações">
                        {currentView !== 'referrals' && <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none" style={{ background:'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.2) 0%, transparent 70%)', transition:'opacity 0.3s' }}></span>}
                        <Icons.UserPlus className="w-5 h-5 relative z-10" />
                    </button>

                    <button onClick={() => setCurrentView(currentView === 'performance' ? 'dashboard' : 'performance')}
                        className={`p-3 rounded-[1.5rem] transition-all duration-300 active-scale relative overflow-hidden group ${currentView === 'performance' ? 'btn-gold text-onyx-900 shadow-md ring-1 ring-black/5' : 'text-slate-400'}`}
                        onMouseEnter={e=>{ if(currentView!=='performance'){ e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow='0 0 14px rgba(201,162,39,0.15)'; }}}
                        onMouseLeave={e=>{ if(currentView!=='performance'){ e.currentTarget.style.background=''; e.currentTarget.style.boxShadow=''; }}}
                        title="Desempenho">
                        {currentView !== 'performance' && <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none" style={{ background:'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.2) 0%, transparent 70%)', transition:'opacity 0.3s' }}></span>}
                        <Icons.BarChart className="w-5 h-5 relative z-10" />
                    </button>

                    <button onClick={() => setCurrentView(currentView === 'calendar' ? 'dashboard' : 'calendar')}
                        className={`p-3 rounded-[1.5rem] transition-all duration-300 active-scale relative overflow-hidden group ${currentView === 'calendar' ? 'btn-gold text-onyx-900 shadow-md ring-1 ring-black/5' : 'text-slate-400'}`}
                        onMouseEnter={e=>{ if(currentView!=='calendar'){ e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow='0 0 14px rgba(201,162,39,0.15)'; }}}
                        onMouseLeave={e=>{ if(currentView!=='calendar'){ e.currentTarget.style.background=''; e.currentTarget.style.boxShadow=''; }}}
                        title="Calendário">
                        {currentView !== 'calendar' && <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none" style={{ background:'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.2) 0%, transparent 70%)', transition:'opacity 0.3s' }}></span>}
                        <Icons.Calendar className="w-5 h-5 relative z-10" />
                    </button>

                    {(settings.employeeName === "Sabrina Almeida" || isAdm) && (
                        <button onClick={() => setCurrentView(currentView === 'manager' ? 'dashboard' : 'manager')}
                            className={`p-3 rounded-[1.5rem] transition-all duration-300 active-scale relative overflow-hidden group ${currentView === 'manager' ? 'btn-gold text-onyx-900 shadow-md ring-1 ring-black/5' : 'text-slate-400'}`}
                            onMouseEnter={e=>{ if(currentView!=='manager'){ e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow='0 0 14px rgba(201,162,39,0.15)'; }}}
                            onMouseLeave={e=>{ if(currentView!=='manager'){ e.currentTarget.style.background=''; e.currentTarget.style.boxShadow=''; }}}
                            title="Painel Gerencial">
                            {currentView !== 'manager' && <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none" style={{ background:'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.2) 0%, transparent 70%)', transition:'opacity 0.3s' }}></span>}
                            <Icons.TrendingUp className="w-5 h-5 relative z-10" />
                        </button>
                    )}

                    <div className="relative notifications-dropdown flex items-center overflow-visible">
                        <button onClick={() => setIsNotificationsDropdownOpen(!isNotificationsDropdownOpen)}
                            className={`p-3 rounded-[1.5rem] active-scale relative overflow-visible group ${isNotificationsDropdownOpen ? 'bg-[#c9a227]/30 text-[#c9a227]' : hasUnreadNotifications ? 'text-amber-400 animate-notification-pulse' : 'text-slate-400 hover:text-[#c9a227]'}`}
                            onMouseEnter={e=>{ if(!isNotificationsDropdownOpen){ e.currentTarget.style.background='rgba(201,162,39,0.25)'; e.currentTarget.style.boxShadow='0 0 14px rgba(201,162,39,0.3)'; }}}
                            onMouseLeave={e=>{ if(!isNotificationsDropdownOpen){ e.currentTarget.style.background=''; e.currentTarget.style.boxShadow=''; }}}
                            title="Notificações">
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none" style={{ background:'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.4) 0%, transparent 70%)', transition:'opacity 0.3s' }}></span>
                            <Icons.Bell className={`w-5 h-5 relative z-10 ${hasUnreadNotifications && !isNotificationsDropdownOpen ? 'animate-bell-shake' : ''}`} />
                            {hasUnreadNotifications && !isNotificationsDropdownOpen && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-notification-badge z-20 border border-white">
                                    {totalNotifications > 9 ? '9+' : totalNotifications}
                                </span>
                            )}
                            {isNotificationsDropdownOpen && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#c9a227] text-[#1a1a1a] text-[9px] font-black rounded-full flex items-center justify-center shadow-lg z-20 border border-white">
                                    ✓
                                </span>
                            )}
                        </button>
                        {isNotificationsDropdownOpen && (
                            <NotificationsDropdown 
                                isOpen={isNotificationsDropdownOpen}
                                onClose={() => setIsNotificationsDropdownOpen(false)}
                                onMarkAsRead={() => { setNotificationsRead(true); setIsNotificationsDropdownOpen(false); }}
                                onOpenFullModal={onOpenNotificationsModal}
                                sales={sales}
                                clients={clients}
                                settings={settings}
                                reminders={reminders}
                                GOAL_SELLERS={GOAL_SELLERS}
                                GOAL_MANAGER={GOAL_MANAGER}
                                ELIGIBLE_FOR_GOAL={ELIGIBLE_FOR_GOAL}
                            />
                        )}
                    </div>

                    <div className="relative help-dropdown flex items-center">
                        <button onClick={() => setIsHelpDropdownOpen(!isHelpDropdownOpen)}
                            className="p-3 rounded-[1.5rem] text-slate-400 active-scale hover:text-amber-400 relative overflow-hidden group"
                            onMouseEnter={e=>{ if(!isHelpDropdownOpen){ e.currentTarget.style.background='rgba(201,162,39,0.25)'; e.currentTarget.style.boxShadow='0 0 25px rgba(201,162,39,0.5)'; }}}
                            onMouseLeave={e=>{ if(!isHelpDropdownOpen){ e.currentTarget.style.background=''; e.currentTarget.style.boxShadow=''; }}}
                            title="Ajuda">
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none" style={{ background:'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.5) 0%, transparent 70%)', transition:'opacity 0.3s' }}></span>
                            <Icons.HelpCircle className="w-6 h-6 relative z-10" />
                        </button>
                        {isHelpDropdownOpen && (
                            <div className="absolute right-0 top-full mt-3 w-80 bg-gradient-to-b from-[#fdfaf4] via-[#f8f4e8] to-[#ede4cf] border-2 border-[#c9a227]/50 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-fade-in-up" style={{ boxShadow: '0 10px 40px rgba(201,162,39,0.35), 0 0 60px rgba(201,162,39,0.15)' }}>
                                <div className="p-4 border-b border-[#c9a227]/40 bg-gradient-to-r from-[#c9a227]/20 via-[#c9a227]/10 to-transparent">
                                    <h3 className="font-bold text-[#0f0f0f] text-base flex items-center gap-2 tracking-wide">
                                        <Icons.HelpCircle className="w-4 h-4 text-[#c9a227]" />
                                        Links Úteis
                                    </h3>
                                </div>
                                <div className="max-h-[70vh] overflow-y-auto py-2">
                                    {HELP_LINKS.map((link, idx) => (
                                        <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-4 py-3 mx-3 my-1 rounded-xl hover:bg-[#c9a227]/20 border border-transparent hover:border-[#c9a227]/40 transition-all group">
                                            <div className="p-2 bg-[#c9a227]/20 rounded-lg border border-[#c9a227]/40 group-hover:border-[#c9a227]/70 group-hover:shadow-md group-hover:shadow-[#c9a227]/30 transition-all">
                                                <Icons.FileText className="w-4 h-4 text-[#8b6914]" />
                                            </div>
                                            <span className="text-sm text-[#0f0f0f] font-medium group-hover:text-[#c9a227] transition-colors">{link.title}</span>
                                            <Icons.ChevronRight className="w-4 h-4 text-[#c9a227]/60 ml-auto group-hover:text-[#c9a227] group-hover:translate-x-1 transition-all" />
                                        </a>
                                    ))}
                                </div>
                                <div className="p-3 border-t border-[#c9a227]/30 bg-gradient-to-r from-[#c9a227]/15 to-transparent text-center">
                                    <p className="text-[10px] text-[#8b6914]/80 font-bold uppercase tracking-widest">Miplace Premium {APP_VERSION}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {(settings.employeeName === ADM_NAME || isAdm) && (
                        <button onClick={() => setIsBackupOpen(!isBackupOpen)}
                            className={`p-3 rounded-[1.5rem] transition-all duration-300 active-scale relative overflow-hidden group ${isBackupOpen ? 'btn-gold text-onyx-900 shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-amber-400'}`}
                            onMouseEnter={e=>{ if(!isBackupOpen){ e.currentTarget.style.background='rgba(201,162,39,0.15)'; e.currentTarget.style.boxShadow='0 0 20px rgba(201,162,39,0.25)'; }}}
                            onMouseLeave={e=>{ if(!isBackupOpen){ e.currentTarget.style.background=''; e.currentTarget.style.boxShadow=''; }}}
                            title="Backup">
                            <span className={`absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${isBackupOpen ? 'hidden' : ''}`}></span>
                            {isBackupOpen ? <Icons.CheckCircle className="w-5 h-5" /> : <Icons.Download className="w-5 h-5 relative z-10" />}
                        </button>
                    )}

                    <button onClick={() => setLogoutModalOpen(true)}
                        className="p-3 rounded-[1.5rem] text-slate-400 active-scale hover:text-red-400 relative overflow-hidden group"
                        onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.08)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background=''; }}
                        title="Sair">
                        <Icons.LogOut className="w-5 h-5 relative z-10" />
                    </button>
                </div>
            </div>
        </div>
    );
}