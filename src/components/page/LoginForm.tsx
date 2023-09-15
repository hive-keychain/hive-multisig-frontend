import { HiveMultisig } from 'hive-multisig-sdk/src';
import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';

import { KeychainKeyTypes } from 'hive-keychain-commons';
import { useEffect, useRef, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import { Config } from '../../config';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { login } from '../../redux/features/login/loginSlice';
import {
  addBroadcastedTransaction,
  addSignRequest,
  addUserNotifications,
  notifyBroadcastedTransaction,
  notifySignRequest,
  signerConnectActive,
  signerConnectMessageActive,
  signerConnectMessagePosting,
  signerConnectPosting,
  subscribeToBroadcastedTransactions,
  subscribeToSignRequests,
} from '../../redux/features/multisig/multisigThunks';
import { MultisigUtils } from '../../utils/multisig.utils';
import { getTimestampInSeconds } from '../../utils/utils';

const LoginForm = () => {
  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);
  const loginExpirationInSec = Config.login.expirationInSec;
  const [username, setUsername] = useState<string>('');
  const isLoginSucceed = useAppSelector(
    (state) => state.login.isSignatureSuccess,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoggedIn, setStorageIsLoggedIn] = useLocalStorage(
    'loginStatus',
    isLoginSucceed,
  );
  const [accountDetails, setStorageAccountDetails] = useLocalStorage(
    'accountDetails',
    signedAccountObj,
  );

  const [loginTimestamp, setLoginTimestamp] = useLocalStorage(
    'loginTimestap',
    null,
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current.focus();
    console.log(
      'start here',
      HiveMultisig.getInstance(window, MultisigUtils.getOptions()),
    );
    if (!multisig) {
      setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
    }
    console.log('ms', multisig);
  }, []);

  useEffect(() => {
    if (isLoggedIn && accountDetails) {
      navigate(`/transaction`);
      subToSignRequests();
      subToBroadcastedTransactions();
    } else {
    }
  }, [accountDetails]);

  useEffect(() => {
    if (isLoginSucceed) {
      loginInitAsync();
    }
  }, [isLoginSucceed]);

  useEffect(() => {
    if (isFocused) {
      const keyDownHandler = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleOnLoginSubmit();
        }
      };
      document.addEventListener('keydown', keyDownHandler);
      return () => {
        document.removeEventListener('keydown', keyDownHandler);
      };
    }
  });

  const loginInitAsync = async () => {
    setStorageIsLoggedIn(isLoginSucceed);
    setStorageAccountDetails(signedAccountObj);
    setLoginTimestamp(getTimestampInSeconds());
  };

  const subToSignRequests = async () => {
    const subscribeRes = await multisig.wss.onReceiveSignRequest(
      signRequestCallback,
    );
    dispatch(subscribeToSignRequests(subscribeRes));
  };

  const subToBroadcastedTransactions = async () => {
    const subscribeRes = await multisig.wss.onBroadcasted(
      broadcastedTransactionCallback,
    );
    dispatch(subscribeToBroadcastedTransactions(subscribeRes));
  };

  const signRequestCallback = async (message: SignatureRequest) => {
    if (message) {
      await dispatch(addSignRequest([message]));
      if (message.initiator !== username) {
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
    console.log('mults', multisig);
    const signerConnectResponse = await multisig.wss.subscribe({
      username,
      keyType: KeychainKeyTypes.active,
    });
    if (signerConnectResponse.result) {
      dispatch(
        signerConnectMessageActive({
          username,
          message: signerConnectResponse.message,
          publicKey: signerConnectResponse.publicKey,
          keyType: KeychainKeyTypes.active,
        }),
      );
      if (signerConnectResponse.result.pendingSignatureRequests) {
        const pendingReqs =
          signerConnectResponse.result.pendingSignatureRequests[username];
        if (pendingReqs?.length > 0) {
          await dispatch(addSignRequest(pendingReqs));
        }
      }

      if (signerConnectResponse.result.notifications) {
        const notifications =
          signerConnectResponse.result.notifications[username];
        if (notifications?.length > 0) {
          await dispatch(addUserNotifications(notifications));
        }
      }
      await dispatch(signerConnectActive(signerConnectResponse));
    } else {
      // console.log('connectActive Failed');
    }
  };
  const connectPosting = async () => {
    const signerConnectResponse = await multisig.wss.subscribe({
      username,
      keyType: KeychainKeyTypes.posting,
    });
    if (signerConnectResponse.result) {
      dispatch(
        signerConnectMessagePosting({
          username,
          message: signerConnectResponse.message,
          publicKey: signerConnectResponse.publicKey,
          keyType: KeychainKeyTypes.posting,
        }),
      );
      dispatch(
        login({
          data: {
            key: 'posting',
            message: signerConnectResponse.message,
            method: KeychainKeyTypes.posting,
            username: username,
          },
          result: signerConnectResponse.message,
          publicKey: signerConnectResponse.publicKey,
          success: true,
        }),
      );
      if (signerConnectResponse.result.pendingSignatureRequests) {
        const pendingReqs =
          signerConnectResponse.result.pendingSignatureRequests[username];
        if (pendingReqs.length > 0) {
          await dispatch(addSignRequest(pendingReqs));
        }
      }
      if (signerConnectResponse.result.notifications) {
        const notifications =
          signerConnectResponse.result.notifications[username];
        if (notifications?.length > 0) {
          await dispatch(addUserNotifications(notifications));
        }
      }
      await dispatch(signerConnectPosting(signerConnectResponse));
    } else {
      // console.log('connectPosting Failed');
    }
  };
  const handleOnLoginSubmit = async () => {
    try {
      await connectPosting();
      await connectActive();
    } catch (error) {
      alert(`Login Failed \n ${error.message}`);
    }
  };

  return (
    <div>
      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
        <Form.Control
          placeholder={username !== '' ? username : 'Username'}
          aria-label="Username"
          aria-describedby="basic-addon2"
          onChange={(e) => setUsername(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={username}
          ref={inputRef}
        />
        <Button
          variant="outline-secondary"
          id="button-addon2"
          onClick={() => handleOnLoginSubmit()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}>
          Login
        </Button>
      </InputGroup>
    </div>
  );
};

export default LoginForm;
