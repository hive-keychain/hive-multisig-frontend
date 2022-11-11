import React, { Component } from "react";
import { Badge } from "react-bootstrap";
import ListGroup from 'react-bootstrap/ListGroup';
import {Authority, KeyAuth, Keys} from '../interfaces/account.interface';

interface Iprops {
    authkey: Keys;
}


class AuthorityList extends Component<Iprops>{
    constructor(props:Iprops){
        super(props);
    }

    addList = (name:string, authority:KeyAuth[])=>{
        return (
                    <ListGroup.Item
                        as="li"
                        className="d-flex"
                    >
                        <div className="ms-2 text-start">
                            <div className="fw-bold">{name}</div>
                            <div className="ms-2 me-auto">
                                { 
                                    authority.length>0?
                                    <ListGroup variant="flush">
                                        {   
                                            authority.map((k):  React.ReactNode=>
                                            <ListGroup.Item key={k.key.toString()}>
                                                <div>
                                                    {k.key.toString()}
                                                    <Badge bg="secondary" pill >{k.weight}</Badge>
                                                </div>
                                            </ListGroup.Item>
                                            )
                                        }
                                    </ListGroup>
                                    :''
                                }
                            </div>
                        </div>
                    </ListGroup.Item>
        )
    }
    render(){
            return(
            
                <ListGroup as="ol">            
                    <div>
                        {this.addList('Owner',this.props.authkey.owner)}
                        {this.addList('Active',this.props.authkey.active)}
                        {this.addList('Posting',this.props.authkey.posting)}    
                    </div>
                    
                </ListGroup>
    
            )
        }
    }
export default AuthorityList;