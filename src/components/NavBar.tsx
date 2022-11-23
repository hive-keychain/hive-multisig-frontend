import { Container, Navbar } from "react-bootstrap";
import  LogIn from "./LogIn";
import *  as Ilogin from "../interfaces/login.interface";

const NavBar = (props:Ilogin.ILogInButtonProps) => (
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
      <LogIn.LogInButton handleLoginClick={props.handleLoginClick}/>
    </Container>
  </Navbar>
);

export default NavBar;
