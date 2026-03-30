import Icons from './Icons.jsx';

// BUG-5 fix: distingue visualmente os tipos de toast (success / error / info)
const TOAST_STYLES = {
  success: {
    border: 'border-emerald-500/50',
    icon_bg: 'bg-emerald-500/20 text-emerald-400',
    Icon: Icons.Check,
  },
  error: {
    border: 'border-red-500/50',
    icon_bg: 'bg-red-500/20 text-red-400',
    Icon: Icons.AlertCircle,
  },
  info: {
    border: 'border-sky-400/50',
    icon_bg: 'bg-sky-400/20 text-sky-400',
    Icon: Icons.AlertCircle,
  },
};

const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed top-8 right-8 z-[200] flex flex-col gap-4 pointer-events-none">
        {toasts.map(toast => {
            const style = TOAST_STYLES[toast.type] ?? TOAST_STYLES.success;
            const { Icon } = style;
            return (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-center gap-5 px-8 py-6 rounded-[2rem] shadow-2xl border border-white/10 transform transition-all duration-500 animate-slide-in-right glass-dark ${style.border}`}
                >
                    <div className={`p-3 rounded-full ${style.icon_bg}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-white text-sm tracking-wide">{toast.message}</p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
                    >
                        <Icons.X className="w-5 h-5" />
                    </button>
                </div>
            );
        })}
    </div>
);

export default ToastContainer;