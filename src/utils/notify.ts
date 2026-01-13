export type NotifyVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

export type NotifyAction = {
  label: string;
  onClick: () => void;
};

export type NotifyMessage = {
  id: number;
  variant: NotifyVariant;
  text: string;
  title?: string;
  timeoutMs?: number;
  action?: NotifyAction;
};

type Listener = (message: NotifyMessage) => void;

const listeners = new Set<Listener>();
let nextId = 1;

// When the UI triggers a broadcast, we show an immediate local toast.
// The websocket broadcast notification can arrive shortly after; this key
// allows us to suppress that global toast for a brief window to avoid duplicates.
export const SUPPRESS_BROADCAST_TOAST_UNTIL_MS_KEY =
  'multisig:suppressBroadcastToastUntilMs';

export const onNotify = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const notify = (
  variant: NotifyVariant,
  text: string,
  options?: Omit<NotifyMessage, 'id' | 'variant' | 'text'>,
) => {
  const message: NotifyMessage = {
    id: nextId++,
    variant,
    text,
    timeoutMs: options?.timeoutMs ?? 6000,
    title: options?.title,
    action: options?.action,
  };

  listeners.forEach((l) => {
    try {
      l(message);
    } catch {
      // ignore listener errors
    }
  });

  return message.id;
};

export const notifySuccess = (text: string, options?: Omit<NotifyMessage, 'id' | 'variant' | 'text'>) =>
  notify('success', text, options);

export const notifyError = (text: string, options?: Omit<NotifyMessage, 'id' | 'variant' | 'text'>) =>
  notify('danger', text, options);

export const notifyWarning = (text: string, options?: Omit<NotifyMessage, 'id' | 'variant' | 'text'>) =>
  notify('warning', text, options);

export const notifyInfo = (text: string, options?: Omit<NotifyMessage, 'id' | 'variant' | 'text'>) =>
  notify('info', text, options);
