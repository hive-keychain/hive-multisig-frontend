import { HiveMultisig } from 'hive-multisig-sdk/src';

import { KeychainKeyTypes } from 'hive-keychain-commons';
import { useEffect, useRef, useState } from 'react';
import { Button, Card, Form, InputGroup, Stack } from 'react-bootstrap';
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
    await setStorageIsLoggedIn(isLoginSucceed);
    await setStorageAccountDetails(signedAccountObj);
    await setLoginTimestamp(getTimestampInSeconds());
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

      try {
        localStorage.setItem(
          'multisig:loginRequestedKeyTypes',
          JSON.stringify({ posting, active }),
        );
      } catch {
        // ignore
      }

      if (posting) await connectPosting();
      if (active) await connectActive();
    } catch (error) {
      alert(`Login Failed \n ${error.message}`);
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <Card className="app-card w-100" style={{ maxWidth: 520 }}>
        <Card.Body className="p-4">
          <Stack gap={3}>
            <div>
              <h1 className="page-title">Sign in</h1>
              <p className="page-subtitle">
                Connect your Hive account via Keychain to manage multisig
                transactions.
              </p>
            </div>

            <InputGroup>
              <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
              <Form.Control
                placeholder="Username"
                aria-label="Username"
                aria-describedby="basic-addon1"
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                value={username}
                ref={inputRef}
              />
              <Button
                variant="primary"
                id="button-addon2"
                onClick={() => handleOnLoginSubmit()}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}>
                Login
              </Button>
            </InputGroup>

            <div>
              <div className="fw-semibold mb-2">Login with</div>
              <Stack direction="horizontal" gap={4} className="flex-wrap">
                <Form.Check
                  type="checkbox"
                  label="Posting Key"
                  checked={posting}
                  onChange={() => {
                    setPosting(!posting);
                  }}
                />
                <Form.Check
                  type="checkbox"
                  label="Active Key"
                  checked={active}
                  onChange={() => {
                    setActive(!active);
                  }}
                />
              </Stack>
              <Form.Text className="text-muted">
                You can enable one or both; some actions require the Active key.
              </Form.Text>
            </div>
          </Stack>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginForm;
