import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import {useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { CheckKeychain } from '../utils/hive-keychain.utils';
import { useAppSelector } from '../redux/app/hooks'

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

const LoginButton = () => {
    const [isKeyChainActive, setKeychainState] = useState<boolean>(false);
    const [signedIn, setSignedIn] = useState<boolean>(false);
    const navigate = useNavigate();
    const isLoginSucceed  = useAppSelector(state => state.login.isSignatureSuccess)
    const signedAccountObj = useAppSelector(state => state.login.accountObject)

    useEffect(() => {
        console.log("Signed in: ", isLoginSucceed)
        setSignedIn(isLoginSucceed)
    },[isLoginSucceed])

    useEffect(() =>{
        if(!isKeyChainActive){
            HiveKeychainNotFound();
        }else{
            navigate('/login');
        }
    },[isKeyChainActive]);

    const handleBtnOnClick = ()=>{
        if(signedIn){
            navigate(`/@${signedAccountObj.data.username}`);
        }
        else{
            CheckKeychain(setKeychainState);
        }
    }

    const Display = ()  => {
        let text:string = "Login";
        if(signedIn){
            text = signedAccountObj.data.username
        }
        return(
            <Button 
                variant="outline-light"
                onClick={handleBtnOnClick}
            >{text}</Button> 
        )
    }
    
    return (
        <Display/>
    );  
}

export default LoginButton;