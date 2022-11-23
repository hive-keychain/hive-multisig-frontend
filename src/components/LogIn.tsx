import Button from 'react-bootstrap/Button';
import React, { Component, useState, useEffect, useReducer } from "react";
import *  as Ilogin from "../interfaces/login.interface";

const LogInButton: React.FC<Ilogin.ILogInButtonProps> = (props:Ilogin.ILogInButtonProps) => {
    const handleOnClick = () =>{
        props.handleLoginClick()
    }
    return (
        <Button 
            variant="outline-light"
            onClick={handleOnClick}
        >Log In</Button>
    );  
}

const LogInForm :React.FC<Ilogin.ILogInFormProps> = (props:Ilogin.ILogInFormProps) => {
    return(
        <div>
            <div className={`${!props.isShowLogin? "active":""} show`}>
                <div className="login-form">
                    <div className='form-box solid'>
                        <form>
                            <h1 className="login-text">Sign In</h1>
                            <label>Username</label><br></br>
                            <input
                                type="text"
                                name="username"
                                className="login-box"
                            /><br></br><br></br>
                            <input type="submit" value="LOGIN" className="login-btn"/>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

const LogIn ={LogInButton, LogInForm}

export default LogIn;