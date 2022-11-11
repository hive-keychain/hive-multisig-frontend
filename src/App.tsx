import { Op } from "hive-qrcode";
import { useState } from "react";
import { Container } from "react-bootstrap";
import "./App.css";
import NavBar from "./components/NavBar";
import SearchBar from "./components/SearchBar";
import AuthorityList from "./components/AuthorityList";
import "./utils/hive.utils"
import AccountUtils from "./utils/hive.utils";
import {Authorities } from "./interfaces/account.interface";
import React, { Component } from "react";

interface IProps{

}

interface IStates {
  op: Op;
  isValidUser: boolean;
  authorities: Authorities;
}

class App extends React.Component<IProps,IStates> {
  constructor(props:IProps){
    super(props);
    this.state = {
      op: null,
      isValidUser: true,
      authorities: {
        owner:null,
        active:null,
        posting:null
      }
    }
  }
 
  onSubmitOp = (op: Op) => {
    this.setState({op:op});
  };
  onUserSearch = async (username:string) => {
    const response = await AccountUtils.getAccountAuthorities(username);
    console.log(response);
    this.setState({authorities:response, isValidUser:response.owner?true:false});
  }

  render(){ 
    return (
        <div className="App">
        <NavBar />
        <div style={{ flex: 1 }}>
          <Container
            style={{
              marginTop: 50,
            }}  
          >
            <div>
              <SearchBar handleClick={this.onUserSearch} isValidUser={this.state.isValidUser}/>
            </div>
            <div>
              <AuthorityList authorities={this.state.authorities}/>
            </div>
          </Container>
        </div>
        
        <div className="footer-text">@2022 Hive Keychain</div>
      </div>
    )
        }
}

export default App;
