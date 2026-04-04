import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, subtitle, children, footer, maxWidth = '540px' }: ModalProps) {
  // Prevent body scroll when open
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { 
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset'; 
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative w-full overflow-hidden animate-scale-in flex flex-col max-h-[90vh] shadow-modal border border-white/20 dark:border-slate-800/40 rounded-[2rem] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl transition-all duration-300"
        style={{ maxWidth }}
      >
        {/* Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-brand-500 shadow-lg shadow-brand-500/20 z-20" />

        {/* Header */}
        <div className="flex items-center justify-between p-7 pb-3 relative z-10">
          <div className="flex flex-col gap-0.5">
            {subtitle && (
              <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em] ml-0.5 opacity-80">{subtitle}</span>
            )}
            <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter leading-tight">
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all active:scale-90 group shadow-sm border border-slate-200/50 dark:border-slate-700/50"
          >
            <X size={18} className="transition-transform group-hover:rotate-90 duration-300" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-7 pt-4 overflow-y-auto custom-scrollbar flex-1 relative z-10">
           {children}
        </div>

        {/* Footer Area */}
        {footer && (
          <div className="p-6 px-7 mt-auto border-t border-slate-100 dark:border-slate-800/50 flex justify-end items-center gap-3 bg-slate-50/30 dark:bg-slate-900/30 backdrop-blur-md relative z-10">
            {footer}
          </div>
        )}


        {/* Decorative Elements */}
        <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}
