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
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import { Config } from '../../config';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { loginActions } from '../../redux/features/login/loginSlice';
import { multisigActions } from '../../redux/features/multisig/multisigSlices';
import { transactionActions } from '../../redux/features/transaction/transactionSlices';
import { twoFactorAuthActions } from '../../redux/features/twoFactorAuth/twoFactorAuthSlices';
import { updateAuthorityActions } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import {
  isSessionExpired,
  isSessionValid,
  LOGIN_TIMESTAMP_STORAGE_KEY,
  parseLoginTimestampSeconds,
} from '../../utils/session';
import {
  applyResolvedThemeToDocument,
  cycleThemePreference,
  resolveTheme,
  ThemePreference,
} from '../../utils/theme';

const NavBar = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [destination, setDestination] = useState<string>('');
  const [displayLoginBtn, setDisplayLoginBtn] = useState(false);
  const [themePreference, setThemePreference] = useLocalStorage<ThemePreference>(
    'themePreference',
    'system',
  );
  const [prefersDark, setPrefersDark] = useState<boolean>(() => {
    try {
      return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
    } catch {
      return false;
    }
  });
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
    LOGIN_TIMESTAMP_STORAGE_KEY,
    null,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const resolvedTheme = resolveTheme(
    themePreference === 'system' ? (prefersDark ? 'dark' : 'light') : themePreference,
  );

  useEffect(() => {
    applyResolvedThemeToDocument(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (themePreference !== 'system') return;
    let mql: MediaQueryList | null = null;
    const onChange = (event: MediaQueryListEvent | MediaQueryList) => {
      // MediaQueryListEvent in modern browsers, MediaQueryList in some fallbacks
      const matches = 'matches' in event ? event.matches : (event as any).matches;
      setPrefersDark(Boolean(matches));
    };

    try {
      mql = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
      if (!mql) return;
      setPrefersDark(Boolean(mql.matches));
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', onChange);
        return () => mql?.removeEventListener?.('change', onChange);
      }
      // Safari
      if (typeof (mql as any).addListener === 'function') {
        (mql as any).addListener(onChange);
        return () => (mql as any).removeListener?.(onChange);
      }
    } catch {
      // ignore
    }
  }, [themePreference]);

  useEffect(() => {
    if (destination !== '') {
      if (expanded) {
        setExpanded(false);
      }
      handleNavigation();
    }
  }, [destination]);

  useEffect(() => {
    // Keep NavBar state consistent with the same session rule used elsewhere:
    // a session is only valid if loginTimestamp is a positive number and not expired.
    const rawNum =
      typeof loginTimestamp === 'string' || typeof loginTimestamp === 'number'
        ? Number(loginTimestamp)
        : NaN;

    // Explicit logout marker
    if (rawNum === 0) {
      if (isLoggedIn || accountDetails) {
        setStorageAccountDetails(null);
        setStorageIsLoggedIn(false);
      }
      return;
    }

    const ts = parseLoginTimestampSeconds(loginTimestamp);

    // If we have loginStatus/accountDetails but no timestamp, treat it as stale
    // *except* during the brief window where the login page is setting values.
    if (ts === null) {
      if (location.pathname === '/login') return;
      if (isLoggedIn || accountDetails) {
        setLoginTimestamp(0);
        setStorageAccountDetails(null);
        setStorageIsLoggedIn(false);
      }
      return;
    }

    // Normal expiration enforcement.
    if (isSessionExpired(loginTimestamp, loginExpirationInSec)) {
      setLoginTimestamp(0);
      setStorageAccountDetails(null);
      setStorageIsLoggedIn(false);
    }
  }, [
    loginTimestamp,
    loginExpirationInSec,
    location.pathname,
    isLoggedIn,
    accountDetails,
    setLoginTimestamp,
    setStorageAccountDetails,
    setStorageIsLoggedIn,
  ]);

  const sessionValid = isSessionValid(loginTimestamp, loginExpirationInSec);

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
      navigate('/login', { replace: true });
      setDestination('');
    }
  };

  return (
    <Navbar
      collapseOnSelect
      expanded={expanded}
      expand="lg"
      bg={resolvedTheme === 'dark' ? 'dark' : 'light'}
      variant={resolvedTheme === 'dark' ? 'dark' : 'light'}
      sticky="top">
      <Container fluid>
        <Navbar.Brand
          className="nav-text-color ms-0 me-1 clickable d-flex align-items-center gap-2"
          onClick={() => {
            sessionValid && accountDetails
              ? setDestination('/transaction')
              : setDestination('/');
          }}>
          <img
            alt=""
            src="img/multisig.png"
            width="50"
            className="d-inline-block align-top"
          />
          Hive Multisig
        </Navbar.Brand>
        <Navbar.Toggle
          onClick={() => setExpanded(expanded ? false : true)}
          aria-controls="responsive-navbar-nav"
        />
        <Navbar.Collapse
          className="mt-2 mt-sm-2 mt-md-3 mt-lg-0 pe-auto"
          id="responsive-navbar-nav ">
          {/*Search bar when not collapsed and logged out*/}
          {/* {!accountDetails ? (
            <div className="text-secondary ms-2">{'Search'}</div>
          ) : (
            ''
          )} */}
          {/* <NavSearchBar
            classNames="w-auto ms-1 me-auto"
            isLoggedIn={!accountDetails}
            setDestination={setDestination}
          /> */}
          {sessionValid && accountDetails ? (
            <NavUserAvatar
              classNames="mt-1  d-md d-lg-none d-xl-none d-xxl-none"
              username={accountDetails.data.username}
            />
          ) : null}
          {/*Navs*/}
          <Nav className="me-2">
            {sessionValid && accountDetails ? (
              <Nav.Link onClick={() => setDestination('/transaction')}>
                Transactions
              </Nav.Link>
            ) : null}
            {sessionValid && accountDetails ? (
              <Nav.Link
                onClick={() =>
                  setDestination(`@${accountDetails.data.username}`)
                }>
                Update Account
              </Nav.Link>
            ) : null}
            {sessionValid && accountDetails ? (
              <Nav.Link onClick={() => setDestination('/signRequest')}>
                Sign Requests{' '}
                {signRequest ? (
                  <Badge bg="danger">
                    {setSignRequestCount > 0 ? setSignRequestCount : ''}
                  </Badge>
                ) : null}
              </Nav.Link>
            ) : (
              <></>
            )}

            {sessionValid && accountDetails ? (
              <Nav.Link onClick={() => setDestination('/twoFactor')}>
                2FA (Beta)
              </Nav.Link>
            ) : (
              <></>
            )}
          </Nav>

          <div className="ms-lg-auto d-flex align-items-center gap-2">
            <Button
              size="sm"
              variant={resolvedTheme === 'dark' ? 'outline-light' : 'outline-dark'}
              onClick={() => setThemePreference(cycleThemePreference(themePreference))}
              aria-label="Toggle theme">
              {themePreference === 'system'
                ? 'Theme: System'
                : themePreference === 'dark'
                  ? 'Theme: Dark'
                  : 'Theme: Light'}
            </Button>
          </div>
          {/* Search bar when collapsed and logged in
          <NavSearchBar
            classNames="w-auto mt-2 me-auto d-md d-lg-none d-xl-none d-xxl-none"
            isLoggedIn={isLoggedIn}
            setDestination={setDestination}
          />
          {Search bar when not collapsed and logged in}
          <NavSearchBar
            classNames="w-auto  d-xs-none d-none d-sm-none d-md-none d-lg-flex"
            isLoggedIn={isLoggedIn}
            setDestination={setDestination}
          /> 
          */}
          {sessionValid && accountDetails ? (
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
          {isLoggedIn && accountDetails ? (
            <NavUserAvatarDropdown
              classNames="ms-auto mt-1 d-xs-none d-none d-sm-none d-md-none d-lg-flex"
              username={accountDetails.data.username}
              handleLogout={handleLogout}
            />
          ) : null}
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
