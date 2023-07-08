import { Container } from 'react-bootstrap';
import './App.css';
import NavBar from './components/navigating/NavBar';
import Routing from './components/navigating/Routing';
function App() {
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
