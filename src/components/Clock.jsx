import { createContext, useContext, useState, useEffect } from 'react';
import Icons from './Icons.jsx';

const ClockContext = createContext(new Date());
const ClockProvider = ({ children }) => {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
    return <ClockContext.Provider value={time}>{children}</ClockContext.Provider>;
};
const useClock = () => useContext(ClockContext);

const RealTimeClock = () => {
    const time = useClock();
    return (<div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-lg shadow-black/5 hover:bg-white/10 transition-all duration-300"><Icons.Clock className="w-4 h-4 text-odoo-500" /><span className="font-mono text-sm font-bold text-odoo-400 tracking-wide">{time.toLocaleTimeString('pt-BR')}</span></div>);
};

const HeaderClock = () => {
    const time = useClock();
    return (<div className="hidden md:flex items-center gap-2 bg-white/5 px-5 py-2.5 rounded-full border border-white/10 shadow-sm backdrop-blur-sm"><Icons.Clock className="w-4 h-4 text-odoo-500" /><span className="font-mono text-sm font-bold text-slate-300 tracking-wide">{time.toLocaleTimeString('pt-BR')}</span></div>);
};

export { ClockProvider, useClock, RealTimeClock, HeaderClock };
export default { ClockProvider, useClock, RealTimeClock, HeaderClock };