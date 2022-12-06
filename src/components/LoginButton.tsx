import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage, useReadLocalStorage } from 'usehooks-ts';
import { Config } from '../config';
import { SignResponseType } from '../interfaces';
import { useAppDispatch, useAppSelector } from '../redux/app/hooks';
import { checkKeychain } from '../redux/features/keyChain/keyChainSlice';
import {
  getElapsedTimestampSeconds,
  getTimestampInSeconds
} from '../utils/utils';
const LoginButton = () => {
  const loginExpirationInSec = Config.login.expirationInSec;
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const isKeyChainFound = useAppSelector(
    (state) => state.keychain.isKeyChainFound,
  );
  const keyChainMsg = useAppSelector((state) => state.keychain.message);
  const keyChainError = useAppSelector((state) => state.keychain.error);
  const [isLoggedIn, setStorageIsLoggedIn] = useLocalStorage<boolean>(
    'loginStatus',
    useReadLocalStorage('loginStatus'),
  );
  const [accountDetails, setStorageAccountDetails] =
    useLocalStorage<SignResponseType>(
      'accountDetails',
      useReadLocalStorage('accountDetails'),
    );
  const [loginTimestamp, setLoginTimestamp] = useLocalStorage<number>(
    'loginTimestap',
    null,
  );

  const navigate = useNavigate();
  const isLoginSucceed = useAppSelector(
    (state) => state.login.isSignatureSuccess,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const dispatch = useAppDispatch();

  useEffect(() => {
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
    console.log('Signed in: ', isLoginSucceed);
    setSignedIn(isLoginSucceed);
  }, [isLoginSucceed]);

  useEffect(() => {
    if (!isKeyChainFound) {
    } else {
      navigate('/login');
    }
  }, [isKeyChainFound]);

  const handleBtnOnClick = () => {
    if (!isLoggedIn) {
      dispatch(checkKeychain());
    } else if (accountDetails) {
      navigate(`/@${accountDetails.data.username}`);
    }
  };

  const Display = () => {
    let text: string = 'Login';
    if (isLoggedIn) {
      return (
        <div>
          <img
            className="avatar"
            src={`https://images.hive.blog/u/${accountDetails.data.username}/avatar`}
            alt="new"
            onClick={handleBtnOnClick}
          />
        </div>
      );
    } else {
      return (
        <div>
          <Button variant="outline-light" onClick={handleBtnOnClick}>
            {text}
          </Button>
        </div>
      );
    }
  };

  return <Display />;
};

export default LoginButton;
