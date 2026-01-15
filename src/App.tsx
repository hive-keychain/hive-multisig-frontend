import { HiveMultisig } from 'hive-multisig-sdk/src';
import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import './App.css';
import NavBar from './components/navigating/NavBar';
import GlobalToasts from './components/navigating/GlobalToasts';
import Routing from './components/navigating/Routing';
import { Config } from './config';
import { useAppDispatch, useAppSelector } from './redux/app/hooks';
import { multisigActions } from './redux/features/multisig/multisigSlices';
import { LoginState, loginActions } from './redux/features/login/loginSlice';
import {
  addBroadcastNotifications,
  addBroadcastedTransaction,
  addPendingSignRequest,
  addSignRequest,
  notifyBroadcastedTransaction,
  notifySignRequest,
  resetBroadcastNotifications,
  signerConnectActive,
  signerConnectMessageActive,
  signerConnectMessagePosting,
  signerConnectPosting,
  subscribeToBroadcastedTransactions,
  subscribeToSignRequests,
} from './redux/features/multisig/multisigThunks';
import { transactionActions } from './redux/features/transaction/transactionSlices';
import { twoFactorAuthActions } from './redux/features/twoFactorAuth/twoFactorAuthSlices';
import { updateAuthorityActions } from './redux/features/updateAuthorities/updateAuthoritiesSlice';
import { MultisigUtils } from './utils/multisig.utils';
import { notifyInfo, SUPPRESS_BROADCAST_TOAST_UNTIL_MS_KEY } from './utils/notify';
import {
  isSessionExpired,
  isSessionValid,
  LOGIN_TIMESTAMP_STORAGE_KEY,
  parseLoginTimestampSeconds,
} from './utils/session';
import {
  getTimestampInSeconds,
} from './utils/utils';

function App() {
  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const loginExpirationInSec = Config.login.expirationInSec;
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const loginState = useAppSelector((state) => state.login.loginState);

  const isDebugSignersOn = () => {
    try {
      return window.localStorage.getItem('multisig:debugSigners') === '1';
    } catch {
      return false;
    }
  };

  const debugReq = (prefix: string, req: SignatureRequest) => {
    if (!isDebugSignersOn() || !req) return;
    const signers = (req as any)?.signers;
    const signerCount = Array.isArray(signers) ? signers.length : -1;
    const signerKeys = Array.isArray(signers)
      ? signers.map((s: any) => ({
          k: String(s?.publicKey ?? ''),
          sig: Boolean(s?.signature && String(s.signature).length > 0),
          ref: Boolean(s?.refused),
        }))
      : [];
    // eslint-disable-next-line no-console
    console.log(`[multisig debug] ${prefix}`, {
      id: String((req as any).id),
      initiator: (req as any).initiator,
      status: (req as any).status,
      keyType: (req as any).keyType,
      signers: signerCount,
      signerKeys,
    });
  };

  const signRequests = useAppSelector((state) => state.multisig.multisig.signRequests);

  const [accountDetails, setStorageAccountDetails] = useLocalStorage(
    'accountDetails',
    signedAccountObj,
  );

  const [loginTimestamp, setLoginTimestamp] = useLocalStorage(
    LOGIN_TIMESTAMP_STORAGE_KEY,
    null,
  );

  const signRequestNotif = useAppSelector(
    (state) => state.multisig.multisig.signRequestNotification,
  );

  const broadcastNotif = useAppSelector(
    (state) => state.multisig.multisig.broadcastNotification,
  );

  const onLoginBroadcastNotif = useAppSelector(
    (state) => state.multisig.multisig.userNotifications,
  );

  const connectActiveKey = useAppSelector(
    (state) => state.multisig.multisig.signerConnectActive,
  );

  const connectPostingKey = useAppSelector(
    (state) => state.multisig.multisig.signerConnectPosting,
  );

  const didConnectToBackendRef = useRef(false);
  const suppressRealtimeNotifsUntilRef = useRef<number>(0);
  const signRequestIdsRef = useRef<Set<string>>(new Set());
  const loginSessionIdRef = useRef<string>('');
  const lastBackendConnectKeyRef = useRef<string>('');
  const signatureRequestsFetchInFlightRef = useRef(false);
  const lastSignatureRequestsFetchMsRef = useRef(0);

  const postingConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessagePosting,
  );

  const activeConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessageActive,
  );

  const receiveBroadcastNotificationOn = useAppSelector(
    (state) => state.multisig.multisig.receiveBroadcastNotificationsOn,
  );

  useEffect(() => {
    const next = new Set<string>();
    (signRequests ?? []).forEach((sr) => next.add(String(sr.id)));
    signRequestIdsRef.current = next;
  }, [signRequests]);

  useEffect(() => {
    if (loginState !== LoginState.LOGGED_OUT) {
      if (!loginSessionIdRef.current) {
        const username = signedAccountObj?.data?.username ?? 'unknown';
        loginSessionIdRef.current = `${username}:${Date.now()}`;
      }
    } else {
      loginSessionIdRef.current = '';
    }
  }, [loginState, signedAccountObj?.data?.username]);

  useEffect(() => {
    // Allow reconnect on each new login. Without this, the app can get into a state
    // where the previous session set didConnectToBackendRef=true and the new session
    // never loads sign requests (so no popup until a full refresh).
    if (loginState === LoginState.LOGGED_OUT) {
      lastBackendConnectKeyRef.current = '';
      didConnectToBackendRef.current = false;
      return;
    }

    const username = signedAccountObj?.data?.username ?? '';
    const postingUser = postingConnectMessage?.username ?? '';
    const activeUser = activeConnectMessage?.username ?? '';
    const postingMethod = (postingConnectMessage as any)?.keyType ?? '';
    const activeMethod = (activeConnectMessage as any)?.keyType ?? '';

    const connectKey = [
      username,
      postingUser,
      postingMethod,
      activeUser,
      activeMethod,
    ].join('|');

    if (connectKey && connectKey !== lastBackendConnectKeyRef.current) {
      lastBackendConnectKeyRef.current = connectKey;
      didConnectToBackendRef.current = false;
      // Also re-arm realtime suppression for the upcoming sync.
      suppressRealtimeNotifsUntilRef.current = 0;
    }
  }, [
    loginState,
    signedAccountObj?.data?.username,
    postingConnectMessage,
    activeConnectMessage,
  ]);

  const shouldShowPopup = (key: string, ttlMs = 30000) => {
    try {
      // Scope popup dedupe to a login session so a previous session doesn't
      // accidentally suppress the next login's notifications.
      // Note: loginTimestamp may not be set yet right after login.
      const sessionKey =
        loginTimestamp ? String(loginTimestamp) : loginSessionIdRef.current || '0';
      const storageKey = `multisig:lastPopup:${sessionKey}:${key}`;
      const now = Date.now();
      const last = Number(window.localStorage.getItem(storageKey) ?? '0');
      if (Number.isFinite(last) && now - last < ttlMs) return false;
      window.localStorage.setItem(storageKey, String(now));
      return true;
    } catch {
      // If localStorage is blocked, fall back to showing the popup.
      return true;
    }
  };

  const isExpired = (req: SignatureRequest) => req?.status === 'expired';

  const isBroadcasted = (req: SignatureRequest) =>
    Boolean((req as any)?.broadcasted) || req?.status === 'broadcasted';

  const isPending = (req: SignatureRequest) =>
    !isBroadcasted(req) && !isExpired(req) && req?.status !== 'expired';

  const initiatedByMe = (req: SignatureRequest) => {
    const me = signedAccountObj?.data?.username;
    const initiator = (req as any)?.initiator;
    return Boolean(me && initiator && initiator === me);
  };

  const getRequestedKeyTypes = (): { posting: boolean; active: boolean } => {
    try {
      const raw = localStorage.getItem('multisig:loginRequestedKeyTypes');
      if (!raw) return { posting: true, active: true };
      const parsed = JSON.parse(raw);
      return {
        posting: parsed?.posting !== false,
        active: parsed?.active !== false,
      };
    } catch {
      return { posting: true, active: true };
    }
  };

  const getAvailableSignerPublicKeys = (): string[] => {
    const keys: string[] = [];
    const postingKey = postingConnectMessage?.publicKey;
    const activeKey = activeConnectMessage?.publicKey;
    if (typeof postingKey === 'string' && postingKey.length > 0) keys.push(postingKey);
    if (typeof activeKey === 'string' && activeKey.length > 0) keys.push(activeKey);
    return keys;
  };

  const needsSignatureForAnyAvailableKey = (req: SignatureRequest, keys: string[]) => {
    if (!Array.isArray(keys) || keys.length === 0) return false;
    const signers = (req as any)?.signers;
    if (!Array.isArray(signers)) return false;
    return signers.some((s: any) => {
      if (!s?.publicKey || !keys.includes(String(s.publicKey))) return false;
      const sig = s.signature;
      return sig === '' || sig === undefined || sig === null;
    });
  };

  // NOTE: We intentionally do not try to decide “needs my signature” here.
  // Users can log in with Posting first (publicKey mismatch for Active requests),
  // and we still want to warn them there are pending requests to review.

  useEffect(() => {
    if (signRequestNotif && loginState !== LoginState.LOGGED_OUT) {
      if (!shouldShowPopup('realtime-signrequest')) {
        dispatch(notifySignRequest(false));
        return;
      }
      notifyInfo('Received a new sign request.', {
        action: {
          label: 'View',
          onClick: () => navigate('/signRequest'),
        },
      });
      dispatch(notifySignRequest(false));
    }
  }, [signRequestNotif, loginState, loginTimestamp, dispatch, navigate]);

  useEffect(() => {
    if (
      receiveBroadcastNotificationOn &&
      broadcastNotif &&
      loginState !== LoginState.LOGGED_OUT
    ) {
      if (!shouldShowPopup('realtime-broadcast')) {
        dispatch(notifyBroadcastedTransaction(false));
        return;
      }
      notifyInfo('A transaction has been broadcasted.', {
        action: {
          label: 'View',
          onClick: () => navigate('/signRequest'),
        },
      });
      dispatch(notifyBroadcastedTransaction(false));
    }
  }, [receiveBroadcastNotificationOn, broadcastNotif, loginState, loginTimestamp, dispatch, navigate]);

  useEffect(() => {
    if (onLoginBroadcastNotif && loginState !== LoginState.LOGGED_OUT) {
      if (onLoginBroadcastNotif.length > 0) {
        if (!shouldShowPopup('login-broadcast')) {
          return;
        }
        notifyInfo(
          `${
            onLoginBroadcastNotif.length > 1
              ? onLoginBroadcastNotif.length
              : 'A'
          } transaction${onLoginBroadcastNotif.length > 1 ? 's' : ''} has been broadcasted.`,
          {
            action: {
              label: 'View',
              onClick: () => navigate('/signRequest'),
            },
          },
        );
        dispatch(resetBroadcastNotifications());
      }
    }
  }, [onLoginBroadcastNotif, loginState, loginTimestamp, dispatch, navigate]);

  useEffect(() => {
    // Canonical login popup: derive from signRequests so we always know what still needs signing,
    // even if userPendingSignatureRequest was cleared/persisted.
    if (loginState === LoginState.LOGGED_OUT) return;
    if (!isLoggedIn()) return;
    if (!signedAccountObj?.data?.username) return;

    const requested = getRequestedKeyTypes();
    // If the user requested both posting+active, don't warn until both proofs are done.
    if (requested.posting && !postingConnectMessage) return;
    if (requested.active && !activeConnectMessage) return;

    const availableKeys = getAvailableSignerPublicKeys();
    if (availableKeys.length === 0) return;

    const pendingToSign = (signRequests ?? []).filter(
      (req) =>
        isPending(req) &&
        !initiatedByMe(req) &&
        needsSignatureForAnyAvailableKey(req, availableKeys),
    );

    if (pendingToSign.length === 0) return;
    if (!shouldShowPopup('login-pending-derived', 2 * 60 * 1000)) return;

    const first = pendingToSign[0];
    const createdBy = (first as any)?.initiator ? `@${(first as any).initiator}` : 'unknown';
    const hint = first?.id !== undefined ? `Next: #${String(first.id)} (created by ${createdBy})` : '';

    const message =
      pendingToSign.length === 1
        ? `You have 1 pending sign request to sign.${hint ? `\n${hint}` : ''}`
        : `You have ${pendingToSign.length} pending sign requests to sign.${hint ? `\n${hint}` : ''}`;

    notifyInfo(message, {
      timeoutMs: 12000,
      action: {
        label: 'View',
        onClick: () => navigate('/signRequest'),
      },
    });
  }, [
    signRequests,
    loginState,
    loginTimestamp,
    signedAccountObj?.data?.username,
    postingConnectMessage,
    activeConnectMessage,
    dispatch,
    navigate,
  ]);

  useEffect(() => {
    // On refresh we may have a valid session but no (or stale) connect messages.
    // Always initialize the instance when the session is valid; connectToBackend
    // will (re)handshake as needed.
    if (!multisig && loginState !== LoginState.LOGGED_OUT && isLoggedIn()) {
      setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
    }
  }, [multisig, loginState, loginTimestamp]);

  useEffect(() => {
    const username = signedAccountObj?.data?.username ?? '';
    if (!username) return;

    if (multisig && loginState !== LoginState.LOGGED_OUT && isLoggedIn()) {
      if (!didConnectToBackendRef.current) {
        didConnectToBackendRef.current = true;
        connectToBackend();
      }
    }
  }, [multisig, loginState, loginTimestamp, signedAccountObj?.data?.username]);

  useEffect(() => {
    if (!multisig) return;
    if (loginState === LoginState.LOGGED_OUT) return;
    if (!isLoggedIn()) return;

    // Avoid doubling API traffic: the Sign Requests page already polls/refreshes.
    if (location.pathname === '/signRequest') return;

    let disposed = false;

    const refresh = () => {
      if (disposed) return;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }

      // Avoid overlapping refreshes and excessive bursts on mount.
      if (signatureRequestsFetchInFlightRef.current) return;
      const now = Date.now();
      if (now - lastSignatureRequestsFetchMsRef.current < 5000) return;
      lastSignatureRequestsFetchMsRef.current = now;
      signatureRequestsFetchInFlightRef.current = true;
      void (async () => {
        try {
          await fetchSignatureRequests();
        } finally {
          signatureRequestsFetchInFlightRef.current = false;
        }
      })();
    };

    // Keep initiated + pending requests reasonably fresh even if websocket payloads are partial.
    refresh();
    const intervalId = window.setInterval(refresh, 45000);

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
    loginState,
    loginTimestamp,
    activeConnectMessage,
    postingConnectMessage,
    location.pathname,
  ]);

  useEffect(() => {
    // Only force-logout when we can positively determine the session expired.
    // During login, loginTimestamp may still be unset; treating that as "expired"
    // causes route thrash between /login and /transaction and can interrupt Keychain.
    if (loginState === LoginState.LOGGED_OUT) return;

    // If we don't have a valid timestamp yet, we can't reliably decide expiration.
    // This is normal during the login flow while localStorage updates propagate.
    if (parseLoginTimestampSeconds(loginTimestamp) === null) return;

    if (
      !isSessionExpired(
        loginTimestamp,
        loginExpirationInSec,
        getTimestampInSeconds(),
      )
    )
      return;

    void (async () => {
      await handleLogout();
      navigate('/login', { replace: true });
    })();
  }, [loginState, loginTimestamp, loginExpirationInSec, navigate]);

  const isLoggedIn = () =>
    isSessionValid(loginTimestamp, loginExpirationInSec, getTimestampInSeconds());

  const subToSignRequests = async () => {
    try {
      const subscribeRes = await multisig.wss.onReceiveSignRequest(
        signRequestCallback,
      );
      dispatch(subscribeToSignRequests(subscribeRes));
    } catch {
      console.error('subToSignRequests failed');
    }
  };

  const subToBroadcastedTransactions = async () => {
    try {
      const subscribeRes = await multisig.wss.onBroadcasted(
        broadcastedTransactionCallback,
      );
      dispatch(subscribeToBroadcastedTransactions(subscribeRes));
    } catch {
      console.error('subToBroadcastedTransactions failed');
    }
  };

  const fetchSignatureRequests = async () => {
    if (!multisig) return;
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

      if (isDebugSignersOn()) {
        // eslint-disable-next-line no-console
        console.log('[multisig debug] applied pending signer seed (App)', {
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

    // Keep in sync with SignRequestsPage.getSignRequests so data is available
    // immediately on login (for popups) even before navigating.
    if (activeConnectMessage) {
      try {
        const activeReqs = await multisig.api.getSignatureRequests(
          activeConnectMessage,
        );
        if (activeReqs) {
          if (isDebugSignersOn()) {
            activeReqs.forEach((r) => debugReq('api.getSignatureRequests(active)', r));
          }
          dispatch(addSignRequest(activeReqs));
          tryApplyPendingSignerSeed(activeReqs);
        }
      } catch (error) {
        if (isDebugSignersOn()) {
          // eslint-disable-next-line no-console
          console.log(`activeConnect getSignatureRequests: ${error}`);
        }
      }
    }

    if (postingConnectMessage) {
      try {
        const postingReqs = await multisig.api.getSignatureRequests(
          postingConnectMessage,
        );
        if (postingReqs) {
          if (isDebugSignersOn()) {
            postingReqs.forEach((r) => debugReq('api.getSignatureRequests(posting)', r));
          }
          dispatch(addSignRequest(postingReqs));
          tryApplyPendingSignerSeed(postingReqs);
        }
      } catch (error) {
        if (isDebugSignersOn()) {
          // eslint-disable-next-line no-console
          console.log(`postingConnect getSignatureRequests: ${error}`);
        }
      }
    }
  };

  const signRequestCallback = async (message: SignatureRequest) => {
    if (message) {
      debugReq('wss.onReceiveSignRequest', message);
      const id = String(message.id);
      const alreadyKnown = signRequestIdsRef.current.has(id);
      await dispatch(addSignRequest([message]));

      // Don't notify for messages we already had (e.g. initial sync replay).
      if (alreadyKnown) return;

      if (
        Date.now() >= suppressRealtimeNotifsUntilRef.current &&
        message.initiator !== signedAccountObj.data.username
      ) {
        await dispatch(notifySignRequest(true));
      }
    }
  };

  const broadcastedTransactionCallback = async (message: SignatureRequest) => {
    if (message) {
      await dispatch(addBroadcastedTransaction([message]));
      const initiator = String((message as any)?.initiator ?? '');
      const me = String(signedAccountObj?.data?.username ?? '');
      const initiatedByMe = Boolean(me) && initiator === me;

      // If this tab just triggered a broadcast action, we already show an
      // immediate success toast. Suppress the websocket toast for a short window.
      try {
        const raw = window.localStorage.getItem(SUPPRESS_BROADCAST_TOAST_UNTIL_MS_KEY);
        const suppressUntil = raw ? Number(raw) : NaN;
        if (Number.isFinite(suppressUntil)) {
          if (Date.now() < suppressUntil) return;
          window.localStorage.removeItem(SUPPRESS_BROADCAST_TOAST_UNTIL_MS_KEY);
        }
      } catch {
        // ignore
      }

      // Avoid duplicate UX: the Transactions page already shows a local toast
      // when the user broadcasts/submits. Only notify globally for other people's
      // broadcasts.
      if (!initiatedByMe && Date.now() >= suppressRealtimeNotifsUntilRef.current) {
        await dispatch(notifyBroadcastedTransaction(true));
      }
    }
  };

  const connectActive = async () => {
    if (!multisig) return;
    const username = signedAccountObj?.data?.username ?? '';
    if (!username) return;

    let signerConnectResponse: any | undefined;
    try {
      if (activeConnectMessage) {
        signerConnectResponse = await multisig.wss.subscribe(activeConnectMessage);
      } else {
        signerConnectResponse = await multisig.wss.subscribe({
          username,
          keyType: KeychainKeyTypes.active,
        });
      }
    } catch {
      // ignore and retry below
    }

    // If a persisted connect message is stale/invalid, retry with a fresh handshake.
    if (!signerConnectResponse?.result && activeConnectMessage) {
      try {
        signerConnectResponse = await multisig.wss.subscribe({
          username,
          keyType: KeychainKeyTypes.active,
        });
      } catch {
        // ignore
      }
    }

    if (signerConnectResponse?.result) {
      // Store the fresh connect message for subsequent API calls.
      if (signerConnectResponse.message && signerConnectResponse.publicKey) {
        dispatch(
          signerConnectMessageActive({
            username,
            message: signerConnectResponse.message,
            publicKey: signerConnectResponse.publicKey,
            keyType: KeychainKeyTypes.active,
          }),
        );
      }

      if (signerConnectResponse.result.pendingSignatureRequests) {
        const pendingReqs = signerConnectResponse.result.pendingSignatureRequests[username];
        if (pendingReqs?.length > 0) {
          await dispatch(addSignRequest(pendingReqs));
          let myReqs: SignatureRequest[] = [];
          pendingReqs.forEach((req: SignatureRequest) => {
            if ((req as any).initiator !== username) {
              myReqs.push(req);
            }
          });
          dispatch(addPendingSignRequest(myReqs));
        }
      }

      if (signerConnectResponse.result.notifications) {
        const notifications = signerConnectResponse.result.notifications[username];
        if (notifications?.length > 0) {
          await dispatch(addBroadcastNotifications(notifications));
        }
      }

      await dispatch(signerConnectActive(signerConnectResponse));
    } else {
      if (isDebugSignersOn()) {
        // eslint-disable-next-line no-console
        console.log('connectActive Failed');
      }
    }
  };

  const connectPosting = async () => {
    if (!multisig) return;
    const username = signedAccountObj?.data?.username ?? '';
    if (!username) return;

    let signerConnectResponse: any | undefined;
    try {
      if (postingConnectMessage) {
        signerConnectResponse = await multisig.wss.subscribe(postingConnectMessage);
      } else {
        signerConnectResponse = await multisig.wss.subscribe({
          username,
          keyType: KeychainKeyTypes.posting,
        });
      }
    } catch {
      // ignore and retry below
    }

    // If a persisted connect message is stale/invalid, retry with a fresh handshake.
    if (!signerConnectResponse?.result && postingConnectMessage) {
      try {
        signerConnectResponse = await multisig.wss.subscribe({
          username,
          keyType: KeychainKeyTypes.posting,
        });
      } catch {
        // ignore
      }
    }

    if (signerConnectResponse?.result) {
      // Store the fresh connect message for subsequent API calls.
      if (signerConnectResponse.message && signerConnectResponse.publicKey) {
        dispatch(
          signerConnectMessagePosting({
            username,
            message: signerConnectResponse.message,
            publicKey: signerConnectResponse.publicKey,
            keyType: KeychainKeyTypes.posting,
          }),
        );
      }

      if (signerConnectResponse.result.pendingSignatureRequests) {
        const pendingReqs = signerConnectResponse.result.pendingSignatureRequests[username];
        if (pendingReqs?.length > 0) {
          await dispatch(addSignRequest(pendingReqs));
          let myReqs: SignatureRequest[] = [];
          pendingReqs.forEach((req: SignatureRequest) => {
            if ((req as any).initiator !== username) {
              myReqs.push(req);
            }
          });
          dispatch(addPendingSignRequest(myReqs));
        }
      }
      if (signerConnectResponse.result.notifications) {
        const notifications = signerConnectResponse.result.notifications[username];
        if (notifications?.length > 0) {
          await dispatch(addBroadcastNotifications(notifications));
        }
      }
      await dispatch(signerConnectPosting(signerConnectResponse));
    } else {
      if (isDebugSignersOn()) {
        // eslint-disable-next-line no-console
        console.log('connectPosting Failed');
      }
    }
  };

  const connectToBackend = async () => {
    // Avoid double notifications: login connect can deliver pending items + websocket can replay.
    // We still add incoming items, but suppress "new" popups briefly during initial sync.
    suppressRealtimeNotifsUntilRef.current = Date.now() + 12000;
    const requested = getRequestedKeyTypes();
    if (requested.posting) await connectPosting();
    if (requested.active) await connectActive();
    await fetchSignatureRequests();
    await subToSignRequests();
    await subToBroadcastedTransactions();
  };

  const handleLogout = async () => {
    setLoginTimestamp(0);
    setStorageAccountDetails(null);
    await dispatch(loginActions.logout());
    await dispatch(multisigActions.resetState());
    await dispatch(transactionActions.resetState());
    await dispatch(updateAuthorityActions.resetState());
    await dispatch(twoFactorAuthActions.resetState());
    setMultisig(undefined);
    didConnectToBackendRef.current = false;
    suppressRealtimeNotifsUntilRef.current = 0;
  };

  return (
    <div className="App app-shell">
      <NavBar />
      <main className="app-main">
        <Container className="app-container">
          <Routing />
        </Container>
      </main>
      <GlobalToasts />
      <footer className="footer-text">@2023 Hive Keychain</footer>
    </div>
  );
}
export default App;
