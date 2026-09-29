import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ title, children, onClose, footer, size = 'md' }) {
  const sizes = {
    sm:   'max-w-sm',
    md:   'max-w-lg',
    lg:   'max-w-2xl',
    xl:   'max-w-3xl',
    full: 'max-w-5xl',
  };

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-14 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={`
          w-full ${sizes[size]}
          bg-white
          rounded-t-2xl sm:rounded-2xl
          shadow-2xl
          flex flex-col
          max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100vh-5rem)]
        `}
        style={{ animation: 'slideUp .22s cubic-bezier(.22,1,.36,1) both' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex-shrink-0 rounded-t-2xl">
          {/* Mobile drag handle */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-300 sm:hidden" />
          <h2 className="text-[15px] font-bold text-slate-800 tracking-tight pr-8 sm:pr-0 leading-snug">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-4 sm:px-6 py-5 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex-shrink-0 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
