import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useNavigate, useParams } from 'react-router-dom';
import { useReadLocalStorage } from 'usehooks-ts';
import {
  Authorities,
  ISearchBarInterface,
  ISearchPageInterface,
  SignResponseType,
} from '../../interfaces';
import AccountUtils from '../../utils/hive.utils';
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
  const params = useParams();
  const searchKey = params.id;
  const isLoggedIn = useReadLocalStorage<boolean>('loginStatus');
  const loggedInAccount =
    useReadLocalStorage<SignResponseType>('accountDetails');
  const [isAccountSearch, setAccountSearch] = useState<boolean>(!isLoggedIn);

  useEffect(() => {
    AccountUtils.GetAuthorities(setAuthorities, setValid, searchKey);
  }, [searchKey]);

  useEffect(() => {
    if (authorities) {
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
