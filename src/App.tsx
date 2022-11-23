import { Op } from "hive-qrcode";
import {  useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import "./App.css";
import NavBar from "./components/NavBar";
import {Routes, Route, useNavigate, useParams} from 'react-router-dom'
import { Authorities } from "./interfaces/account.interface";
import AccountUtils from './utils/hive.utils';
import AuthorityList from './components/AuthorityList';
import SearchBar from "./components/SearchBar";
import LogIn from "./components/LogIn";
function App() {
  const [op, setOp] = useState<Op>();
  const [username,setUsername] = useState<string>('');
  const [validUsername, setValidUsername] = useState<boolean>(true);
  const [authorities, setAuthorities] = useState<Authorities>();
  const [isShowLogin, setIsShowLogin] = useState<boolean>(false);
  const onSubmitOp = (op: Op) => {
    setOp(op);
  };
 
  const navigate = useNavigate();
  
  useEffect(() =>{
    if(username.length!==0){
      navigate(`/@${username}`)
      AccountUtils.GetAuthorities(setAuthorities,setValidUsername,username);
    }
  },[username])

  const OnSearchSubmit = (input:string) => {
    if(input !== username){
      navigate(`/@${input}`);
    }
  }

  const OnAddressSubmit = (props:any) => {
    const params = useParams();
    useEffect(() =>{
      if(params.id){props.setUsername(params.id);}
    },[])
    return (<div></div>);
  }

  const handleLoginClick = () => {
    setIsShowLogin((isShowLogin) => !isShowLogin);
  }
  
  return (
    <div className="App">
      <NavBar handleLoginClick={handleLoginClick}/>
      <div style={{ flex: 1 }}>
        <Container
          style={{
            marginTop: 50,
          }}
        >
          <SearchBar handleOnSearchSubmit={OnSearchSubmit} username={username} validUsername={validUsername}/>
          <AuthorityList authorities={authorities}/>
          <LogIn.LogInForm isShowLogin={isShowLogin}/>
          <Routes>
                <Route path='/' element={ <div></div>}/>
                <Route path='/@:id' element={<OnAddressSubmit setUsername={setUsername}/>}/>
          </Routes>
        </Container>
      </div>
      <div className="footer-text">@2022 Hive Keychain</div>
    </div>
  );
}

export default App;
