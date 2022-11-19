import { Op } from "hive-qrcode";
import { ReactElement, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import "./App.css";
import NavBar from "./components/NavBar";
import {Routes, Route, useNavigate} from 'react-router-dom'
import { Authorities } from "./interfaces/account.interface";
import AccountUtils from './utils/hive.utils';
import AuthorityList from './components/AuthorityList';
import SearchBar from "./components/SearchBar";
function App() {
  const [op, setOp] = useState<Op>();
  const [username,setUsername] = useState<string>('');
  const [validUsername, setValidUsername] = useState<boolean>(true);
  const [authorities, setAuthorities] = useState<Authorities>();
  const onSubmitOp = (op: Op) => {
    setOp(op);
  };
 
  const navigate = useNavigate();
  
  useEffect(() =>{
    if(username){
        navigate(`/${username}`);
    }else{
        navigate(`/`);
    }
    getAuthorities(username);
  },[username]);


  const getAuthorities = async(id:string) => {
    const response = await AccountUtils.getAccountAuthorities(id);
    setAuthorities(response);
    if(response.active || response.owner || response.posting || username ===''){
        setValidUsername(true);
    }else{
        setValidUsername(false);
    }
    
  }

  const handleOnSearchSubmit = (input:string) => {
    setUsername(input);
  }
 
  return (
    <div className="App">
      <NavBar />
      <div style={{ flex: 1 }}>
        <Container
          style={{
            marginTop: 50,
          }}
        >
          <SearchBar handleOnSearchSubmit={handleOnSearchSubmit} isValidUserName={validUsername}/>
          <Routes>
                <Route path='/' element={<div></div>}/>
                <Route path='/:id' element={<AuthorityList authorities={authorities}/>}/>
        </Routes>
        </Container>
      </div>
      <div className="footer-text">@2022 Hive Keychain</div>
    </div>
  );
}

export default App;
