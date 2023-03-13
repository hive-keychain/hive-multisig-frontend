import { Op } from 'hive-qrcode';
import { useState } from 'react';
import { Container } from 'react-bootstrap';
import './App.css';
import NavBar from './components/navigating/NavBar';
import Routing from './components/navigating/Routing';
function App() {
  const [op, setOp] = useState<Op>();
  const onSubmitOp = (op: Op) => {
    setOp(op);
  };

  return (
    <div className="App">
      <NavBar />
      <div style={{ flex: 1 }}>
        <Container
          style={{
            marginTop: 50,
          }}>
          <Routing />
        </Container>
      </div>
      <div className="footer-text">@2023 Hive Keychain</div>
    </div>
  );
}

export default App;
