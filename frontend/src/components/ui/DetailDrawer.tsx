import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
}

export default function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'w-[400px]'
}: DetailDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className={`${width} flex-shrink-0 animate-scale-in h-fit sticky top-0 pb-10 z-30`}>
      <div className="card-premium h-full flex flex-col p-0 overflow-hidden border-slate-100 shadow-premium-xl bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="p-6 bg-brand-600 text-white relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h3 className="text-xl font-black leading-tight tracking-tighter uppercase">{title}</h3>
              {subtitle && <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">{subtitle}</p>}
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all border border-white/10"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
