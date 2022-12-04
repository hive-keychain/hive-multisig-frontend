import {useEffect, useState, useRef} from 'react'
import { useNavigate } from 'react-router-dom';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../redux/app/hooks'
import { checkKeychain } from '../redux/features/keyChain/keyChainSlice';
import { hiveKeyChainRequestSign } from '../redux/features/login/loginSlice'

const  LoginForm = () => {
  const [username, setUsername] = useState<string>('');
  const isKeyChainFound = useAppSelector(state => state.keychain.isKeyChainFound) 
  const keyChainMsg = useAppSelector(state => state.keychain.message) 
  const keyChainError = useAppSelector(state => state.keychain.error) 
  const isLoginSucceed  = useAppSelector(state => state.login.isSignatureSuccess)
  const signedAccountObj = useAppSelector(state => state.login.accountObject)
  const dispatch = useAppDispatch()
  const navigate = useNavigate();

  const inputRef = useRef(null);
    useEffect(() => {
        inputRef.current.focus();
    }, []);

  useEffect(()=>{
    dispatch(hiveKeyChainRequestSign(username))
  },[isKeyChainFound])

  useEffect(() => {
    if(isLoginSucceed){
      navigate(`/@${signedAccountObj.data.username}`)
    }
  },[isLoginSucceed])

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

  const handleOnLoginSubmit = () => {
    dispatch(checkKeychain())
  }
  
  return (
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
  )
}

export default LoginForm