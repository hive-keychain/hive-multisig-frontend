import { HiveMultisig } from 'hive-multisig-sdk/src';

import { KeychainKeyTypes } from 'hive-keychain-commons';
import { useEffect, useRef, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import { Config } from '../../config';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { login } from '../../redux/features/login/loginSlice';
import {
  addBroadcastNotifications,
  addSignRequest,
  signerConnectActive,
  signerConnectMessageActive,
  signerConnectMessagePosting,
  signerConnectPosting,
} from '../../redux/features/multisig/multisigThunks';
import { MultisigUtils } from '../../utils/multisig.utils';
import { getTimestampInSeconds } from '../../utils/utils';

const LoginForm = () => {
  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);
  const [posting, setPosting] = useState(true);
  const [active, setActive] = useState(true);

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
    if (!multisig) {
      setMultisig(
        HiveMultisig.resetInstance(window, MultisigUtils.getOptions()),
      );
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && accountDetails) {
      navigate(`/transaction`);
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

  const connectActive = async () => {
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
      if (!posting)
        dispatch(
          login({
            data: {
              key: 'active',
              message: signerConnectResponse.message,
              method: KeychainKeyTypes.active,
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
        if (pendingReqs?.length > 0) {
          await dispatch(addSignRequest(pendingReqs));
        }
      }

      if (signerConnectResponse.result.notifications) {
        const notifications =
          signerConnectResponse.result.notifications[username];
        if (notifications?.length > 0) {
          await dispatch(addBroadcastNotifications(notifications));
        }
      }
      await dispatch(signerConnectActive(signerConnectResponse));
    } else {
      console.log('connectActive Failed');
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
          await dispatch(addBroadcastNotifications(notifications));
        }
      }
      await dispatch(signerConnectPosting(signerConnectResponse));
    } else {
      console.log('connectPosting Failed');
    }
  };

  const handleOnLoginSubmit = async () => {
    try {
      if (!active && !posting) alert(`Choose at least one login method!`);
      if (posting) await connectPosting();
      if (active) await connectActive();
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
      <div style={{ display: 'flex', flexDirection: 'row', columnGap: '20px' }}>
        Login with:
        <Form.Check
          type={'checkbox'}
          label={`Posting Key`}
          checked={posting}
          onChange={() => {
            setPosting(!posting);
          }}
        />
        <Form.Check
          type={'checkbox'}
          label={`Active Key`}
          checked={active}
          onChange={() => {
            setActive(!active);
          }}
        />
      </div>
    </div>
  );
};

export default LoginForm;
