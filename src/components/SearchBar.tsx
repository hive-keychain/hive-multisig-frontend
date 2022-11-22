import React, { Component, useState, useEffect, useReducer } from "react";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import {useParams} from 'react-router-dom';
import { ids } from "webpack";

const SearchBar = (props:any) =>{
    const [input,setInput] = useState<string>(props.username);
    useEffect(()=>{
      setInput(props.username);
    },[])
    return(
      <div>
        <div className="ms-2 text-start" style={{color:"red"}}>{props.validUsername?'':'Invalid User'}</div>
        <InputGroup className='mb-3'>
        <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
          <Form.Control
            placeholder={props.username?props.username:"Username"}
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