import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage, useReadLocalStorage } from 'usehooks-ts';
import { SignResponseType } from '../../interfaces';

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
    <nav className="navbar">
      <div className="container-xxl">
        <a href="#intro" className="navbar-brand">
          <span className="fw-bold text-secondary">Hive Keychain</span>
        </a>
        {/* toggle button for mobile nav */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#main-nav"
          aria-controls="main-nav"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
    // <Navbar bg="dark" variant="dark">
    //   <Container fluid>
    //     <Navbar.Brand href="/">
    //       <img
    //         alt=""
    //         src="img/logohive.png"
    //         width="30"
    //         height="30"
    //         className="d-inline-block align-top"
    //         style={{ marginRight: 20 }}
    //       />
    //       Hive Multisig
    //     </Navbar.Brand>
    //     <Navbar.Collapse justify-content-md-start>
    //       <Nav>
    //         <Nav.Link className="mx-3" eventKey="transaction">
    //           Transaction
    //         </Nav.Link>
    //         <Nav.Link className="mx-5" eventKey="update">
    //           Update Account
    //         </Nav.Link>
    //         <Nav.Link className="mx-3" eventKey="transaction">
    //           Login
    //         </Nav.Link>
    //       </Nav>
    //       <InputGroup className="mx-5 h-50 ">
    //         <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
    //         <Form.Control
    //           className="w-25"
    //           placeholder="Username"
    //           aria-label="Username"
    //           aria-describedby="basic-addon2"
    //         />
    //         <Button variant="outline-secondary" id="button-addon2">
    //           Search
    //         </Button>
    //       </InputGroup>
    //     </Navbar.Collapse>

    //     {/* <Navbar.Collapse id="responsive-navbar-nav">
    //       <Nav
    //         className="me-auto"
    //         onSelect={(selectedKey) => setDestination(selectedKey)}>
    //         {isLoggedIn ? (
    //           <Stack direction="horizontal">
    //             <Nav.Link eventKey="transaction">Tansaction</Nav.Link>
    //             <Nav.Link
    //               eventKey={
    //                 isLoggedIn ? `@${accountDetails.data.username}` : ''
    //               }>
    //               Update Account
    //             </Nav.Link>
    //           </Stack>
    //         ) : null}
    //         <Nav.Link eventKey="search">Search Account</Nav.Link>
    //       </Nav>
    //     </Navbar.Collapse> */}
    //     {/* <AccountDropdown /> */}
    //   </Container>
    // </Navbar>
  );
};
export default NavBar;
