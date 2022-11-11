import React, { Component } from "react";
import { Badge } from "react-bootstrap";
import ListGroup from 'react-bootstrap/ListGroup';
import {Authority, Keys} from '../interfaces/account.interface';

interface Iprops {
    authkey: Keys;
}

class AuthorityList extends Component<Iprops>{
    constructor(props:Iprops){
        super(props);
    }
    render(){
            return(
            
                <ListGroup as="ol">            
                    <ListGroup.Item
                        as="li"
                        className="d-flex"
                    >
                        <div className="ms-2 text-start">
                            <div className="fw-bold">Owner</div>
                            <div className="ms-2 me-auto">
                                { 
                                    this.props.authkey.owner.length>0?
                                    <ListGroup variant="flush">
                                        {   
                                            this.props.authkey.owner.map((k):  React.ReactNode=>
                                            <ListGroup.Item key={k.key.toString()} className='d-flex justify-content-between align-items-center'>
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
    
                    <ListGroup.Item
                        as="li"
                        className="d-flex"
                    >
    
                        <div className="ms-2 text-start">
                            <div className="fw-bold">Active</div>
                            <div className="ms-2 me-auto">
                                {
                                    this.props.authkey.active.length>0?
                                    <ListGroup variant="flush">
                                        { 
                                            this.props.authkey.active.map((k):  React.ReactNode=>
                                                        <ListGroup.Item key={k.key.toString()} className='d-flex justify-content-between align-items-center'>
                                                            {k.key.toString()}
                                                            <Badge bg="secondary" pill className="float-left">{k.weight}</Badge>
                                                        </ListGroup.Item>
                                                )
                                        }
                                    </ListGroup>
                                    :''
                                }
                            </div>
                                    
                        </div>
                    </ListGroup.Item>
    
                    <ListGroup.Item
                        as="li"
                        className="d-flex"
                    >
    
                        <div className="ms-2 text-start">
                            <div className="fw-bold">Posting</div>
                            <div className="ms-2 me-auto">
                                {
                                    this.props.authkey.posting.length>0?
                                    <ListGroup variant="flush">
                                        { 
                                            this.props.authkey.posting.map((k):  React.ReactNode=>
                                                        <ListGroup.Item key={k.key.toString()} className='d-flex justify-content-between align-items-center'>
                                                            {k.key.toString()}
                                                            <Badge bg="secondary" pill className="float-left">{k.weight.toString()}</Badge>
                                                        </ListGroup.Item>
                                                )
                                        }
                                    </ListGroup>
                                    :''
                                }
                            </div>
                        </div>
                    </ListGroup.Item>
                </ListGroup>
    
            )
        }
    }
export default AuthorityList;