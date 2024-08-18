import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Container,
  Dropdown,
  Form,
  InputGroup,
  Nav,
  NavItem,
  NavLink,
  Navbar,
  Stack,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import { Config } from '../../config';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { loginActions } from '../../redux/features/login/loginSlice';
import { multisigActions } from '../../redux/features/multisig/multisigSlices';
import { transactionActions } from '../../redux/features/transaction/transactionSlices';
import { twoFactorAuthActions } from '../../redux/features/twoFactorAuth/twoFactorAuthSlices';
import { updateAuthorityActions } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import {
  getElapsedTimestampSeconds,
  getTimestampInSeconds,
} from '../../utils/utils';

const NavBar = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [destination, setDestination] = useState<string>('');
  const [displayLoginBtn, setDisplayLoginBtn] = useState(false);
  const loginExpirationInSec = Config.login.expirationInSec;
  const isLoginSucceed = useAppSelector(
    (state) => state.login.isSignatureSuccess,
  );
  const signRequest = useAppSelector(
    (state) => state.multisig.multisig.signRequests,
  );
  const setSignRequestCount = useAppSelector(
    (state) => state.multisig.multisig.signRequestCount,
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
      if (expanded) {
        setExpanded(false);
      }
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
    setDestination('');
  };
  useEffect(() => {
    if (!isLoggedIn && loginTimestamp === 0 && !accountDetails) {
      setDestination('/login');
    }
  }, [isLoggedIn, loginTimestamp, accountDetails]);

  const handleLogout = async () => {
    if (isLoggedIn) {
      dispatch(loginActions.logout());
      setLoginTimestamp(0);
      setStorageAccountDetails(null);
      setStorageIsLoggedIn(false);
      dispatch(multisigActions.resetState());
      dispatch(transactionActions.resetState());
      dispatch(updateAuthorityActions.resetState());
      dispatch(twoFactorAuthActions.resetState());
      setDestination('/login');
    }
  };

  return (
    <Navbar
      collapseOnSelect
      expanded={expanded}
      expand="lg"
      bg="dark"
      variant="dark"
      sticky="top">
      <Container fluid>
        <Navbar.Brand
          className="nav-text-color ms-0 me-1"
          style={{
            paddingRight: 15,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={() =>
            setDestination(isLoggedIn && accountDetails ? '/transaction' : '/')
          }>
          <img
            alt=""
            src="img/multisig.png"
            width="50"
            className="d-inline-block align-top me-0"
            style={{ marginRight: 10 }}
          />{' '}
          Hive Multisig
        </Navbar.Brand>
        <Navbar.Toggle
          onClick={() => setExpanded(!expanded)}
          aria-controls="responsive-navbar-nav"
        />
        <Navbar.Collapse
          className="mt-2 mt-sm-2 mt-md-3 mt-lg-0 pe-auto"
          id="responsive-navbar-nav">
          {/* Show Avatar if logged in */}
          {isLoggedIn && accountDetails && (
            <>
              <NavUserAvatar
                classNames="mt-1 d-md d-lg-none d-xl-none d-xxl-none"
                username={accountDetails.data.username}
              />
              {/* Nav Links */}
              <Nav className="me-2">
                <Nav.Link onClick={() => setDestination('/transaction')}>
                  Transactions
                </Nav.Link>
                <Nav.Link
                  onClick={() =>
                    setDestination(`@${accountDetails.data.username}`)
                  }>
                  Update Account
                </Nav.Link>
                <Nav.Link onClick={() => setDestination('/signRequest')}>
                  Sign Requests{' '}
                  {signRequest && setSignRequestCount > 0 && (
                    <Badge bg="danger">{setSignRequestCount}</Badge>
                  )}
                </Nav.Link>
                <Nav.Link onClick={() => setDestination('/twoFactor')}>
                  2FA
                </Nav.Link>
                <Nav.Link onClick={() => setDestination('/granularity')}>
                  Granularity
                </Nav.Link>
              </Nav>

              {/* Logout Button for small screens */}
              <div className="mt-3 d-md d-lg-none d-xl-none d-xxl-none">
                <Nav.Link className="nav-text-color" onClick={handleLogout}>
                  Logout
                </Nav.Link>
              </div>

              {/* Avatar Dropdown for larger screens */}
              <NavUserAvatarDropdown
                classNames="ms-auto mt-1 d-xs-none d-none d-sm-none d-md-none d-lg-flex"
                username={accountDetails.data.username}
                handleLogout={handleLogout}
              />
            </>
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
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const keyDownHandler = (e: any) => {
    if (e.key === 'Enter' && isFocused) {
      if (username !== '') {
        handleDestination();
      }
    }
  };
  const handleDestination = () => {
    setDestination(`@${username}`);
    setUsername('');
  };
  if (isLoggedIn) {
    return (
      <InputGroup className={classNames}>
        <InputGroup.Text
          className="bg-dark ps-0 pe-0 outline-secondary text-secondary navbar-input-border-color"
          id="basic-addon1">
          @
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Username"
          className="bg-dark ps-0 pe-0 text-secondary navbar-input-border-color "
          aria-label="Search"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            keyDownHandler(e);
          }}
        />
        <Button
          variant="pe-0 ps-1 text-secondary navbar-search-btn"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onClick={() => {
            username !== '' ? handleDestination() : null;
          }}>
          <i className="fa fa-search "></i>
        </Button>
      </InputGroup>
    );
  } else {
    return null;
  }
};

interface INavUserAvatarProps {
  classNames: string;
  username: string;
  handleLogout?: Function;
}
const NavUserAvatarDropdown = ({
  classNames,
  username,
  handleLogout,
}: INavUserAvatarProps) => {
  const navigate = useNavigate();

  return (
    <div className={classNames}>
      <Stack direction="horizontal" gap={1}>
        <img
          className="avatar-sm"
          src={`https://images.hive.blog/u/${username}/avatar`}
          alt="new"
          onClick={() => navigate('/')}
        />
        <Nav>
          <Dropdown as={NavItem}>
            <Dropdown.Toggle className="nav-text-color" as={NavLink}>
              {username}
            </Dropdown.Toggle>
            <Dropdown.Menu
              className="mt-1 pt-1 navbar-avatar-menu"
              align="end"
              variant="dark">
              <Dropdown.Item
                className="nav-text-color"
                onClick={() => handleLogout()}>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Stack>
    </div>
  );
};

const NavUserAvatar = ({
  classNames,
  username,
  handleLogout,
}: INavUserAvatarProps) => {
  const navigate = useNavigate();
  return (
    <Stack className={classNames} direction="horizontal">
      <Navbar.Brand
        className="me-md-2 me-lg-1"
        onClick={() => navigate('/transaction')}>
        <img
          className="avatar-sm"
          src={`https://images.hive.blog/u/${username}/avatar`}
          alt="new"
        />
      </Navbar.Brand>
      <Nav>
        <Nav.Link
          className="nav-text-color"
          onClick={() => navigate('/transaction')}>
          {username}
        </Nav.Link>
      </Nav>
    </Stack>
  );
};
export default NavBar;
