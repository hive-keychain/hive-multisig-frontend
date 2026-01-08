import { HiveMultisig } from 'hive-multisig-sdk/src';
import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import './App.css';
import NavBar from './components/navigating/NavBar';
import Routing from './components/navigating/Routing';
import { Config } from './config';
import { useAppDispatch, useAppSelector } from './redux/app/hooks';
import { LoginState, loginActions } from './redux/features/login/loginSlice';
import { multisigActions } from './redux/features/multisig/multisigSlices';
import {
  addBroadcastNotifications,
  addBroadcastedTransaction,
  addPendingSignRequest,
  addSignRequest,
  notifyBroadcastedTransaction,
  notifySignRequest,
  resetBroadcastNotifications,
  signerConnectActive,
  signerConnectPosting,
  subscribeToBroadcastedTransactions,
  subscribeToSignRequests,
} from './redux/features/multisig/multisigThunks';
import { transactionActions } from './redux/features/transaction/transactionSlices';
import { twoFactorAuthActions } from './redux/features/twoFactorAuth/twoFactorAuthSlices';
import { updateAuthorityActions } from './redux/features/updateAuthorities/updateAuthoritiesSlice';
import { MultisigUtils } from './utils/multisig.utils';
import {
  getElapsedTimestampSeconds,
  getTimestampInSeconds,
} from './utils/utils';

function App() {
  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loginExpirationInSec = Config.login.expirationInSec;
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const loginState = useAppSelector((state) => state.login.loginState);

  const signRequests = useAppSelector((state) => state.multisig.multisig.signRequests);

  const [accountDetails, setStorageAccountDetails] = useLocalStorage(
    'accountDetails',
    signedAccountObj,
  );

  const [loginTimestamp, setLoginTimestamp] = useLocalStorage(
    'loginTimestap',
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
      if (
        confirm('Received new sign request.\nClick OK to view the request.')
      ) {
        navigate('/signRequest');
      }
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
      if (
        confirm(
          'A transaction has been broadcasted.\nClick OK to view the transactions.',
        )
      ) {
        navigate('/signRequest');
      }
      dispatch(notifyBroadcastedTransaction(false));
    }
  }, [receiveBroadcastNotificationOn, broadcastNotif, loginState, loginTimestamp, dispatch, navigate]);

  useEffect(() => {
    if (onLoginBroadcastNotif && loginState !== LoginState.LOGGED_OUT) {
      if (onLoginBroadcastNotif.length > 0) {
        if (!shouldShowPopup('login-broadcast')) {
          return;
        }
        if (
          confirm(
            `${
              onLoginBroadcastNotif.length > 1
                ? onLoginBroadcastNotif.length
                : 'A'
            } transaction${
              onLoginBroadcastNotif.length > 1 ? 's' : ''
            } has been broadcasted.\nClick OK to view the transactions.`,
          )
        ) {
          navigate('/signRequest');
        }
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
        ? `You have 1 pending sign request to sign.\n${hint}\nClick OK to view it.`
        : `You have ${pendingToSign.length} pending sign requests to sign.\n${hint}\nClick OK to view them.`;

    if (confirm(message)) {
      navigate('/signRequest');
    }
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
    if (connectActiveKey && connectPostingKey && isLoggedIn()) {
      setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
    } else {
    }
  }, [connectActiveKey, connectPostingKey]);

  useEffect(() => {
    // If we have at least one connect message (posting or active), we can
    // initialize the instance and let connectToBackend do the rest.
    if (!multisig && isLoggedIn() && (activeConnectMessage || postingConnectMessage)) {
      setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
    }
  }, [multisig, activeConnectMessage, postingConnectMessage, loginTimestamp]);

  useEffect(() => {
    const hasAnyConnectMessage = Boolean(
      activeConnectMessage || postingConnectMessage,
    );

    // Important: don't mark "connected" until we actually have the connect messages.
    // Otherwise App can run connectToBackend too early (no messages), set the guard,
    // and then never load sign requests until a page triggers its own fetch.
    if (multisig && loginState !== LoginState.LOGGED_OUT && hasAnyConnectMessage) {
      if (!didConnectToBackendRef.current) {
        didConnectToBackendRef.current = true;
        connectToBackend();
      }
    }
  }, [
    multisig,
    loginState,
    activeConnectMessage,
    postingConnectMessage,
  ]);

  useEffect(() => {
    if (!isLoggedIn()) {
      handleLogout();
      navigate('/login');
    }
  });

  const isLoggedIn = () => {
    const loggedinDuration = getElapsedTimestampSeconds(
      loginTimestamp,
      getTimestampInSeconds(),
    );
    return !(loginTimestamp > 0 && loggedinDuration >= loginExpirationInSec);
  };

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
    // Keep in sync with SignRequestsPage.getSignRequests so data is available
    // immediately on login (for popups) even before navigating.
    if (activeConnectMessage) {
      try {
        const activeReqs = await multisig.api.getSignatureRequests(
          activeConnectMessage,
        );
        if (activeReqs) {
          dispatch(addSignRequest(activeReqs));
        }
      } catch (error) {
        console.log(`activeConnect getSignatureRequests: ${error}`);
      }
    }

    if (postingConnectMessage) {
      try {
        const postingReqs = await multisig.api.getSignatureRequests(
          postingConnectMessage,
        );
        if (postingReqs) {
          dispatch(addSignRequest(postingReqs));
        }
      } catch (error) {
        console.log(`postingConnect getSignatureRequests: ${error}`);
      }
    }
  };

  const signRequestCallback = async (message: SignatureRequest) => {
    if (message) {
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
      if (Date.now() >= suppressRealtimeNotifsUntilRef.current) {
        await dispatch(notifyBroadcastedTransaction(true));
      }
    }
  };

  const connectActive = async () => {
    if (activeConnectMessage) {
      const signerConnectResponse = await multisig.wss.subscribe(
        activeConnectMessage,
      );
      if (signerConnectResponse.result) {
        if (signerConnectResponse.result.pendingSignatureRequests) {
          const pendingReqs =
            signerConnectResponse.result.pendingSignatureRequests[
              activeConnectMessage.username
            ];
          if (pendingReqs?.length > 0) {
            await dispatch(addSignRequest(pendingReqs));
            let myReqs: SignatureRequest[] = [];
            pendingReqs.forEach((req) => {
              if (req.initiator !== activeConnectMessage.username) {
                myReqs.push(req);
              }
            });
            dispatch(addPendingSignRequest(myReqs));
          }
        }

        if (signerConnectResponse.result.notifications) {
          const notifications =
            signerConnectResponse.result.notifications[
              activeConnectMessage.username
            ];
          if (notifications?.length > 0) {
            await dispatch(addBroadcastNotifications(notifications));
          }
        }
        await dispatch(signerConnectActive(signerConnectResponse));
      } else {
        console.log('connectActive Failed');
      }
    }
  };

  const connectPosting = async () => {
    if (postingConnectMessage) {
      const signerConnectResponse = await multisig.wss.subscribe(
        postingConnectMessage,
      );
      if (signerConnectResponse.result) {
        if (signerConnectResponse.result.pendingSignatureRequests) {
          const pendingReqs =
            signerConnectResponse.result.pendingSignatureRequests[
              postingConnectMessage.username
            ];
          if (pendingReqs.length > 0) {
            await dispatch(addSignRequest(pendingReqs));
            let myReqs: SignatureRequest[] = [];
            pendingReqs.forEach((req) => {
              if (req.initiator !== postingConnectMessage.username) {
                myReqs.push(req);
              }
            });
            dispatch(addPendingSignRequest(myReqs));
          }
        }
        if (signerConnectResponse.result.notifications) {
          const notifications =
            signerConnectResponse.result.notifications[
              postingConnectMessage.username
            ];
          if (notifications?.length > 0) {
            await dispatch(addBroadcastNotifications(notifications));
          }
        }
        await dispatch(signerConnectPosting(signerConnectResponse));
      } else {
        console.log('connectPosting Failed');
      }
    }
  };

  const connectToBackend = async () => {
    // Avoid double notifications: login connect can deliver pending items + websocket can replay.
    // We still add incoming items, but suppress "new" popups briefly during initial sync.
    suppressRealtimeNotifsUntilRef.current = Date.now() + 12000;
    await connectPosting();
    await connectActive();
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
      <footer className="footer-text">@2023 Hive Keychain</footer>
    </div>
  );
}
export default App;
