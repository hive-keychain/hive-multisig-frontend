import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { Toast, ToastBody, ToastContainer } from 'react-bootstrap';
import { NotifyMessage, onNotify } from '../../utils/notify';

const toastContainerStyle: CSSProperties = {
  position: 'fixed',
  bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
  right: 'calc(16px + env(safe-area-inset-right, 0px))',
  left: 'auto',
  transform: 'none',
  zIndex: 3000,
  maxWidth: 'min(420px, calc(100vw - 32px))',
  width: 'auto',
};

export default function GlobalToasts() {
  const [messages, setMessages] = useState<NotifyMessage[]>([]);

  useEffect(() => {
    return onNotify((msg) => {
      setMessages((prev) => {
        const next = [msg, ...prev];
        // keep the stack small so it doesn't cover the UI
        return next.slice(0, 3);
      });
    });
  }, []);

  if (messages.length === 0) return null;

  const isDarkTheme =
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-bs-theme') === 'dark';
  const subtleText = isDarkTheme ? 'text-light' : 'text-dark';

  const toastClassName = (variant: NotifyMessage['variant']) => {
    switch (variant) {
      case 'danger':
        return `bg-danger-subtle ${subtleText} border border-danger-subtle`;
      case 'warning':
        return `bg-warning-subtle ${subtleText} border border-warning-subtle`;
      case 'success':
        return `bg-success-subtle ${subtleText} border border-success-subtle`;
      case 'info':
        return `bg-info-subtle ${subtleText} border border-info-subtle`;
      case 'secondary':
        return `bg-secondary-subtle ${subtleText} border border-secondary-subtle`;
      case 'light':
        return 'bg-light text-dark border border-light';
      case 'dark':
        return 'text-bg-dark border border-dark';
      case 'primary':
      default:
        return `bg-primary-subtle ${subtleText} border border-primary-subtle`;
    }
  };

  const actionButtonClassName = (variant: NotifyMessage['variant']) => {
    // Keep the button readable against the toast background.
    if (variant === 'dark') return 'btn btn-sm btn-outline-light';
    return isDarkTheme ? 'btn btn-sm btn-outline-light' : 'btn btn-sm btn-outline-dark';
  };

  return (
    <ToastContainer style={toastContainerStyle}>
      {messages.map((m) => (
        <Toast
          key={m.id}
          className={`mb-2 ${toastClassName(m.variant)}`}
          delay={m.timeoutMs ?? 6000}
          autohide
          onClose={() => {
            setMessages((prev) => prev.filter((x) => x.id !== m.id));
          }}>
          <ToastBody style={{ whiteSpace: 'pre-wrap' }}>
            <div className="d-flex align-items-start justify-content-between gap-2">
              <div style={{ minWidth: 0 }} className="text-break">
                {m.text}
              </div>
              {m.action ? (
                <button
                  type="button"
                  className={actionButtonClassName(m.variant)}
                  onClick={() => {
                    try {
                      m.action?.onClick();
                    } finally {
                      setMessages((prev) => prev.filter((x) => x.id !== m.id));
                    }
                  }}>
                  {m.action.label}
                </button>
              ) : null}
            </div>
          </ToastBody>
        </Toast>
      ))}
    </ToastContainer>
  );
}
