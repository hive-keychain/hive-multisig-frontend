import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import {
  IDecodeTransaction,
  ITransaction,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';

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
import HiveUtils from '../../utils/hive.utils';

import {
  getElapsedTimestampSeconds,
  getPublicKeys,
  getTimestampInSeconds,
} from '../../utils/utils';
const LoginForm = () => {
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
      multisigInitAsync();
    } else {
      navigate('/login');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoginSucceed) {
      loginInitAsync();
    }
  }, [isLoginSucceed]);

  const multisigInitAsync = async () => {
    await dispatch(signerConnectActive(username));
    await dispatch(signerConnectPosting(username));
    dispatch(subscribeToSignRequests(sigRequestCallback));
  };
  const loginInitAsync = async () => {
    setStorageIsLoggedIn(isLoginSucceed);
    setStorageAccountDetails(signedAccountObj);
    setLoginTimestamp(getTimestampInSeconds());
  };

  const sigRequestCallback = async (message: SignatureRequest) => {
    const authorities = await HiveUtils.getAccountAuthorities(username);
    const myPublickeys = getPublicKeys(message.keyType, authorities);
    let transactions: ITransaction[] = [];

    for (var k = 0; k < myPublickeys.length; k++) {
      for (var i = 0; i < message.signers.length; i++) {
        const data: IDecodeTransaction = {
          signatureRequest: message,
          username: username,
          publicKey: myPublickeys[k].toString(),
        };
        const multisig = new HiveMultisigSDK(window);
        const tx = await multisig.decodeTransaction(data);
        if (tx) {
          transactions.push(tx);
        }
      }

      if (transactions.length > 0) {
        await dispatch(addSignRequest(transactions));
        await dispatch(setSignRequestCount(transactions.length));
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
      <div className="ms-2 text-start" style={{ color: 'black' }}>
        <h5>Login</h5>
      </div>

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
