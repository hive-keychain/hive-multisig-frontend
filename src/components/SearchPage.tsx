import React, { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useNavigate, useParams } from 'react-router-dom';
import { Authorities, ISearchBarInterface, ISearchPageInterface } from "../interfaces";
import { useAppSelector } from "../redux/app/hooks";
import AccountUtils from '../utils/hive.utils';
import AuthorityList from "./AuthorityList";

const SearchBar:React.FC<ISearchBarInterface> = (props:ISearchBarInterface) =>{
  const [input,setInput] = useState<string>('');
  const [isKeychain, setKeychain] = useState<boolean>(true);
  const isKeyChainFound = useAppSelector<boolean>(
    (state) => state.keychain.isKeyChainFound,
    );
    const keyChainMsg = useAppSelector((state) => state.keychain.message);
    const keyChainError = useAppSelector((state) => state.keychain.error);
    const navigate = useNavigate();
  
  useEffect(() =>{
    setKeychain(isKeyChainFound)
  },[isKeyChainFound])

  useEffect(()=>{
    const keyDownHandler = (e:KeyboardEvent )=>{
      if(e.key==='Enter'){
        redirect();
      }
    }
    document.addEventListener('keydown', keyDownHandler);
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  })

  const redirect = () =>{
    if(input && input!==''){
        navigate(`/@${input}`);
    }
    else{
      navigate('/');
    }
  }

  const DispalyHiveKeyChainError = () => {
    if(!isKeychain){
      return (
        <div className="ms-2 text-start" style={{color:"red"}}>{keyChainError}</div>
      )
    }else{
      return(<div></div>)
    }
  }
  const DisplayValidity = () =>{
    if(props.isValid===false){
      return (
        <div className="ms-2 text-start" style={{color:"red"}}>Invalid User</div>
      )
    }else{
      return(<div></div>)
    }
  }
  
  const handleOnClick =() =>{
    redirect();
  }

  return (
      <div>
        <DisplayValidity/>
        <DispalyHiveKeyChainError/>
        <InputGroup className='mb-3'>
        <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
          <Form.Control
            placeholder={props.username?props.username:"Username"}
            aria-label="Username"
            aria-describedby="basic-addon2"  
            onChange={(e)=>setInput(e.target.value)}
            value={input}
          />
          <Button 
            variant='outline-secondary' 
            id='button-addon2'
            onClick= {(e)=>handleOnClick()}
          >Search</Button>
        </InputGroup>
      </div>
  )
}

const SearchPage:React.FC<ISearchPageInterface>  = (props:ISearchPageInterface) =>{
  const [authorities, setAuthorities] = useState<Authorities>()
  const [isValid, setValid] = useState<boolean>()
  const params = useParams();
  const searchKey = params.id;

  useEffect(() =>{
    AccountUtils.GetAuthorities(setAuthorities,setValid,searchKey);
  },[searchKey]);

  return (
    <div>
      <SearchBar username={searchKey} isValid={isValid}/>
      <AuthorityList authorities={authorities}/>
    </div>
  )
}

const Search = {
  SearchBar,
  SearchPage,
}
export default Search;