import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import { Signer } from 'hive-multisig-sdk/src/interfaces/signer';
import { useEffect, useRef, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import { Config } from '../../config';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { hiveKeyChainRequestSign } from '../../redux/features/login/loginSlice';
import {
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
    const signRequests: Signer[] = [];
    myPublickeys.forEach((key) => {
      for (var i = 0; i < message.signers.length; i++) {
        if (
          message.signers[i].publicKey === key &&
          message.signers[i].signature === null
        ) {
          signRequests.push(message.signers[i]);
        }
      }
    });
    if (signRequests.length > 0) {
      console.log(
        `You have pending signature request ${JSON.stringify(signRequests)}`,
      );
    } else {
      console.log(`You dont have pending signature request`);
    }
    // console.log(`Signature Request: ${JSON.stringify(message)}`);

    //a function that will search wether the logged in user is in the signature request list
    //if the user is in the list,
    //  dispatch a thunk that will notify the user
    //  ask the user for transaction
    //  broadcast?
    //if not, ignore

    //requirements
    // 1. public keys of the logged in user
    //
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
