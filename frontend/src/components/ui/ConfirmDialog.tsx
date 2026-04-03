import { useState, useCallback } from 'react';

type ConfirmOptions = { title?: string; message: string; confirmLabel?: string; danger?: boolean };
type ConfirmState = ConfirmOptions & { resolve: (v: boolean) => void } | null;

let _setConfirm: ((s: ConfirmState) => void) | null = null;

export function confirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    _setConfirm?.({ ...opts, resolve });
  });
}

export function ConfirmDialog() {
  const [state, setConfirm] = useState<ConfirmState>(null);
  _setConfirm = setConfirm;

  const handle = useCallback((v: boolean) => {
    state?.resolve(v);
    setConfirm(null);
  }, [state]);

  if (!state) return null;

  return (
    <div style={overlay}>
      <div style={box}>
        {state.title && <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '0.5rem' }}>{state.title}</div>}
        <p style={{ fontSize: '0.9375rem', color: '#475569', margin: '0 0 1.5rem' }}>{state.message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={() => handle(false)}>Cancelar</button>
          <button
            style={state.danger ? { background: '#dc2626', color: '#fff', border: 'none' } : undefined}
            onClick={() => handle(true)}
          >
            {state.confirmLabel ?? 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
};
const box: React.CSSProperties = {
  background: '#fff', borderRadius: '0.75rem', padding: '1.75rem',
  width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
};
