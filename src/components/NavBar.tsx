import { Container, Navbar } from "react-bootstrap";

export default () => (
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
    </Container>
  </Navbar>
);
