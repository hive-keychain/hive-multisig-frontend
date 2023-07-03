import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import { SignatureRequestCallback } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useLocalStorage } from 'usehooks-ts';
import './App.css';
import NavBar from './components/navigating/NavBar';
import Routing from './components/navigating/Routing';
import { useAppDispatch, useAppSelector } from './redux/app/hooks';
import { signRequestCallBack } from './redux/features/multisig/multisigThunks';
function App() {
  const isLoginSucceed = useAppSelector(
    (state) => state.login.isSignatureSuccess,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const [isLoggedIn, setStorageIsLoggedIn] = useLocalStorage(
    'loginStatus',
    isLoginSucceed,
  );
  const dispatch = useAppDispatch();
  const signRequestListener: SignatureRequestCallback = (
    message: SignatureRequest,
  ) => {
    dispatch(signRequestCallBack(message));
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
