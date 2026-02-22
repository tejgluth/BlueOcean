import { CheckCircle2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useDemoStore } from '../../store/demoStore';

export function ToastViewport() {
  const toasts = useDemoStore((s) => s.toasts);
  const dismiss = useDemoStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        dismiss(toast.id);
      }, 3200),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [toasts, dismiss]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10 animate-[fadeIn_.18s_ease-out]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">{toast.title}</p>
              {toast.description ? <p className="mt-0.5 text-xs text-slate-500">{toast.description}</p> : null}
            </div>
            <button type="button" onClick={() => dismiss(toast.id)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
