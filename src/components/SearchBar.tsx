import React, { Component, useState, useEffect } from "react";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

const SearchBar = (props:any) =>{
    const [input,setInput] = useState<string>();
    return(

      <div>
        <div className="ms-2 text-start" style={{color:"red"}}>{props.isValidUserName?'':'Invalid User'}</div>
        <InputGroup className='mb-3'>
          <Form.Control
            placeholder={input?input:"Username"}
            aria-label="Username"
            aria-describedby="basic-addon2"  
            onChange={(e)=>setInput(e.target.value)}
          />
          <Button 
            variant='outline-secondary' 
            id='button-addon2'
            onClick= {()=>props.handleOnSearchSubmit(input)}
          >Search</Button>
        </InputGroup>
      </div>
    )
  }

export default SearchBar;