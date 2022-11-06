import { Op } from "hive-qrcode";
import { useState } from "react";
import { Container } from "react-bootstrap";
import "./App.css";
import NavBar from "./components/NavBar";
import "./utils/hive.utils"
import AccountUtils from "./utils/hive.utils";
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
          }}
        >
          Put the App body here
        </Container>
      </div>
      <div className="footer-text">@2022 Hive Keychain</div>
    </div>
  );
}

export default App;
