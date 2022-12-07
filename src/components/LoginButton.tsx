import { useEffect } from 'react';
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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const isKeyChainFound = useAppSelector(
    (state) => state.keychain.isKeyChainFound,
  );

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

  useEffect(() => {
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
