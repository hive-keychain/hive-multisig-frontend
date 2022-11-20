import { Op } from "hive-qrcode";
import { ReactElement, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import "./App.css";
import NavBar from "./components/NavBar";
import {Routes, Route, useNavigate, useParams} from 'react-router-dom'
import { Authorities } from "./interfaces/account.interface";
import AccountUtils from './utils/hive.utils';
import AuthorityList from './components/AuthorityList';
import SearchBar from "./components/SearchBar";
import { ids } from "webpack";
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
    if(username.length!==0){
      navigate(`/${username}`)
      GetAuthorities();
    }
  },[username])

  const GetAuthorities = async(input?:string) => {
    let searchKey = '';
    if(input){searchKey = input;
    }else{searchKey = username;}
    const response = await AccountUtils.getAccountAuthorities(searchKey);
    setAuthorities(response);
    if(response.active || response.owner || response.posting || searchKey === ''){
        setValidUsername(true);
    }else{
        setValidUsername(false);
    }
  }
  const OnSearchSubmit = (input:string) => {
      navigate(`/${input}`);
      GetAuthorities(input);
  }

  const OnAddressSubmit = (props:any) => {
    const params = useParams();
    let id = params.id;
    useEffect(() =>{
      if(id){
        props.setUsername(id);
      }
    },[])
    return (
      <div>
      </div>
    )
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
          <SearchBar handleOnSearchSubmit={OnSearchSubmit} username={username} validUsername={validUsername}/>
          <AuthorityList authorities={authorities}/>
          <Routes>
                <Route path='/' element={ <div></div>}/>
                <Route path='/:id' element={<OnAddressSubmit setUsername={setUsername}/>}/>
          </Routes>
        </Container>
      </div>
      <div className="footer-text">@2022 Hive Keychain</div>
    </div>
  );
}

export default App;
