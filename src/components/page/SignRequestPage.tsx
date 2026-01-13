import { HiveMultisig } from 'hive-multisig-sdk/src';
import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import {
  ISignTransaction,
  ITransaction,
  SignTransactionMessage,
  SocketMessageCommand,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Collapse,
  ListGroup,
  Spinner,
  Stack,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';

import ReactJson from '@microlink/react-json-view';
import { Config } from '../../config';
import { LoginResponseType } from '../../interfaces';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { multisigActions } from '../../redux/features/multisig/multisigSlices';
import { addSignRequest } from '../../redux/features/multisig/multisigThunks';
import HiveUtils from '../../utils/hive.utils';
import { MultisigUtils } from '../../utils/multisig.utils';
import {
  notifyError,
  notifyInfo,
  notifySuccess,
  notifyWarning,
  SUPPRESS_BROADCAST_TOAST_UNTIL_MS_KEY,
} from '../../utils/notify';
import { isSessionValid, LOGIN_TIMESTAMP_STORAGE_KEY } from '../../utils/session';
import { resolveTheme, ThemePreference } from '../../utils/theme';
import {
  getTimestampInSeconds,
} from '../../utils/utils';
type AlertType = {
  variant?: string;
  text?: string;
  show?: boolean;
};

const isKeychainDebugEnabled = () => {
  try {
    return localStorage.getItem('keychainDebug') === 'true';
  } catch {
    return false;
  }
};

const keychainDebug = (label: string, payload: any) => {
  if (!isKeychainDebugEnabled()) return;
  try {
    // eslint-disable-next-line no-console
    console.log(label, payload);
    (window as any).__HK_DEBUG_LAST__ = { label, payload, at: Date.now() };
  } catch {
    // ignore
  }
};

const extractKeychainHandshakeUsername = (handshake: any): string | undefined => {
  if (!handshake) return undefined;
  if (typeof handshake.username === 'string') return handshake.username;
  if (typeof handshake.account === 'string') return handshake.account;
  if (typeof handshake.data?.username === 'string') return handshake.data.username;
  if (typeof handshake.data?.account === 'string') return handshake.data.account;
  return undefined;
};

const requestKeychainHandshake = async (): Promise<any | undefined> => {
  const keychain = (window as any)?.hive_keychain;
  if (!keychain?.requestHandshake) return undefined;

  return new Promise((resolve) => {
    let settled = false;
    const done = (res: any) => {
      if (settled) return;
      settled = true;
      resolve(res);
    };

    try {
      // Keychain implementations differ slightly (some take app name, some don't).
      if (typeof keychain.requestHandshake === 'function') {
        if (keychain.requestHandshake.length >= 2) {
          keychain.requestHandshake('Hive Multisig Frontend', done);
        } else {
          keychain.requestHandshake(done);
        }
      }
    } catch {
      done(undefined);
    }

    setTimeout(() => done(undefined), 1500);
  });
};

const normalizeKeychainMethod = (method: any): any => {
  const raw = typeof method === 'string' ? method : String(method ?? '');
  const lowered = raw.toLowerCase();
  if (lowered === 'posting' || lowered === 'post') return 'Posting';
  if (lowered === 'active' || lowered === 'act') return 'Active';
  if (lowered === 'memo') return 'Memo';

  // Already correct or unknown; pass through.
  if (raw === 'Posting' || raw === 'Active' || raw === 'Memo') return raw;
  return method;
};

const getReactJsonTheme = (resolvedTheme: 'light' | 'dark') =>
  resolvedTheme === 'dark' ? 'monokai' : 'rjv-default';

const toValidDate = (value: any): Date | undefined => {
  if (!value) return undefined;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  // Normalize common backend formats:
  // - ISO string with timezone: pass through
  // - ISO string without timezone: assume UTC (append 'Z')
  // - epoch seconds/milliseconds: detect and convert
  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value < 10_000_000_000 ? value * 1000 : value;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    // If it's a pure number string, treat as epoch.
    if (/^\d+$/.test(trimmed)) {
      const asNum = Number(trimmed);
      if (!Number.isFinite(asNum)) return undefined;
      const ms = asNum < 10_000_000_000 ? asNum * 1000 : asNum;
      const d = new Date(ms);
      return Number.isNaN(d.getTime()) ? undefined : d;
    }

    const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(trimmed);
    const normalized = hasTimezone ? trimmed : `${trimmed}Z`;
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

export const SignRequestsPage = () => {
  const dispatch = useAppDispatch();

  const loginExpirationInSec = Config.login.expirationInSec;

  const [loginTimestamp, setLoginTimestamp] = useLocalStorage(
    LOGIN_TIMESTAMP_STORAGE_KEY,
    null,
  );

  const account = useAppSelector((state) => state.login.accountObject);

  const operation = useAppSelector(
    (state) => state.transaction.transaction.operation,
  );

  const postingConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessagePosting,
  );

  const activeConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessageActive,
  );

  const signRequest = useAppSelector(
    (state) => state.multisig.multisig.signRequests,
  );

  const isSignRequestWebsocketSubscribed = useAppSelector(
    (state) => !!state.multisig.multisig.subscribeToSignRequest,
  );

  const [multisig, setMultisig] = useState<HiveMultisig>();

  const [transactions, setTransactions] = useState<SignatureRequest[]>([]);

  const setAlerts = (next: any) => {
    const value: AlertType = typeof next === 'function' ? next({}) : next;
    if (!value?.show || !value?.text) return;

    const variant = String(value.variant ?? 'info');
    const text = String(value.text);
    if (variant === 'success') notifySuccess(text);
    else if (variant === 'danger' || variant === 'error') notifyError(text);
    else if (variant === 'warning') notifyWarning(text);
    else notifyInfo(text);
  };

  const [newRequestTimestamps, setNewRequestTimestamps] = useState<
    Record<string, number>
  >({});
  const hasHydratedRequestsRef = useRef(false);
  const prevRequestIdsRef = useRef<string[]>([]);
  const mountedAtRef = useRef<number>(Date.now());
  const hydrationSilenceUntilRef = useRef<number | null>(null);
  const getSignRequestsInFlightRef = useRef(false);
  const lastGetSignRequestsMsRef = useRef(0);

  const NEW_HIGHLIGHT_MS = 2 * 60 * 1000;

  const [listAltText, setListAltText] = useState<string>();

  const getAvailableSignerPublicKeys = (): string[] => {
    const keys: string[] = [];
    const postingKey = (postingConnectMessage as any)?.publicKey;
    const activeKey = (activeConnectMessage as any)?.publicKey;
    if (typeof postingKey === 'string' && postingKey.length > 0) keys.push(postingKey);
    if (typeof activeKey === 'string' && activeKey.length > 0) keys.push(activeKey);
    return Array.from(new Set(keys));
  };

  const needsSignatureForAnyAvailableKey = (
    req: SignatureRequest,
    keys: string[],
  ): boolean => {
    if (!Array.isArray(keys) || keys.length === 0) return false;
    const signers = (req as any)?.signers;
    if (!Array.isArray(signers)) return false;
    return signers.some((s: any) => {
      if (!s?.publicKey || !keys.includes(String(s.publicKey))) return false;
      const sig = s.signature;
      return sig === '' || sig === undefined || sig === null;
    });
  };

  const navigate = useNavigate();

  const isLoggedIn = () =>
    isSessionValid(loginTimestamp, loginExpirationInSec, getTimestampInSeconds());

  const getSignRequests = async () => {
    if (!multisig) return;

    // Avoid overlapping fetches (interval + focus + state-churn) and reduce bursts on load.
    if (getSignRequestsInFlightRef.current) return;
    const now = Date.now();
    if (now - lastGetSignRequestsMsRef.current < 5000) return;
    lastGetSignRequestsMsRef.current = now;
    getSignRequestsInFlightRef.current = true;

    const debugOn = (() => {
      try {
        return window.localStorage.getItem('multisig:debugSigners') === '1';
      } catch {
        return false;
      }
    })();

    const debugReq = (prefix: string, req: SignatureRequest) => {
      if (!debugOn || !req) return;
      const signers = (req as any)?.signers;
      const signerCount = Array.isArray(signers) ? signers.length : -1;
      // eslint-disable-next-line no-console
      console.log(`[multisig debug] ${prefix}`, {
        id: String((req as any).id),
        initiator: (req as any).initiator,
        status: (req as any).status,
        keyType: (req as any).keyType,
        signers: signerCount,
      });
    };

    const tryApplyPendingSignerSeed = (reqs: SignatureRequest[]) => {
      if (!Array.isArray(reqs) || reqs.length === 0) return;
      let pendingRaw: string | null = null;
      try {
        pendingRaw = window.localStorage.getItem('multisig:pendingSignerSeed');
      } catch {
        return;
      }
      if (!pendingRaw) return;

      type PendingSeed = {
        createdAtMs?: number;
        initiator?: string;
        keyType?: any;
        expirationDateIso?: string;
        seedSigners?: Array<{ publicKey: string; weight?: number }>;
      };

      let pending: PendingSeed | undefined;
      try {
        pending = JSON.parse(pendingRaw) as PendingSeed;
      } catch {
        return;
      }
      if (!pending?.seedSigners || pending.seedSigners.length === 0) return;

      const createdAtMs = typeof pending.createdAtMs === 'number' ? pending.createdAtMs : 0;
      // Only keep pending seeds for a short time.
      if (createdAtMs > 0 && Date.now() - createdAtMs > 10 * 60 * 1000) {
        try {
          window.localStorage.removeItem('multisig:pendingSignerSeed');
        } catch {
          // ignore
        }
        return;
      }

      const initiator = (pending.initiator ?? '').toString();
      const expIso = pending.expirationDateIso;
      const expMs = expIso ? new Date(expIso).getTime() : undefined;
      const expToleranceMs = 5 * 60 * 1000;

      // Find best match: same initiator, created recently, and close expiration.
      const candidates = reqs
        .map((r) => ({ r, createdAt: new Date((r as any).createdAt ?? 0).getTime() }))
        .filter(({ r, createdAt }) => {
          if (initiator && String((r as any).initiator ?? '') !== initiator) return false;
          if (createdAtMs && createdAt && Math.abs(createdAt - createdAtMs) > 5 * 60 * 1000) return false;
          if (expMs !== undefined) {
            const rExp = new Date((r as any).expirationDate ?? 0).getTime();
            if (!Number.isFinite(rExp)) return false;
            if (Math.abs(rExp - expMs) > expToleranceMs) return false;
          }
          return true;
        })
        .sort((a, b) => {
          // prefer newest / highest id
          const idA = Number((a.r as any).id);
          const idB = Number((b.r as any).id);
          if (Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) return idB - idA;
          return b.createdAt - a.createdAt;
        });

      const match = candidates[0]?.r;
      if (!match) return;

      dispatch(
        multisigActions.seedSignatureRequestSigners({
          signatureRequestId: String((match as any).id),
          signers: pending.seedSigners,
        }),
      );

      if (debugOn) {
        // eslint-disable-next-line no-console
        console.log('[multisig debug] applied pending signer seed', {
          matchedId: String((match as any).id),
          initiator: String((match as any).initiator ?? ''),
          seedSigners: pending.seedSigners.length,
        });
      }

      try {
        window.localStorage.removeItem('multisig:pendingSignerSeed');
      } catch {
        // ignore
      }
    };

    try {
      setListAltText('No transaction found');
      if (activeConnectMessage) {
        try {
          const activeReqs = await multisig.api.getSignatureRequests(
            activeConnectMessage,
          );
          if (activeReqs) {
            if (debugOn) {
              // eslint-disable-next-line no-console
              console.log(`[multisig debug] SignRequestPage activeReqs count`, activeReqs.length);
              activeReqs.forEach((r) => debugReq('SignRequestPage api(active)', r));
            }
            dispatch(addSignRequest(activeReqs));
            tryApplyPendingSignerSeed(activeReqs);
          }
        } catch (error) {
          if (debugOn) {
            // eslint-disable-next-line no-console
            console.log(`activeConnect: ${error}`);
          }
        }
      } else {
        // active connect message not available; nothing to fetch
      }
      if (postingConnectMessage) {
        try {
          const postingReqs = await multisig.api.getSignatureRequests(
            postingConnectMessage,
          );
          if (postingReqs) {
            if (debugOn) {
              // eslint-disable-next-line no-console
              console.log(`[multisig debug] SignRequestPage postingReqs count`, postingReqs.length);
              postingReqs.forEach((r) => debugReq('SignRequestPage api(posting)', r));
            }
            dispatch(addSignRequest(postingReqs));
          }
        } catch (error) {
          if (debugOn) {
            // eslint-disable-next-line no-console
            console.log(`postingConnect: ${error}`);
          }
        }
      } else {
        // posting connect message not available; nothing to fetch
      }
    } finally {
      getSignRequestsInFlightRef.current = false;
    }
  };

  useEffect(() => {
    if (account) {
      setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
    } else {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    // When the user logs out/logs in again without fully unmounting this page,
    // reset hydration/new tracking so we don't mark old items as "new".
    hasHydratedRequestsRef.current = false;
    prevRequestIdsRef.current = [];
    hydrationSilenceUntilRef.current = null;
    mountedAtRef.current = Date.now();
    setNewRequestTimestamps({});
  }, [loginTimestamp, account?.data?.username]);

  useEffect(() => {
    if (!multisig) return;
    if (!isLoggedIn()) return;

    let disposed = false;

    const refresh = () => {
      if (disposed) return;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      void getSignRequests();
    };

    // Initial fetch + keep fresh in case websocket messages are missed.
    refresh();

    // Even when websocket is subscribed, do a periodic resync.
    // Some backends send partial signer updates, and browser tabs can miss events.
    // Now that we also have in-flight + throttle guards, we can poll less often.
    const intervalMs = isSignRequestWebsocketSubscribed ? 60000 : 20000;
    const intervalId = window.setInterval(refresh, intervalMs);

    const onFocus = () => refresh();
    const onVisibility = () => refresh();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [
    multisig,
    loginTimestamp,
    activeConnectMessage,
    postingConnectMessage,
    operation,
    isSignRequestWebsocketSubscribed,
  ]);

  useEffect(() => {
    if (!transactions) {
      setListAltText('No Transaction Found');
    }
  }, [transactions]);

  useEffect(() => {
    if (signRequest) {
      setTransactions(signRequest);
    }
  }, [signRequest]);

  useEffect(() => {
    const currentList = signRequest ?? [];
    const currentIds = currentList.map((sr) => String(sr.id));

    if (!hasHydratedRequestsRef.current) {
      // Avoid marking everything as "new" during initial login hydration.
      // We only start "new" detection after we've seen the first non-empty list.
      if (currentIds.length === 0) {
        prevRequestIdsRef.current = currentIds;
        return;
      }

      // If the first non-empty list arrives long after mount, treat it as new.
      const secondsSinceMount = (Date.now() - mountedAtRef.current) / 1000;
      if (secondsSinceMount < 10) {
        // Mark very recent items (created shortly before login) as "new" so they stand out,
        // but don't show the "new request" toast for the initial hydration.
        const now = Date.now();
        const recentMs = 10 * 60 * 1000;
        const recentIds = currentList
          .filter((sr) => {
            const created = sr?.createdAt ? new Date(sr.createdAt).getTime() : 0;
            return created > 0 && now - created < recentMs;
          })
          .map((sr) => String(sr.id));

        if (recentIds.length > 0) {
          setNewRequestTimestamps((prev) => {
            const next = { ...prev };
            recentIds.forEach((id) => {
              next[id] = now;
            });
            return next;
          });
        }

        hasHydratedRequestsRef.current = true;
        prevRequestIdsRef.current = currentIds;
        hydrationSilenceUntilRef.current = Date.now() + 5000;
        return;
      }

      hasHydratedRequestsRef.current = true;
    }

    // While login is still hydrating (posting + active may load incrementally),
    // don't spam "new" highlights for already-existing items.
    if (
      hydrationSilenceUntilRef.current !== null &&
      Date.now() < hydrationSilenceUntilRef.current
    ) {
      prevRequestIdsRef.current = currentIds;
      return;
    }

    const prevIds = prevRequestIdsRef.current;
    const prevSet = new Set(prevIds);
    const added = currentIds.filter((id) => !prevSet.has(id));

    if (added.length > 0) {
      const now = Date.now();
      setNewRequestTimestamps((prev) => {
        const next = { ...prev };
        added.forEach((id) => {
          next[String(id)] = now;
        });
        return next;
      });

      setAlerts({
        variant: 'info',
        text:
          added.length === 1
            ? 'New signature request received.'
            : `${added.length} new signature requests received.`,
        show: true,
      });
    }

    prevRequestIdsRef.current = currentIds;
  }, [signRequest]);

  return (
    <div>
      {transactions?.length <= 0 ? (
        <div className="text-muted">{listAltText}</div>
      ) : (
        <Stack gap={3}>
          {transactions.map((tx) => {
            const state = GetStatus(tx, account);
            const idKey = String(tx.id);
            const isNew =
              !!newRequestTimestamps[idKey] &&
              Date.now() - newRequestTimestamps[idKey] < NEW_HIGHLIGHT_MS;

            const availableKeys = getAvailableSignerPublicKeys();
            const isPendingNeedingMySignature =
              (state === TransactionStatus.PENDING_TRANSACTION ||
                state === TransactionStatus.PENDING_INITIATED_TRANSACTION) &&
              !initiatedByMe(tx, account) &&
              needsSignatureForAnyAvailableKey(tx, availableKeys);
            switch (state) {
              case TransactionStatus.PENDING_INITIATED_TRANSACTION:
              case TransactionStatus.PENDING_TRANSACTION:
                return (
                  <div key={tx.id}>
                    <PendingRequestCard
                      signRequest={tx}
                      account={account}
                      setAlerts={setAlerts}
                      isNew={isNew}
                      highlight={isPendingNeedingMySignature}
                    />
                  </div>
                );
              case TransactionStatus.BROADCASTED_INITIATED_TRANSACTION:
              case TransactionStatus.BROADCASTED_TRANSACTION:
                return (
                  <div key={tx.id}>
                    <BroadCastedTransactionCard
                      signRequest={tx}
                      account={account}
                      setAlerts={setAlerts}
                      isNew={isNew}
                    />
                  </div>
                );
              case TransactionStatus.EXPIRED_INITIATED_TRANSACTION:
              case TransactionStatus.EXPIRED_TRANSACTION:
                return (
                  <div key={tx.id}>
                    <ExpiredTransactionCard
                      signRequest={tx}
                      account={account}
                      setAlerts={setAlerts}
                      isNew={isNew}
                    />
                  </div>
                );
            }
          })}
        </Stack>
      )}
    </div>
  );
};

type TxOperationTuple = [string, Record<string, any>];

const toOpTuple = (op: any): TxOperationTuple | null => {
  if (Array.isArray(op) && typeof op[0] === 'string') {
    return [op[0], (op[1] ?? {}) as Record<string, any>];
  }
  if (op && typeof op === 'object' && typeof op.type === 'string') {
    return [op.type, (op.value ?? op.payload ?? {}) as Record<string, any>];
  }
  return null;
};

const safeString = (value: any) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const shortPubKey = (key: any) => {
  const s = typeof key === 'string' ? key : String(key ?? '');
  if (s.length <= 16) return s;
  return `${s.slice(0, 10)}…${s.slice(-6)}`;
};

const signerStatusParts = (req: SignatureRequest) => {
  const signers: any[] = Array.isArray((req as any)?.signers) ? ((req as any).signers as any[]) : [];
  const hasSig = (s: any) => typeof s?.signature === 'string' && s.signature.length > 0;
  const refused = (s: any) => Boolean(s?.refused);

  const signedCount = signers.filter((s) => hasSig(s)).length;
  const refusedCount = signers.filter((s) => refused(s)).length;
  const pendingCount = Math.max(0, signers.length - signedCount - refusedCount);

  return { signers, signedCount, pendingCount, refusedCount, hasSig, refused };
};

const opKeyValues = (opName: string, payload: Record<string, any>) => {
  const pick = (keys: string[]) =>
    keys
      .map((k) => ({ key: k, value: payload?.[k] }))
      .filter((kv) => kv.value !== undefined);

  switch (opName) {
    case 'transfer':
      return pick(['from', 'to', 'amount', 'memo']);
    case 'transfer_to_vesting':
      return pick(['from', 'to', 'amount']);
    case 'withdraw_vesting':
      return pick(['account', 'vesting_shares']);
    case 'delegate_vesting_shares':
      return pick(['delegator', 'delegatee', 'vesting_shares']);
    case 'transfer_to_savings':
      return pick(['from', 'to', 'amount', 'memo']);
    case 'transfer_from_savings':
      return pick(['from', 'to', 'amount', 'memo', 'request_id']);
    case 'account_witness_vote':
      return pick(['account', 'witness', 'approve']);
    case 'account_witness_proxy':
      return pick(['account', 'proxy']);
    case 'vote':
      return pick(['voter', 'author', 'permlink', 'weight']);
    case 'comment':
      return pick(['parent_author', 'parent_permlink', 'author', 'permlink', 'title']);
    default:
      return pick([
        'account',
        'from',
        'to',
        'amount',
        'memo',
        'author',
        'permlink',
        'proposal_id',
        'approve',
      ]);
  }
};

const TransactionSummary = ({
  tx,
  method,
}: {
  tx: any;
  method?: any;
}) => {
  const rawOps = tx?.operations ?? [];
  const opTuples = (Array.isArray(rawOps) ? rawOps : [])
    .map(toOpTuple)
    .filter(Boolean) as TxOperationTuple[];

  if (opTuples.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="d-flex align-items-center justify-content-between gap-2">
        <div className="fw-semibold">You are signing</div>
        {method ? (
          <Badge bg="secondary">{String(method)}</Badge>
        ) : null}
      </div>

      <ListGroup className="mt-2">
        {opTuples.map(([opName, payload], index) => {
          const fields = opKeyValues(opName, payload);
          const title = `${opName}${opTuples.length > 1 ? ` (#${index + 1})` : ''}`;

          return (
            <ListGroup.Item key={`${opName}-${index}`}>
              <div className="fw-semibold">{title}</div>
              {fields.length > 0 ? (
                <div className="text-muted" style={{ fontSize: '0.95rem' }}>
                  {fields
                    .map((kv) => `${kv.key}: ${safeString(kv.value)}`)
                    .join(' • ')}
                </div>
              ) : (
                <div className="text-muted" style={{ fontSize: '0.95rem' }}>
                  {safeString(payload)}
                </div>
              )}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
};

interface ITransactionProps {
  signRequest: SignatureRequest;
  account: LoginResponseType;
  setAlerts: any;
  isNew?: boolean;
  highlight?: boolean;
}

const PendingRequestCard = ({
  signRequest,
  account,
  setAlerts,
  isNew,
  highlight,
}: ITransactionProps) => {
  const [request, setRequest] = useState(signRequest);
  const [user, setAccount] = useState(account);
  const [status, setStatus] = useState(TransactionStatus.PENDING_TRANSACTION);
  const [initiated, setInitiated] = useState(false);
  const [isBroadcasted, setIsBroadcasted] = useState(false);
  const [creationDate, setCreationDate] = useState(undefined);
  const [expirationDate, setExpirationDate] = useState(undefined);
  const [decodedTransaction, setDecodedTransaction] =
    useState<ITransaction>(undefined);
  const [decoded, setDecoded] = useState(false);
  const [valid, setValid] = useState(false);
  const [showDecodedTx, setShowDecodedTx] = useState(false);
  const [themePreference] = useLocalStorage<ThemePreference>(
    'themePreference',
    'system',
  );
  const resolvedTheme = resolveTheme(themePreference);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [decodeError, setDecodeError] = useState<string | undefined>(undefined);
  const multisig = HiveMultisig.getInstance(window, MultisigUtils.getOptions());

  useEffect(() => {
    setRequest(signRequest);
  }, [signRequest]);

  useEffect(() => {
    setAccount(account);
  }, [account]);

  const createdByLabel =
    request?.initiator && user?.data?.username
      ? request.initiator === user.data.username
        ? 'you'
        : request.initiator
      : request?.initiator;

  const signerView = signerStatusParts(request);
  const myKeys = [user?.publicKey, (user as any)?.data?.publicKey]
    .filter((k) => typeof k === 'string' && k.length > 0)
    .map((k) => String(k));

  const normalizedUsername =
    typeof user?.data?.username === 'string' && user.data.username.length > 0
      ? user.data.username.replace(/^@/, '').toLowerCase()
      : undefined;

  const [keyToAccounts, setKeyToAccounts] = useState<Record<string, string[]>>(
    {},
  );

  const [showSigners, setShowSigners] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const keysToResolve = Array.from(
      new Set(
        (signerView.signers ?? [])
          .map((s: any) => (typeof s?.publicKey === 'string' ? s.publicKey : ''))
          .filter((k: string) => k.length > 0 && keyToAccounts[k] === undefined),
      ),
    );

    if (keysToResolve.length === 0) return;

    const run = async () => {
      try {
        const batch = await (HiveUtils as any).getKeyReferencesBatch(keysToResolve);
        if (cancelled) return;
        setKeyToAccounts((prev) => ({ ...prev, ...(batch ?? {}) }));
      } catch {
        if (cancelled) return;
        // On batch failure, avoid retry storms by marking unknown keys as empty.
        setKeyToAccounts((prev) => {
          const next = { ...prev };
          keysToResolve.forEach((k) => {
            if (next[k] === undefined) next[k] = [];
          });
          return next;
        });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
    // Intentionally depend on signer public keys only; keyToAccounts is used for caching.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerView.signers]);

  const handleDecode = async () => {
    setIsDecoding(true);
    setDecodeError(undefined);
    try {
      const requestForDecode: any = {
        ...request,
        keyType: normalizeKeychainMethod((request as any)?.keyType),
      };
      const decodedTxs = await multisig.utils.decodeTransaction({
        signatureRequest: [requestForDecode],
        username: user.data.username,
      });
      if (decodedTxs) {
        setDecodedTransaction(decodedTxs[0]);
        setValid(true);
        setDecoded(true);
      } else {
        setStatus(TransactionStatus.INVALID);
        setValid(false);
        setDecoded(false);
      }
    } catch (error) {
      const message = error?.message ? String(error.message) : String(error);
      const isUserCancelled = /User ignored|User rejected/i.test(message);
      const isVerifyKey = /Could not verify key/i.test(message);

      if (isUserCancelled) {
        setDecodeError('Preview was cancelled in Keychain.');
      } else if (isVerifyKey) {
        setDecodeError(
          'Keychain could not verify the key for this account. Make sure you are logged into the correct account in Keychain and try again.',
        );
      } else {
        setDecodeError(message || 'Failed to decode transaction.');
        setStatus(TransactionStatus.INVALID);
      }
      setValid(false);
      setDecoded(false);
    } finally {
      setIsDecoding(false);
    }
  };

  const handleSign = async () => {
    if (isSigning) return;
    if (!decodedTransaction?.transaction || !decodedTransaction?.signer?.id) {
      setAlerts({
        variant: 'warning',
        text: 'Preview the transaction before signing.',
        show: true,
      });
      return;
    }

    // Ensure we pass a plain JSON tx to Keychain.
    let sanitizedTx: any;
    try {
      sanitizedTx = JSON.parse(JSON.stringify(decodedTransaction.transaction));
    } catch {
      sanitizedTx = decodedTransaction.transaction as any;
    }
    if (sanitizedTx && typeof sanitizedTx === 'object') {
      if (!Array.isArray(sanitizedTx.operations)) sanitizedTx.operations = [];
      if (!Array.isArray(sanitizedTx.extensions)) sanitizedTx.extensions = [];
      // Keychain adds signatures; passing an empty signatures array can trigger UI issues in some cases.
      if ('signatures' in sanitizedTx) {
        delete sanitizedTx.signatures;
      }
    }

    const methodForKeychain = normalizeKeychainMethod(decodedTransaction.method);

    // Guard against the common case: user is logged in as one account in the app,
    // but Keychain is currently using a different account.
    try {
      const handshake = await requestKeychainHandshake();
      const keychainUser = extractKeychainHandshakeUsername(handshake);
      if (
        keychainUser &&
        user?.data?.username &&
        keychainUser.toLowerCase() !== user.data.username.toLowerCase()
      ) {
        setAlerts({
          variant: 'warning',
          text: `Keychain is currently set to @${keychainUser}, but you are trying to sign as @${user.data.username}. Switch accounts in Keychain and try again.`,
          show: true,
        });
        keychainDebug('[keychain] handshake mismatch', {
          keychainUser,
          appUser: user.data.username,
          handshake,
        });
        return;
      }
    } catch {
      // Handshake is best-effort; ignore failures.
    }

    const data: ISignTransaction = {
      decodedTransaction: sanitizedTx,
      signerId: decodedTransaction.signer.id,
      signatureRequestId: decodedTransaction.signatureRequestId,
      username: user.data.username,
      method: methodForKeychain,
    }; // console.log({ data });

    setIsSigning(true);
    try {
      const signViaWindowKeychain = async (): Promise<string[]> => {
        const keychain = (window as any)?.hive_keychain;
        if (!keychain?.requestSignTx) {
          throw new Error('Hive Keychain is not available.');
        }

        const txObject = sanitizedTx;
        keychainDebug('[keychain] requestSignTx payload', {
          username: user.data.username,
          method: methodForKeychain,
          txType: typeof txObject,
          txKeys: txObject ? Object.keys(txObject) : null,
          operationsCount: Array.isArray(txObject?.operations)
            ? txObject.operations.length
            : null,
        });

        const signedTx: any = await new Promise((resolve, reject) => {
          try {
            keychain.requestSignTx(
              user.data.username,
              txObject,
              methodForKeychain,
              (response: any) => {
                keychainDebug('[keychain] requestSignTx response', response);

                if (response?.success === true && response?.result) {
                  resolve(response.result);
                  return;
                }
                if (!response?.error && response?.result) {
                  resolve(response.result);
                  return;
                }
                reject(response);
              },
            );
          } catch (e) {
            reject(e);
          }
        });

        const signature =
          signedTx?.signatures?.[signedTx.signatures.length - 1] ?? null;
        if (!signature || typeof signature !== 'string') {
          throw new Error('Keychain did not return a signature.');
        }

        const signTransactionMessage: SignTransactionMessage = {
          signature,
          signerId: decodedTransaction.signer.id,
          signatureRequestId: decodedTransaction.signatureRequestId,
        };

        return new Promise((resolve, reject) => {
          try {
            HiveMultisig.socket.emit(
              SocketMessageCommand.SIGN_TRANSACTION,
              signTransactionMessage,
              (response: string[]) => resolve(response),
            );
          } catch (e) {
            reject(e);
          }
        });
      };

      let signatures: any;
      try {
        signatures = await signViaWindowKeychain();
      } catch (e) {
        // Fallback to SDK signing (keychain-sdk) if the direct path fails.
        signatures = await multisig.wss.signTransaction(data);
      }

      if (!Array.isArray(signatures) || signatures.length === 0) {
        setAlerts({
          variant: 'warning',
          text: 'No signature was returned from Keychain. Please try again.',
          show: true,
        });
        return;
      }

      const txToBroadcast = structuredClone(decodedTransaction);
      txToBroadcast.transaction.signatures = [...signatures];

      try {
        window.localStorage.setItem(
          SUPPRESS_BROADCAST_TOAST_UNTIL_MS_KEY,
          String(Date.now() + 7000),
        );
      } catch {
        // ignore
      }

      const broadcastResult = await multisig.wss.broadcastTransaction(txToBroadcast);
      setIsBroadcasted(broadcastResult !== undefined);
      setAlerts({
        variant: 'success',
        text: 'The transaction was broadcasted successfully!',
        show: true,
      });
    } catch (reason: any) {
      try {
        window.localStorage.removeItem(SUPPRESS_BROADCAST_TOAST_UNTIL_MS_KEY);
      } catch {
        // ignore
      }
      const rawMessage =
        (reason && typeof reason === 'object'
          ? (reason.message ?? reason.error ?? reason?.data?.message)
          : reason) ?? '';
      const message = String(rawMessage || '') || 'Failed to sign or broadcast.';
      setAlerts({
        variant: 'danger',
        text: message,
        show: true,
      });
      keychainDebug('Sign Transaction Rejected', reason);
    } finally {
      setIsSigning(false);
    }
  };

  const handleBroadcastOnly = async () => {
    setIsSigning(true);
    try {
      if (!decodedTransaction || !decoded || !valid) {
        setAlerts({
          variant: 'warning',
          text: 'Preview the transaction first so the app can load the payload to broadcast.',
          show: true,
        });
        return;
      }

      const signaturesFromRequest = (signerView.signers ?? [])
        .map((s: any) => s?.signature)
        .filter((sig: any) => typeof sig === 'string' && sig.length > 0);

      if (signaturesFromRequest.length === 0) {
        setAlerts({
          variant: 'warning',
          text: 'No signatures found on this request yet.',
          show: true,
        });
        return;
      }

      const txToBroadcast = structuredClone(decodedTransaction);
      txToBroadcast.transaction.signatures = [...signaturesFromRequest];

      try {
        window.localStorage.setItem(
          SUPPRESS_BROADCAST_TOAST_UNTIL_MS_KEY,
          String(Date.now() + 7000),
        );
      } catch {
        // ignore
      }

      const broadcastResult = await multisig.wss.broadcastTransaction(txToBroadcast);
      setIsBroadcasted(broadcastResult !== undefined);
      setAlerts({
        variant: 'success',
        text: 'The transaction was broadcasted successfully!',
        show: true,
      });
    } catch (reason: any) {
      try {
        window.localStorage.removeItem(SUPPRESS_BROADCAST_TOAST_UNTIL_MS_KEY);
      } catch {
        // ignore
      }
      const rawMessage =
        (reason && typeof reason === 'object'
          ? (reason.message ?? reason.error ?? reason?.data?.message)
          : reason) ?? '';
      const message = String(rawMessage || '') || 'Failed to broadcast.';
      setAlerts({
        variant: 'danger',
        text: message,
        show: true,
      });
    } finally {
      setIsSigning(false);
    }
  };

  useEffect(() => {
    if (request) {
      if (request.createdAt) {
        setCreationDate(toValidDate(request.createdAt));
      }
      if (request.expirationDate) {
        setExpirationDate(toValidDate(request.expirationDate));
      }
      setInitiated(initiatedByMe(request, user));
    }
  }, [request]);

  useEffect(() => {
    if (isBroadcasted) {
      if (initiated) {
        setStatus(TransactionStatus.BROADCASTED_INITIATED_TRANSACTION);
      } else {
        setStatus(TransactionStatus.BROADCASTED_TRANSACTION);
      }
    }
  }, [isBroadcasted]);

  useEffect(() => {
    if (initiated && status === TransactionStatus.PENDING_TRANSACTION) {
      setStatus(TransactionStatus.PENDING_INITIATED_TRANSACTION);
    }
  }, [initiated]);

  const isSignerMe = (signer: any) => {
    const publicKey = typeof signer?.publicKey === 'string' ? signer.publicKey : undefined;
    if (!publicKey) return false;
    if (myKeys.includes(String(publicKey))) return true;

    if (!normalizedUsername) return false;
    const accounts = keyToAccounts[String(publicKey)];
    return (
      Array.isArray(accounts) &&
      accounts.some(
        (a) =>
          typeof a === 'string' && a.replace(/^@/, '').toLowerCase() === normalizedUsername,
      )
    );
  };

  const orderedSigners = (signerView.signers ?? [])
    .map((s: any, originalIndex: number) => ({ s, originalIndex }))
    .sort((a, b) => {
      const aMe = isSignerMe(a.s);
      const bMe = isSignerMe(b.s);
      if (aMe !== bMe) return aMe ? -1 : 1;

      const rank = (signer: any) => {
        const refused = signerView.refused(signer);
        const signed = signerView.hasSig(signer);
        if (!refused && !signed) return 0; // Pending
        if (refused) return 1;
        return 2; // Signed
      };
      const diff = rank(a.s) - rank(b.s);
      return diff !== 0 ? diff : a.originalIndex - b.originalIndex;
    });

  return (
    <div>
      <Card
        key={signRequest.id}
        className={highlight ? 'border-primary border-2' : undefined}>
        <Card.Body>
          <Card.Title className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span>{status}</span>
            <div className="d-inline-flex align-items-center gap-2">
              {status === TransactionStatus.PENDING_TRANSACTION ||
              status === TransactionStatus.PENDING_INITIATED_TRANSACTION ? (
                <Badge bg="secondary">Pending</Badge>
              ) : null}
              {highlight ? (
                <Badge bg="primary">Needs your signature</Badge>
              ) : null}
              {isNew ? <Badge bg="info">New</Badge> : null}
            </div>
          </Card.Title>
          {createdByLabel ? (
            <Card.Subtitle className="mb-2 text-muted">{`Created by: ${createdByLabel}`}</Card.Subtitle>
          ) : null}
          {creationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Creation: ${creationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}
          {expirationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Expiration: ${expirationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}

          {signerView.signers.length > 0 ? (
            <div className="mt-3">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <div className="fw-semibold">Signers</div>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-muted d-inline-flex align-items-center gap-2"
                    aria-expanded={showSigners}
                    onClick={() => setShowSigners((v) => !v)}>
                    <span style={{ width: 16, textAlign: 'center' }}>
                      {showSigners ? '▴' : '▾'}
                    </span>
                    <span>{showSigners ? 'Hide' : 'Show'}</span>
                  </button>
                </div>

                <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                  {signerView.signedCount} signed · {signerView.pendingCount} pending
                  {signerView.refusedCount > 0
                    ? ` · ${signerView.refusedCount} refused`
                    : ''}
                </div>
              </div>

              <Collapse in={showSigners}>
                <div>
                  <ListGroup className="mt-2">
                    {orderedSigners.map(({ s, originalIndex }) => {
                      const key = String(s?.publicKey ?? originalIndex);
                      const isMe = isSignerMe(s);

                      const accountsForKey =
                        typeof s?.publicKey === 'string'
                          ? keyToAccounts[s.publicKey]
                          : undefined;
                      const primaryAccount =
                        Array.isArray(accountsForKey) && accountsForKey.length > 0
                          ? accountsForKey[0]
                          : undefined;
                      const extraCount =
                        Array.isArray(accountsForKey) && accountsForKey.length > 1
                          ? accountsForKey.length - 1
                          : 0;

                      const fallback = shortPubKey(s.publicKey);
                      const displayUser = primaryAccount
                        ? `@${primaryAccount}${extraCount > 0 ? ` (+${extraCount})` : ''}`
                        : fallback;

                      const label = isMe
                        ? user?.data?.username
                          ? `you (@${user.data.username})`
                          : 'you'
                        : displayUser;
                      const signed = signerView.hasSig(s);
                      const refused = signerView.refused(s);

                      return (
                        <ListGroup.Item
                          key={`${signRequest.id}:${key}:${originalIndex}`}
                          className="d-flex align-items-center justify-content-between gap-2">
                          <div className="text-truncate">{label}</div>
                          <div className="d-flex align-items-center gap-2">
                            {refused ? (
                              <Badge bg="danger">Refused</Badge>
                            ) : signed ? (
                              <Badge bg="success">Signed</Badge>
                            ) : (
                              <Badge bg="secondary">Pending</Badge>
                            )}
                          </div>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </div>
              </Collapse>
            </div>
          ) : null}

          {isDecoding ? (
            <div className="d-flex align-items-center gap-2 mt-3 text-muted">
              <Spinner animation="border" size="sm" />
              <span>Decoding transaction…</span>
            </div>
          ) : null}

          {decodeError ? (
            <Alert variant="secondary" className="mt-3 mb-0">
              {decodeError}
            </Alert>
          ) : null}

          {decoded && valid && decodedTransaction ? (
            <TransactionSummary
              tx={decodedTransaction.transaction}
              method={decodedTransaction.method}
            />
          ) : null}

          {decoded && !valid ? (
            <Alert variant="warning" className="mt-3 mb-0">
              Couldn’t decode this transaction.
            </Alert>
          ) : null}

          {status !== TransactionStatus.INVALID && decoded ? (
            <div>
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-link p-0 text-muted d-inline-flex align-items-center gap-2"
                  aria-expanded={showDecodedTx}
                  onClick={() => setShowDecodedTx(!showDecodedTx)}>
                  <span style={{ width: 16, textAlign: 'center' }}>
                    {showDecodedTx ? '▴' : '▾'}
                  </span>
                  <span>Transaction details (JSON)</span>
                </button>
                <div className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>
                  Click to expand and inspect the full payload.
                </div>
              </div>
              <Collapse in={showDecodedTx}>
                <Card>
                  <Card.Body>
                    <div id="example-collapse-text">
                      {decodedTransaction ? (
                        <ReactJson
                          src={decodedTransaction.transaction}
                          theme={getReactJsonTheme(resolvedTheme)}
                          style={{ backgroundColor: 'transparent' }}
                        />
                      ) : null}

                      {/* {decodedTransaction
                        ? JSON.stringify(decodedTransaction.transaction)
                        : null} */}
                    </div>
                  </Card.Body>
                </Card>
              </Collapse>
            </div>
          ) : null}

          <div className="mt-2 d-flex justify-content-end gap-2">
            {(status === TransactionStatus.PENDING_INITIATED_TRANSACTION ||
              status === TransactionStatus.PENDING_TRANSACTION) &&
            !decoded ? (
              <Button
                variant="outline-primary"
                type="button"
                disabled={isDecoding}
                onClick={() => {
                  handleDecode();
                }}>
                Preview
              </Button>
            ) : null}

            {(status === TransactionStatus.PENDING_INITIATED_TRANSACTION &&
              decoded &&
              valid &&
              !initiated) ||
            (status === TransactionStatus.PENDING_TRANSACTION &&
              decoded &&
              valid &&
              !initiated) ? (
              <Button
                variant="success"
                type="button"
                disabled={isSigning}
                onClick={() => {
                  handleSign();
                }}>
                {isSigning ? 'Signing…' : 'Sign'}
              </Button>
            ) : null}

            {initiated &&
            !isBroadcasted &&
            isSignedd(request) &&
            decoded &&
            valid ? (
              <Button
                variant="primary"
                type="button"
                disabled={isSigning}
                onClick={() => {
                  handleBroadcastOnly();
                }}>
                {isSigning ? 'Broadcasting…' : 'Broadcast'}
              </Button>
            ) : null}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

const BroadCastedTransactionCard = ({
  signRequest,
  account,
  isNew,
}: ITransactionProps) => {
  const [request, setRequest] = useState(signRequest);
  const [user, setAccount] = useState(account);
  const [status, setStatus] = useState(
    TransactionStatus.BROADCASTED_TRANSACTION,
  );
  const [initiated, setInitiated] = useState(false);
  const [isBroadcasted, setIsBroadcasted] = useState(false);
  const [creationDate, setCreationDate] = useState(undefined);
  const [expirationDate, setExpirationDate] = useState(undefined);
  const [decodedTransaction, setDecodedTransaction] =
    useState<ITransaction>(undefined);
  const [decoded, setDecoded] = useState(false);
  const [valid, setValid] = useState(false);
  const [showDecodedTx, setShowDecodedTx] = useState(false);
  const [themePreference] = useLocalStorage<ThemePreference>(
    'themePreference',
    'system',
  );
  const resolvedTheme = resolveTheme(themePreference);
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState<string | undefined>(undefined);
  const multisig = HiveMultisig.getInstance(window, MultisigUtils.getOptions());

  useEffect(() => {
    setRequest(signRequest);
  }, [signRequest]);

  useEffect(() => {
    setAccount(account);
  }, [account]);

  const createdByLabel =
    request?.initiator && user?.data?.username
      ? request.initiator === user.data.username
        ? 'you'
        : request.initiator
      : request?.initiator;

  const handleDecode = async () => {
    setIsDecoding(true);
    setDecodeError(undefined);
    try {
      const requestForDecode: any = {
        ...request,
        keyType: normalizeKeychainMethod((request as any)?.keyType),
      };
      const decodedTxs = await multisig.utils.decodeTransaction({
        signatureRequest: [requestForDecode],
        username: user.data.username,
      });
      if (decodedTxs) {
        setDecodedTransaction(decodedTxs[0]);
        setValid(true);
        setDecoded(true);
      } else {
        setStatus(TransactionStatus.INVALID);
        setValid(false);
        setDecoded(false);
      }
    } catch (error: any) {
      const message = error?.message ? String(error.message) : String(error);
      const isUserCancelled = /User ignored|User rejected/i.test(message);
      const isVerifyKey = /Could not verify key/i.test(message);

      if (isUserCancelled) {
        setDecodeError('Preview was cancelled in Keychain.');
      } else if (isVerifyKey) {
        setDecodeError(
          'Keychain could not verify the key for this account. Make sure you are logged into the correct account in Keychain and try again.',
        );
      } else {
        setDecodeError(message || 'Failed to decode transaction.');
        setStatus(TransactionStatus.INVALID);
      }
      setValid(false);
      setDecoded(false);
    } finally {
      setIsDecoding(false);
    }
  };
  useEffect(() => {
    if (request) {
      if (request.createdAt) {
        setCreationDate(toValidDate(request.createdAt));
      }
      if (request.expirationDate) {
        setExpirationDate(toValidDate(request.expirationDate));
      }
      setIsBroadcasted(request.broadcasted);
      setInitiated(initiatedByMe(request, user));
    }
  }, [request]);

  useEffect(() => {
    if (isBroadcasted && initiated) {
      setStatus(TransactionStatus.BROADCASTED_INITIATED_TRANSACTION);
    } else {
      setStatus(TransactionStatus.BROADCASTED_TRANSACTION);
    }
  }, [isBroadcasted]);
  return (
    <div>
      <Card key={signRequest.id}>
        <Card.Body>
          <Card.Title className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span>{status}</span>
            {isNew ? (
              <div className="d-inline-flex align-items-center gap-2">
                <Badge bg="info">New</Badge>
              </div>
            ) : null}
          </Card.Title>
          {createdByLabel ? (
            <Card.Subtitle className="mb-2 text-muted">{`Created by: ${createdByLabel}`}</Card.Subtitle>
          ) : null}
          {creationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Creation: ${creationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}
          {expirationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Expiration: ${expirationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}

          {isDecoding ? (
            <div className="d-flex align-items-center gap-2 mt-3 text-muted">
              <Spinner animation="border" size="sm" />
              <span>Decoding transaction…</span>
            </div>
          ) : null}

          {decodeError ? (
            <Alert variant="secondary" className="mt-3 mb-0">
              {decodeError}
            </Alert>
          ) : null}

          {decoded && valid && decodedTransaction ? (
            <TransactionSummary
              tx={decodedTransaction.transaction}
              method={decodedTransaction.method}
            />
          ) : null}
          {(status === TransactionStatus.BROADCASTED_INITIATED_TRANSACTION &&
            decoded &&
            valid) ||
          (status === TransactionStatus.BROADCASTED_TRANSACTION &&
            decoded &&
            valid) ? (
            <div>
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-link p-0 text-muted d-inline-flex align-items-center gap-2"
                  aria-expanded={showDecodedTx}
                  onClick={() => setShowDecodedTx(!showDecodedTx)}>
                  <span style={{ width: 16, textAlign: 'center' }}>
                    {showDecodedTx ? '▴' : '▾'}
                  </span>
                  <span>Transaction details (JSON)</span>
                </button>
                <div className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>
                  Click to expand and inspect the full payload.
                </div>
              </div>
              <Collapse in={showDecodedTx}>
                <Card>
                  <Card.Body>
                    <div id="example-collapse-text">
                      {decodedTransaction ? (
                        <ReactJson
                          src={decodedTransaction.transaction}
                          theme={getReactJsonTheme(resolvedTheme)}
                          style={{ backgroundColor: 'transparent' }}
                        />
                      ) : null}
                    </div>
                  </Card.Body>
                </Card>
              </Collapse>
            </div>
          ) : null}

          <div className="mt-2 d-flex justify-content-end">
            {(status === TransactionStatus.BROADCASTED_INITIATED_TRANSACTION ||
              status === TransactionStatus.BROADCASTED_TRANSACTION) &&
            !decoded ? (
              <Button
                variant="outline-primary"
                type="button"
                disabled={isDecoding}
                onClick={() => {
                  handleDecode();
                }}>
                Preview
              </Button>
            ) : null}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

const ExpiredTransactionCard = ({
  signRequest,
  account,
  isNew,
}: ITransactionProps) => {
  const [request, setRequest] = useState(signRequest);
  const [user, setAccount] = useState(account);
  const [status, setStatus] = useState(TransactionStatus.EXPIRED_TRANSACTION);
  const [initiated, setInitiated] = useState(false);
  const [creationDate, setCreationDate] = useState(undefined);
  const [expirationDate, setExpirationDate] = useState(undefined);
  const [decodedTransaction, setDecodedTransaction] =
    useState<ITransaction>(undefined);
  const [decoded, setDecoded] = useState(false);
  const [valid, setValid] = useState(false);
  const [showDecodedTx, setShowDecodedTx] = useState(false);
  const [themePreference] = useLocalStorage<ThemePreference>(
    'themePreference',
    'system',
  );
  const resolvedTheme = resolveTheme(themePreference);
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState<string | undefined>(undefined);
  const multisig = HiveMultisig.getInstance(window, MultisigUtils.getOptions());

  useEffect(() => {
    setRequest(signRequest);
  }, [signRequest]);

  useEffect(() => {
    setAccount(account);
  }, [account]);

  const createdByLabel =
    request?.initiator && user?.data?.username
      ? request.initiator === user.data.username
        ? 'you'
        : request.initiator
      : request?.initiator;

  const handleDecode = async () => {
    setIsDecoding(true);
    setDecodeError(undefined);
    try {
      const requestForDecode: any = {
        ...request,
        keyType: normalizeKeychainMethod((request as any)?.keyType),
      };
      const decodedTxs = await multisig.utils.decodeTransaction({
        signatureRequest: [requestForDecode],
        username: user.data.username,
      });
      if (decodedTxs) {
        setDecodedTransaction(decodedTxs[0]);
        setValid(true);
        setDecoded(true);
      } else {
        setStatus(TransactionStatus.INVALID);
        setValid(false);
        setDecoded(false);
      }
    } catch (error: any) {
      const message = error?.message ? String(error.message) : String(error);
      const isUserCancelled = /User ignored|User rejected/i.test(message);
      const isVerifyKey = /Could not verify key/i.test(message);

      if (isUserCancelled) {
        setDecodeError('Preview was cancelled in Keychain.');
      } else if (isVerifyKey) {
        setDecodeError(
          'Keychain could not verify the key for this account. Make sure you are logged into the correct account in Keychain and try again.',
        );
      } else {
        setDecodeError(message || 'Failed to decode transaction.');
        setStatus(TransactionStatus.INVALID);
      }
      setValid(false);
      setDecoded(false);
    } finally {
      setIsDecoding(false);
    }
  };
  useEffect(() => {
    if (request) {
      if (request.createdAt) {
        setCreationDate(toValidDate(request.createdAt));
      }
      if (request.expirationDate) {
        setExpirationDate(toValidDate(request.expirationDate));
      }
      setInitiated(initiatedByMe(request, user));
    }
  }, [request]);
  useEffect(() => {
    if (initiated) {
      setStatus(TransactionStatus.EXPIRED_INITIATED_TRANSACTION);
    }
  }, [initiated]);
  return (
    <div>
      <Card key={signRequest.id}>
        <Card.Body>
          <Card.Title className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span>{status}</span>
            {isNew ? (
              <div className="d-inline-flex align-items-center gap-2">
                <Badge bg="info">New</Badge>
              </div>
            ) : null}
          </Card.Title>
          {createdByLabel ? (
            <Card.Subtitle className="mb-2 text-muted">{`Created by: ${createdByLabel}`}</Card.Subtitle>
          ) : null}
          {creationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Creation: ${creationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}
          {expirationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Expiration: ${expirationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}

          {isDecoding ? (
            <div className="d-flex align-items-center gap-2 mt-3 text-muted">
              <Spinner animation="border" size="sm" />
              <span>Decoding transaction…</span>
            </div>
          ) : null}

          {decodeError ? (
            <Alert variant="secondary" className="mt-3 mb-0">
              {decodeError}
            </Alert>
          ) : null}

          {decoded && valid && decodedTransaction ? (
            <TransactionSummary
              tx={decodedTransaction.transaction}
              method={decodedTransaction.method}
            />
          ) : null}
          {decoded && valid ? (
            <div>
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-link p-0 text-muted d-inline-flex align-items-center gap-2"
                  aria-expanded={showDecodedTx}
                  onClick={() => setShowDecodedTx(!showDecodedTx)}>
                  <span style={{ width: 16, textAlign: 'center' }}>
                    {showDecodedTx ? '▴' : '▾'}
                  </span>
                  <span>Transaction details (JSON)</span>
                </button>
                <div className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>
                  Click to expand and inspect the full payload.
                </div>
              </div>
              <Collapse in={showDecodedTx}>
                <Card>
                  <Card.Body>
                    <div id="example-collapse-text">
                      {decodedTransaction ? (
                        <ReactJson
                          src={decodedTransaction.transaction}
                          theme={getReactJsonTheme(resolvedTheme)}
                          style={{ backgroundColor: 'transparent' }}
                        />
                      ) : null}
                    </div>
                  </Card.Body>
                </Card>
              </Collapse>
            </div>
          ) : null}

          <div className="mt-2 d-flex justify-content-end">
            {!decoded ? (
              <Button
                variant="outline-primary"
                type="button"
                disabled={isDecoding}
                onClick={() => {
                  handleDecode();
                }}>
                Preview
              </Button>
            ) : null}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export enum TransactionStatus {
  PENDING_INITIATED_TRANSACTION = 'Pending Initiated Transaction',
  PENDING_TRANSACTION = 'Pending Transaction',
  BROADCASTED_INITIATED_TRANSACTION = 'Broadcasted Initiated Transaction',
  BROADCASTED_TRANSACTION = 'Broadcasted Transaction',
  EXPIRED_INITIATED_TRANSACTION = 'Expired Initiated Transaction',
  EXPIRED_TRANSACTION = 'Expired Transaction',
  INVALID = 'Invalid',
}
const GetStatus = (
  signRequest: SignatureRequest,
  account: LoginResponseType,
) => {
  if (isPending(signRequest, account) && initiatedByMe(signRequest, account)) {
    return TransactionStatus.PENDING_INITIATED_TRANSACTION;
  } else if (
    isPending(signRequest, account) &&
    !initiatedByMe(signRequest, account)
  ) {
    return TransactionStatus.PENDING_TRANSACTION;
  } else if (
    isBroadcasted(signRequest) &&
    initiatedByMe(signRequest, account)
  ) {
    return TransactionStatus.BROADCASTED_INITIATED_TRANSACTION;
  } else if (
    isBroadcasted(signRequest) &&
    !initiatedByMe(signRequest, account)
  ) {
    return TransactionStatus.BROADCASTED_TRANSACTION;
  } else if (isExpired(signRequest) && initiatedByMe(signRequest, account)) {
    return TransactionStatus.EXPIRED_INITIATED_TRANSACTION;
  } else if (isExpired(signRequest) && !initiatedByMe(signRequest, account)) {
    return TransactionStatus.EXPIRED_TRANSACTION;
  } else {
    return undefined;
  }
};

const isExpired = (signRequest: SignatureRequest) => {
  return signRequest.status === 'expired';
};

const isSignedd = (signRequest: SignatureRequest) => {
  return signRequest.status === 'signed';
};

const isBroadcasted = (signRequest: SignatureRequest) => {
  return signRequest.broadcasted || signRequest.status === 'broadcasted';
};

const isPending = (
  signRequest: SignatureRequest,
  account: LoginResponseType,
) => {
  return (
    !isBroadcasted(signRequest) &&
    !isExpired(signRequest) &&
    signRequest.status !== 'expired'
  );
};

const initiatedByMe = (
  signRequest: SignatureRequest,
  account: LoginResponseType,
) => {
  if (!account) return false;
  const me = account?.data?.username;
  const initiator = (signRequest as any)?.initiator;
  return Boolean(me && initiator && initiator === me);
};
const signedByMe = (
  signRequest: SignatureRequest,
  account: LoginResponseType,
) => {
  const signatures =
    signRequest && account
      ? signRequest.signers
          .filter((signer) => signer.publicKey === account.publicKey)
          .map((tx) => tx.signature)
      : [];
  return signatures.includes('') || signatures.includes(undefined);
};
