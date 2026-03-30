import { useState } from 'react';
import Icons from './Icons.jsx';
import { formatDateBR } from '../utils.js';

const DateInput = ({ value, onChange, required, className, placeholder }) => {
    const [inputType, setInputType] = useState('text');
    return (<div className="relative w-full group"><input type={inputType} required={required} value={inputType === 'text' && value ? formatDateBR(value) : value} onChange={onChange} onFocus={(e) => { setInputType('date'); if (e.target.showPicker) e.target.showPicker(); }} onBlur={() => setInputType('text')} className={`transition-all duration-300 input-focus-effect ${className}`} placeholder={placeholder || "dd/mm/aaaa"} />{inputType === 'text' && (<div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-odoo-500 transition-colors"><Icons.Calendar className="w-5 h-5" /></div>)}</div>);
};

export default DateInput;