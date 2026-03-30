import Icons from '../Icons.jsx';
import { ROUTINE_TASKS } from '../../constants.js';

const RoutineChecklist = ({ routineState, toggleRoutine }) => {
    return (
        <div className="classic-frame rounded-[2.5rem] shadow-vision border border-white/60 p-10">
            <h3 className="font-bold text-2xl text-slate-200 mb-8 flex items-center gap-4 font-display">
                <div className="p-3 bg-gradient-to-br from-odoo-500 to-odoo-600 rounded-2xl shadow-lg shadow-odoo-500/30 text-white animate-pulse-slow">
                    <Icons.CheckSquare className="w-6 h-6" />
                </div>
                Tarefas do Dia
                <span className="text-slate-500 font-normal text-lg ml-2 hidden sm:inline">(Rotina)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {['morning', 'afternoon', 'evening'].map(phase => (
                    <div key={phase} className="space-y-4">
                        <div className={`
                                flex items-center gap-3 mb-6 pb-3 border-b border-white/10
                            `}>
                            <div className={`
                                w-3 h-3 rounded-full shadow-lg animate-pulse
                                ${phase === 'morning' ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-500/50' :
                                  phase === 'afternoon' ? 'bg-gradient-to-r from-sky-400 to-blue-500 shadow-sky-400/50' :
                                  'bg-gradient-to-r from-purple-400 to-indigo-500 shadow-purple-500/50'}
                            `}></div>
                            <span className="text-slate-400 uppercase tracking-widest text-xs flex items-center gap-1">
                                {phase === 'morning' && <><span>☀️</span><span>Início - Manhã</span></>}
                                {phase === 'afternoon' && <><span>🌤️</span><span>Meio - Tarde</span></>}
                                {phase === 'evening' && <><span>🌙</span><span>Fim - Fechamento</span></>}
                            </span>
                        </div>
                        {ROUTINE_TASKS && ROUTINE_TASKS[phase] && ROUTINE_TASKS[phase].map((task, idx) => {
                            const isChecked = routineState[`${phase}-${idx}`];
                            return (
                                <div
                                    key={idx}
                                    onClick={() => toggleRoutine(phase, idx)}
                                    className={`
                                        flex items-start gap-4 p-5 rounded-[1.5rem] border transition-all cursor-pointer group duration-500 hover:scale-[1.02] active:scale-[0.98]
                                        ${isChecked
                                            ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/20 border-green-500/20 shadow-inner'
                                            : 'bg-white/5 border-white/5 hover:border-odoo-500/30 hover:shadow-lg hover:shadow-odoo-500/10 shadow-sm'
                                        }
                                    `}
                                >
                                    <div className={`
                                        mt-0.5 min-w-[22px] h-[22px] rounded-lg border-2 flex items-center justify-center transition-all duration-500
                                        ${isChecked
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-500 text-white rotate-0 shadow-lg shadow-green-500/30'
                                            : 'border-slate-600 bg-white/10 group-hover:border-odoo-400 -rotate-12 group-hover:rotate-0 group-hover:shadow-lg group-hover:shadow-odoo-500/20'
                                        }
                                    `}>
                                        {isChecked && <Icons.Check className="w-3.5 h-3.5" />}
                                    </div>
                                    <span className={`
                                        text-sm font-medium leading-snug transition-all duration-300
                                        ${isChecked
                                            ? 'text-green-400 line-through opacity-60'
                                            : 'text-slate-400 group-hover:text-slate-200'
                                        }
                                    `}>
                                        {task}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoutineChecklist;
