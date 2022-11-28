import Button from 'react-bootstrap/Button';
import React, { Component, useState, useEffect, useReducer } from "react";


const LogInButton = () => {
    return (
        <Button 
            variant="outline-light"
        >Log In</Button>
    );  
}

const LogInForm  = () => {
    return(
        <div>
           
        </div>
    );
}

const LogIn ={LogInButton, LogInForm}

export default LogIn;