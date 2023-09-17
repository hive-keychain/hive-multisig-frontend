import { HiveMultisig } from 'hive-multisig-sdk/src';
import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocalStorage, useReadLocalStorage } from 'usehooks-ts';
import { Config } from '../../config';
import {
  Authorities,
  ISearchBarInterface,
  ISearchPageInterface,
  LoginResponseType,
} from '../../interfaces';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { loginActions } from '../../redux/features/login/loginSlice';
import { multisigActions } from '../../redux/features/multisig/multisigSlices';
import { transactionActions } from '../../redux/features/transaction/transactionSlices';
import { updateAuthorityActions } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import AccountUtils from '../../utils/hive.utils';
import { MultisigUtils } from '../../utils/multisig.utils';
import {
  getElapsedTimestampSeconds,
  getTimestampInSeconds,
} from '../../utils/utils';
import AccountPage from './AccountPage';
import SearchAccountPage from './SearchAccountPage';

export const SearchBar: React.FC<ISearchBarInterface> = (
  props: ISearchBarInterface,
) => {
  const [input, setInput] = useState<string>('');

  const [isFocused, setIsFocused] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isFocused) {
        redirect();
      }
    };
    document.addEventListener('keydown', keyDownHandler);
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  });

  const redirect = () => {
    if (input && input !== '') {
      navigate(`/@${input}`);
    } else {
      navigate('/');
    }
  };

  const DisplayValidity = () => {
    if (props.isValid === false) {
      return (
        <div className="ms-2 text-start" style={{ color: 'red' }}>
          Invalid User
        </div>
      );
    } else {
      return <div></div>;
    }
  };

  const handleOnClick = () => {
    redirect();
  };

  return (
    <div>
      <div className="ms-2 text-start" style={{ color: 'black' }}>
        <h5>Search Account</h5>
      </div>
      <DisplayValidity />
      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">@</InputGroup.Text>

        <Form.Control
          placeholder={props.username ? props.username : 'Username'}
          aria-label="Username"
          aria-describedby="basic-addon2"
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={input}
        />
        <Button
          type="button"
          variant="outline-secondary"
          id="button-addon2"
          onClick={(e) => handleOnClick()}>
          Search
        </Button>
      </InputGroup>
    </div>
  );
};

export const HomePage: React.FC<ISearchPageInterface> = (
  props: ISearchPageInterface,
) => {
  const [authorities, setAuthorities] = useState<Authorities>();
  const [isValid, setValid] = useState<boolean>();
  const [searchKey, setSearchKey] = useState<string>();
  const params = useParams();
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const [accountDetails, setStorageAccountDetails] = useLocalStorage(
    'accountDetails',
    signedAccountObj,
  );
  const multisig = HiveMultisig.getInstance(window, MultisigUtils.getOptions());
  const isLoggedIn = useReadLocalStorage<boolean>('loginStatus');
  const loginExpirationInSec = Config.login.expirationInSec;
  const [loginTimestamp, setLoginTimestamp] = useLocalStorage(
    'loginTimestap',
    null,
  );
  const postingConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessagePosting,
  );
  const activeConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessageActive,
  );
  const loggedInAccount =
    useReadLocalStorage<LoginResponseType>('accountDetails');
  const [isAccountSearch, setAccountSearch] = useState<boolean>(!isLoggedIn);
  const getAuth = async () => {
    const auth = await AccountUtils.getAccountAuthorities(searchKey);
    if (auth) {
      setAuthorities(auth);
    }
  };
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setSearchKey(params.id.replace('@', ''));
  }, [params.id]);

  useEffect(() => {
    getAuth();
  }, [searchKey]);

  useEffect(() => {
    if (authorities) {
      setValid(true);
      if (loggedInAccount) {
        if (loggedInAccount.data.username === searchKey) {
          setAccountSearch(false);
        } else {
          setAccountSearch(true);
        }
      } else {
        setAccountSearch(true);
      }
    } else {
      setAccountSearch(false);
    }
  }, [authorities]);

  useEffect(() => {
    if (signedAccountObj) {
      const loggedinDuration = getElapsedTimestampSeconds(
        loginTimestamp,
        getTimestampInSeconds(),
      );
      if (loginTimestamp > 0 && loggedinDuration >= loginExpirationInSec) {
        handleLogout();
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, []);

  const handleLogout = async () => {
    setLoginTimestamp(0);
    setStorageAccountDetails(null);
    await dispatch(loginActions.logout());
    await dispatch(multisigActions.resetState());
    await dispatch(transactionActions.resetState());
    await dispatch(updateAuthorityActions.resetState());
  };
  return (
    <div>
      <SearchBar username={searchKey} isValid={isValid} />
      {isAccountSearch ? (
        <SearchAccountPage authorities={authorities} />
      ) : (
        <AccountPage authorities={authorities} />
      )}
    </div>
  );
};
