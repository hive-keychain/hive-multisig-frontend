import { HiveMultisig } from 'hive-multisig-sdk/src';
import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
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

  const onLoginNotif = useAppSelector(
    (state) => state.multisig.multisig.userNotifications,
  );

  const connectActiveKey = useAppSelector(
    (state) => state.multisig.multisig.signerConnectActive,
  );
  const connectPostingKey = useAppSelector(
    (state) => state.multisig.multisig.signerConnectActive,
  );
  const postingConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessagePosting,
  );
  const activeConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessageActive,
  );

  useEffect(() => {
    if (signRequestNotif && loginState !== LoginState.LOGGED_OUT) {
      alert('Received new sign request');
      navigate('/signRequest');
      dispatch(notifySignRequest(false));
    }
  }, [signRequestNotif]);
  useEffect(() => {
    if (broadcastNotif && loginState !== LoginState.LOGGED_OUT) {
      alert('A transaction has been broadcasted');
      navigate('/signRequest');
      dispatch(notifyBroadcastedTransaction(false));
    }
  }, [broadcastNotif]);

  useEffect(() => {
    if (onLoginNotif && loginState !== LoginState.LOGGED_OUT) {
      if (onLoginNotif.length > 0) {
        alert(
          `${onLoginNotif.length > 1 ? onLoginNotif.length : 'A'} transaction${
            onLoginNotif.length > 1 ? 's' : ''
          } has been broadcasted`,
        );
        navigate('/signRequest');
        dispatch(resetBroadcastNotifications());
      }
    }
  }, [onLoginNotif]);

  useEffect(() => {
    if (connectActiveKey && connectPostingKey && isLoggedIn()) {
      setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
    } else {
    }
  }, [connectActiveKey, connectPostingKey]);
  useEffect(() => {
    if (multisig && loginState !== LoginState.LOGGED_OUT) {
      connectToBackend();
    } else {
      console.log(`multisig: ${multisig}`);
    }
  }, [multisig, loginState]);

  useEffect(() => {
    if (!isLoggedIn()) {
      handleLogout();
      navigate('/');
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
  const signRequestCallback = async (message: SignatureRequest) => {
    if (message) {
      await dispatch(addSignRequest([message]));
      if (message.initiator !== signedAccountObj.data.username) {
        await dispatch(notifySignRequest(true));
      }
    }
  };
  const broadcastedTransactionCallback = async (message: SignatureRequest) => {
    if (message) {
      await dispatch(addBroadcastedTransaction([message]));
      await dispatch(notifyBroadcastedTransaction(true));
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
    await connectPosting();
    await connectActive();
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
    setMultisig(undefined);
  };

  return (
    <div className="App">
      <NavBar />
      <div style={{ flex: 1 }}>
        <Container
          style={{
            marginTop: 50,
          }}>
          <Routing />
        </Container>
      </div>
      <div className="footer-text">@2023 Hive Keychain</div>
    </div>
  );
}
export default App;
