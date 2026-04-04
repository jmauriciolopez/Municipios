import { useEffect, useState, useRef } from 'react';
import { 
  Sparkles, 
  Layout, 
  Droplets, 
  Layers, 
  Box, 
  ChevronDown 
} from 'lucide-react';

const STYLES = [
  { id: 'standard', label: 'Estandar', icon: Layout, color: 'text-slate-500' },
  { id: 'glass', label: 'Glassmorphism', icon: Sparkles, color: 'text-blue-500' },
  { id: 'liquid', label: 'Liquid / Fluid', icon: Droplets, color: 'text-indigo-500' },
  { id: 'bento', label: 'Bento UI', icon: Box, color: 'text-emerald-500' },
  { id: 'neumorphic', label: 'Neumorphism', icon: Layers, color: 'text-amber-500' },
];

export default function StyleToggle() {
  const [currentStyle, setCurrentStyle] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-style');
      if (saved) return saved;
      // Backward compatibility
      if (document.documentElement.classList.contains('premium-mode')) return 'glass';
    }
    return 'standard';
  });

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remove all style classes
    const classesToRemove = ['premium-mode', 'style-glass', 'style-liquid', 'style-bento', 'style-neumorphic'];
    document.documentElement.classList.remove(...classesToRemove);

    // Add new class
    if (currentStyle !== 'standard') {
      const newClass = `style-${currentStyle}`;
      document.documentElement.classList.add(newClass);
      // Extra compatibility for existing premium rules
      if (currentStyle === 'glass') {
        document.documentElement.classList.add('premium-mode');
      }
    }

    localStorage.setItem('app-style', currentStyle);
    window.dispatchEvent(new Event('style-change'));
  }, [currentStyle]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeStyle = STYLES.find(s => s.id === currentStyle) || STYLES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 font-bold shadow-sm min-w-[160px] justify-between"
      >
        <div className="flex items-center gap-2">
          <activeStyle.icon size={14} className={activeStyle.color} />
          <span className="text-[10px] uppercase tracking-wider">{activeStyle.label}</span>
        </div>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in">
          <div className="p-2 space-y-1">
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => {
                  setCurrentStyle(style.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                  currentStyle === style.id 
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <style.icon size={14} className={currentStyle === style.id ? 'text-brand-500' : style.color} />
                <span className="text-xs font-bold">{style.label}</span>
                {currentStyle === style.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(109,123,255,0.8)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
