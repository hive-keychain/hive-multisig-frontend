import { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Form,
  InputGroup,
  Nav,
  Navbar,
  Stack,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import { Config } from '../../config';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { logout } from '../../redux/features/login/loginSlice';
import {
  getElapsedTimestampSeconds,
  getTimestampInSeconds,
} from '../../utils/utils';

const NavBar = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [destination, setDestination] = useState<string>('');
  const loginExpirationInSec = Config.login.expirationInSec;
  const isLoginSucceed = useAppSelector(
    (state) => state.login.isSignatureSuccess,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (destination !== '') {
      setExpanded(false);
      handleNavigation();
    }
  }, [destination]);

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

  const handleNavigation = () => {
    navigate(destination);
  };
  useEffect(() => {
    if (!isLoggedIn && loginTimestamp === 0 && !accountDetails) {
      setDestination('/login');
      console.log('redirecting');
    }
  }, [isLoggedIn, loginTimestamp, accountDetails]);
  const handleLogout = () => {
    if (isLoggedIn) {
      dispatch(logout(null));
      setLoginTimestamp(0);
      setStorageAccountDetails(null);
      setStorageIsLoggedIn(false);
      console.log('logging out');
    }
  };
  return (
    <Navbar
      collapseOnSelect
      expanded={expanded}
      expand="lg"
      bg="dark"
      variant="dark">
      <Container fluid>
        <Navbar.Brand className="nav-text-color" href="/">
          <img
            alt=""
            src="img/logohive.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
            style={{ marginRight: 10 }}
          />{' '}
          Hive Multisig
        </Navbar.Brand>
        <Navbar.Toggle
          onClick={() => setExpanded(expanded ? false : true)}
          aria-controls="responsive-navbar-nav"
        />
        <Navbar.Collapse
          className="mt-2 mt-sm-2 mt-md-3 mt-lg-0"
          id="responsive-navbar-nav ">
          {/*Search bar when not collapsed and logged out*/}
          <NavSearchBar
            classNames="w-auto me-auto"
            isLoggedIn={!isLoggedIn}
            setDestination={setDestination}
          />
          {isLoggedIn ? (
            <NavUserAvatar
              classNames="mt-1  d-md d-lg-none d-xl-none d-xxl-none"
              withLogOutBtn={false}
              username={accountDetails.data.username}
            />
          ) : null}

          {/*Navs*/}
          <Nav className="me-2">
            {isLoggedIn ? (
              <Nav.Link onClick={() => setDestination('/transaction')}>
                Transaction
              </Nav.Link>
            ) : null}
            {isLoggedIn ? (
              <Nav.Link
                onClick={() =>
                  setDestination(`@${accountDetails.data.username}`)
                }>
                Update Account
              </Nav.Link>
            ) : null}
          </Nav>

          {/*Search bar when collapsed and logged in*/}

          <NavSearchBar
            classNames="w-auto mt-2 me-auto d-md d-lg-none d-xl-none d-xxl-none"
            isLoggedIn={isLoggedIn}
            setDestination={setDestination}
          />
          {/*Search bar when not collapsed and logged in*/}
          <NavSearchBar
            classNames="w-auto  me-auto d-xs-none d-none d-sm-none d-md-none d-lg-flex"
            isLoggedIn={isLoggedIn}
            setDestination={setDestination}
          />
          {isLoggedIn ? (
            <div className="mt-3 d-md d-lg-none d-xl-none d-xxl-none">
              <Nav.Link
                className="nav-text-color"
                onClick={() => {
                  handleLogout();
                }}>
                Logout
              </Nav.Link>
            </div>
          ) : null}
          {/* Login button when logged out */}
          {!isLoggedIn ? (
            <Nav className="ms-auto">
              <Nav.Link href="/login">Login</Nav.Link>
            </Nav>
          ) : (
            <NavUserAvatar
              classNames="mt-1 d-xs-none d-none d-sm-none d-md-none d-lg-flex"
              withLogOutBtn={isLoggedIn}
              username={accountDetails.data.username}
              handleLogout={handleLogout}
            />
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

interface INavSearchBarProps {
  classNames: string;
  isLoggedIn: boolean;
  setDestination: Function;
}
const NavSearchBar = ({
  classNames,
  isLoggedIn,
  setDestination,
}: INavSearchBarProps) => {
  const [username, setUsername] = useState('');
  const keyDownHandler = (e: any) => {
    if (e.key === 'Enter') {
      setDestination(`@${username}`);
      setUsername('');
    }
  };
  if (isLoggedIn) {
    return (
      <InputGroup className={classNames}>
        <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
        <Form.Control
          type="search"
          placeholder="Username"
          className="navbar-input-group"
          aria-label="Search"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          onKeyDown={(e) => {
            keyDownHandler(e);
          }}
        />
        <Button
          variant="outline-secondary"
          onClick={() => {
            setDestination(`@${username}`);
          }}>
          Search
        </Button>
      </InputGroup>
    );
  } else {
    return null;
  }
};

interface INavUserAvatarProps {
  classNames: string;
  withLogOutBtn: boolean;
  username: string;
  handleLogout?: Function;
}
const NavUserAvatar = ({
  classNames,
  withLogOutBtn,
  username,
  handleLogout,
}: INavUserAvatarProps) => {
  return (
    <Stack className={classNames} direction="horizontal">
      <Navbar.Brand className="me-md-2 me-lg-1" href="/">
        <img
          className="avatar-sm"
          src={`https://images.hive.blog/u/${username}/avatar`}
          alt="new"
        />
      </Navbar.Brand>
      <Nav>
        <Nav.Link className="nav-text-color" href="/">
          {username}
        </Nav.Link>
        {withLogOutBtn ? (
          <Nav.Link
            className="nav-text-color"
            onClick={() => {
              handleLogout();
            }}>
            Logout
          </Nav.Link>
        ) : null}
      </Nav>
    </Stack>
  );
};
export default NavBar;
