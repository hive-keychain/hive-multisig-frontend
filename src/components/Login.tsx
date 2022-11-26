import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import React, {useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { CheckKeychain, RequestSign } from '../utils/hive-keychain.utils';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import { Form } from 'react-bootstrap';
import { IHiveSignatureInterface, SignBufferMessageObject } from '../interfaces/hive-keychain.interface';
import { getTimestampInSeconds } from '../utils/utils';
const HiveKeychainNotFound = () => {
    return (
        <Toast>
            <Toast.Header>
                <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
                <strong className="me-auto">Hive Keychain</strong>
            </Toast.Header>
            <Toast.Body>Extension Not Found.</Toast.Body>
        </Toast>
    )
}

export const LoginButton = () => {
    const [isKeyChainActive, setKeychainState] = useState<boolean>(false);
    const navigate = useNavigate();
    useEffect(() =>{
        if(!isKeyChainActive){
            HiveKeychainNotFound();
        }else{
            navigate('/login');
        }
    },[isKeyChainActive]);

    const handleOnClick = ()=>{
        CheckKeychain(setKeychainState);
    }
    return (
        <Button 
            variant="outline-light"
            onClick={handleOnClick}
        >Log In</Button>
    );  
}

export const LoginForm  = () => {
    const [username, setUsername] = useState<string>('');
    const [isValidLogin, setValidLogin] = useState<boolean>();
    const navigate = useNavigate();
    const inputRef = useRef(null);
    useEffect(() => {
        inputRef.current.focus();
    }, []);
    useEffect(()=>{
        if(isValidLogin){
            navigate(`/@${username}`);
        }
    },[isValidLogin])

    const signBufferSuccessCallback = (response:any) => {
        setValidLogin(response.success);
    }
    const handleOnLoginSubmit = () =>{
        if(username!==''){
            const messageObj:SignBufferMessageObject ={
                username:username,
                timestamp: getTimestampInSeconds(),
                message:"sign in from hive multisig"
            }
            const sigObj:IHiveSignatureInterface = {
                username:username,
                message:messageObj,
                key:'Posting',
                responseCallback:signBufferSuccessCallback
            }
            RequestSign(sigObj);
        }
    }

    useEffect(()=>{
        const keyDownHandler = (e:KeyboardEvent )=>{
          if(e.key==='Enter'){
            handleOnLoginSubmit();
          }
        }
        document.addEventListener('keydown', keyDownHandler);
        return () => {
          document.removeEventListener('keydown', keyDownHandler);
        };
      })
    return(
        <div>
        <div className="ms-2 text-start" style={{color:"black"}}>Login</div>
        <InputGroup className='mb-3'>
        <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
          <Form.Control
            placeholder={username!==''?username:"Username"}
            aria-label="Username"
            aria-describedby="basic-addon2"  
            onChange={(e)=>setUsername(e.target.value)}
            value={username}
            ref={inputRef}
          />
          <Button 
            variant='outline-secondary' 
            id='button-addon2'
            onClick= {()=>handleOnLoginSubmit()}
          >Login</Button>
        </InputGroup>
      </div>
    );
}

