import { useEffect, useRef, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import { useAppDispatch, useAppSelector } from '../redux/app/hooks';
import { hiveKeyChainRequestSign } from '../redux/features/login/loginSlice';
import {
  getElapsedTimestampSeconds,
  getTimestampInSeconds,
} from '../utils/utils';
const LoginForm = () => {
  const loginExpirationInSec = 15;
  const [username, setUsername] = useState<string>('');
  const isKeyChainFound = useAppSelector(
    (state) => state.keychain.isKeyChainFound,
  );
  const keyChainMsg = useAppSelector((state) => state.keychain.message);
  const keyChainError = useAppSelector((state) => state.keychain.error);
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

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current.focus();
    if (isLoggedIn) {
      const loggedinDuration = getElapsedTimestampSeconds(
        loginTimestamp,
        getTimestampInSeconds(),
      );
      console.log('Login timestamp:', loginTimestamp);
      console.log('Login duration:', loggedinDuration);
      if (loginTimestamp > 0 && loggedinDuration >= loginExpirationInSec) {
        console.log('Login Expired:', loggedinDuration);
        setLoginTimestamp(0);
        setStorageAccountDetails(null);
        setStorageIsLoggedIn(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      navigate(`/@${accountDetails.data.username}`);
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
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleOnLoginSubmit();
      }
    };
    document.addEventListener('keydown', keyDownHandler);
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  });

  const handleOnLoginSubmit = () => {
    dispatch(hiveKeyChainRequestSign(username));
  };

  return (
    <div>
      <div className="ms-2 text-start" style={{ color: 'black' }}>
        Login
      </div>
      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
        <Form.Control
          placeholder={username !== '' ? username : 'Username'}
          aria-label="Username"
          aria-describedby="basic-addon2"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          ref={inputRef}
        />
        <Button
          variant="outline-secondary"
          id="button-addon2"
          onClick={() => handleOnLoginSubmit()}>
          Login
        </Button>
      </InputGroup>
    </div>
  );
};

export default LoginForm;
