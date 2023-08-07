import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';

import { useEffect, useRef, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import { Config } from '../../config';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { hiveKeyChainRequestSign } from '../../redux/features/login/loginSlice';
import {
  addSignRequest,
  setSignRequestCount,
  signerConnectActive,
  signerConnectPosting,
  subscribeToSignRequests,
} from '../../redux/features/multisig/multisigThunks';

import { KeychainKeyTypes } from 'hive-keychain-commons';
import {
  getElapsedTimestampSeconds,
  getTimestampInSeconds,
} from '../../utils/utils';
const LoginForm = () => {
  const [multisig, setMultisig] = useState<HiveMultisigSDK>(undefined);
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
    if (isLoggedIn) {
      if (!multisig) {
        setMultisig(new HiveMultisigSDK(window));
      }
      const loggedinDuration = getElapsedTimestampSeconds(
        loginTimestamp,
        getTimestampInSeconds(),
      );
      if (loginTimestamp > 0 && loggedinDuration >= loginExpirationInSec) {
        setLoginTimestamp(0);
        setStorageAccountDetails(null);
        setStorageIsLoggedIn(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      navigate(`/transaction`);
      subToSignReqequests();
      signerConnect();
    } else {
      navigate('/login');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoginSucceed) {
      loginInitAsync();
    }
  }, [isLoginSucceed]);

  const subToSignReqequests = async () => {
    const subscribeRes = await multisig.subscribeToSignRequests(
      signRequestCallback,
    );
    dispatch(subscribeToSignRequests(subscribeRes));
  };

  const signerConnect = async () => {
    await connectActive();
    await connectPosting();
  };
  const connectActive = async () => {
    const signerConnectResponse = await multisig.signerConnect({
      username,
      keyType: KeychainKeyTypes.active,
    });
    if (signerConnectResponse.result) {
      if (signerConnectResponse.result.pendingSignatureRequests) {
        const pendingReqs =
          signerConnectResponse.result.pendingSignatureRequests[username];
        if (pendingReqs.length > 0) {
          const decodedTxs = await multisig.decodeTransaction({
            signatureRequest: pendingReqs,
            username,
          });
          await dispatch(addSignRequest(decodedTxs));
          await dispatch(setSignRequestCount(decodedTxs.length));
        }
      }
    }
    await dispatch(signerConnectActive(signerConnectResponse));
  };
  const connectPosting = async () => {
    const signerConnectResponse = await multisig.signerConnect({
      username,
      keyType: KeychainKeyTypes.posting,
    });
    if (signerConnectResponse.result) {
      if (signerConnectResponse.result.pendingSignatureRequests) {
        const pendingReqs =
          signerConnectResponse.result.pendingSignatureRequests[username];
        if (pendingReqs.length > 0) {
          const decodedTxs = await multisig.decodeTransaction({
            signatureRequest: pendingReqs,
            username,
          });

          await dispatch(addSignRequest(decodedTxs));
          await dispatch(setSignRequestCount(decodedTxs.length));
        }
      }
    }
    await dispatch(signerConnectPosting(signerConnectResponse));
  };
  const loginInitAsync = async () => {
    if (!multisig) {
      setMultisig(new HiveMultisigSDK(window));
    }
    setStorageIsLoggedIn(isLoginSucceed);
    setStorageAccountDetails(signedAccountObj);
    setLoginTimestamp(getTimestampInSeconds());
  };

  const signRequestCallback = async (message: SignatureRequest) => {
    console.log('signrequestcCallback');
    console.log(message);
    if (message) {
      const decodedTxs = await multisig.decodeTransaction({
        signatureRequest: [message],
        username,
      });
      if (decodedTxs.length > 0) {
        await dispatch(addSignRequest(decodedTxs));
        await dispatch(setSignRequestCount(decodedTxs.length));
      }
    }
  };

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

  const handleOnLoginSubmit = () => {
    dispatch(hiveKeyChainRequestSign(username));
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
