import Icons from '../Icons.jsx';

interface OfflineBannerProps {
  isOnline: boolean;
}

export function OfflineBanner({ isOnline }: OfflineBannerProps) {
  if (isOnline) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 mt-2 no-print">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-4 flex items-center gap-4">
        <div className="p-2 bg-amber-500/20 rounded-xl shrink-0">
          <Icons.AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="font-bold text-amber-700 text-sm">Modo Offline Ativo</p>
          <p className="text-amber-600 text-xs mt-0.5">Firebase Persistence garante sincronização automática.</p>
        </div>
      </div>
    </div>
  );
}