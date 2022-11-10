import { Op } from "hive-qrcode";
import { useState } from "react";
import { Container } from "react-bootstrap";
import "./App.css";
import NavBar from "./components/NavBar";
import SearchBar from "./components/SearchBar";
import AuthorityList from "./components/AuthorityList";
import "./utils/hive.utils"
import AccountUtils from "./utils/hive.utils";
import { KeyAuth, Keys } from "./interfaces/account.interface";
import React, { Component } from "react";

interface IProps{

}

interface IStates {
  op: Op;
  authKeys: Keys;
}

class App extends React.Component<IProps,IStates> {
  constructor(props:IProps){
    super(props);
    this.state = {
      op: null,
      authKeys: {
        owner: [],
        active: [],
        posting:[]
      }
    }
  }
 
  onSubmitOp = (op: Op) => {
    this.setState({op:op});
  };
  onUserSearch = async (username:string) => {
    const response = await AccountUtils.getAccountAuthorities(username);
    this.setState({authKeys:response});
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
              <SearchBar handleClick={this.onUserSearch}/>
            </div>
            <div>
              <AuthorityList authkey={this.state.authKeys}/>
            </div>
          </Container>
        </div>
        
        <div className="footer-text">@2022 Hive Keychain</div>
      </div>
    )
        }
}

export default App;
