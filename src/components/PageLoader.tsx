import Icons from './Icons.jsx';

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-slate-200 border-t-odoo-500 rounded-full animate-spin" />
    </div>
  </div>
);

export default PageLoader;