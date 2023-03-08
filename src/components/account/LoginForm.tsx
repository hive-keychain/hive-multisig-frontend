import { useEffect, useRef, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import { Config } from '../../config';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { hiveKeyChainRequestSign } from '../../redux/features/login/loginSlice';
import {
  getElapsedTimestampSeconds,
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
    } else {
      navigate('/login');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoginSucceed) {
      setStorageIsLoggedIn(isLoginSucceed);
      setStorageAccountDetails(signedAccountObj);
      setLoginTimestamp(getTimestampInSeconds());
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
