import React, { Component } from "react";
import { Badge } from "react-bootstrap";
import ListGroup from 'react-bootstrap/ListGroup';
import * as Hive from '@hiveio/dhive';
import { Authorities } from "../interfaces/account.interface";
interface Iprops {
    authorities: Authorities;
}

class AuthorityList extends Component<Iprops>{
    constructor(props:Iprops){
        super(props);
    }

    addList = (name:string, authority:Hive.Authority)=>{
        return (
                    authority?
                    <div>
                        <ListGroup.Item
                            as="li"
                            className="d-flex"
                        >
                            <div className="ms-2 text-start">
                                <div className="fw-bold">{name}</div>
                                <div className="ms-2 me-auto">
                                    { 
                                        <div>
                                        <div>
                                        <ListGroup variant="flush">
                                            {   
                                                    authority.account_auths.map((k):  React.ReactNode=>
                                                        <ListGroup.Item key={k[0].toString()}>
                                                            <div>
                                                                <b className="text-secondary">Account: @</b>{k[0].toString()} <br/>
                                                                <b className="text-secondary">Weight: </b>{k[1]}
                                                            </div>
                                                        </ListGroup.Item>
                                                    )
                                                    
                                            }
                                            {   
                                                    authority.key_auths.map((k):  React.ReactNode=>
                                                    <ListGroup.Item key={k[0].toString()}>
                                                        <div>
                                                            <b className="text-secondary">Key: </b>{k[0].toString()} <br/>
                                                            <b className="text-secondary">Weight: </b>{k[1]}
                                                        </div>
                                                    </ListGroup.Item>
                                                    )
                                            }
                                            { 
                                                    <div>
                                                        {
                                                            <div>
                                                            <ListGroup.Item key={name+'WeighThreshold'}>
                                                                <b className="text-secondary">Threshold: </b>{authority.weight_threshold}
                                                            </ListGroup.Item>
                                                            </div>
                                                        }
                                                    </div>
                                            }
                                        </ListGroup>
                                        </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </ListGroup.Item>
                    </div>
                    :''
        )
    }
    render(){
            return(
                
                this.props.authorities?
                <ListGroup as="ol">            
                    <div>
                        {this.addList('Owner',this.props.authorities.owner)}
                        {this.addList('Active',this.props.authorities.active)}
                        {this.addList('Posting',this.props.authorities.posting)}    
                    </div>
                    
                </ListGroup>:''
    
            )
        }
    }
export default AuthorityList;