import { useEffect, useState } from 'react';
import { Container, Nav, Navbar, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage, useReadLocalStorage } from 'usehooks-ts';
import { SignResponseType } from '../../interfaces';
import AccountDropdown from '../account/AccountDropown';

const NavBar = () => {
  const [destination, setDestination] = useState('');
  const accountDetails =
    useReadLocalStorage<SignResponseType>('accountDetails');
  const [isLoggedIn, setStorageIsLoggedIn] = useLocalStorage<boolean>(
    'loginStatus',
    useReadLocalStorage('loginStatus'),
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (destination !== '') {
      handleNavigation();
    }
  }, [destination]);

  const handleNavigation = () => {
    navigate(destination);
  };
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="/">
          <img
            alt=""
            src="img/logohive.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
            style={{ marginRight: 20 }}
          />
          Hive Multisig
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav
            className="me-auto"
            onSelect={(selectedKey) => setDestination(selectedKey)}>
            <Nav.Link eventKey="search">Search Account</Nav.Link>
            {isLoggedIn ? (
              <Stack direction="horizontal">
                <Nav.Link eventKey="transaction">Tansaction</Nav.Link>
                <Nav.Link
                  eventKey={
                    isLoggedIn ? `@${accountDetails.data.username}` : ''
                  }>
                  Update Account
                </Nav.Link>
              </Stack>
            ) : null}
          </Nav>
        </Navbar.Collapse>
        <AccountDropdown />
      </Container>
    </Navbar>
  );
};
export default NavBar;
