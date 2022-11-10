import React, { Component } from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import {Keys} from '../interfaces/account.interface';

interface Iprops {
    authkey: Keys;
}

class AuthorityList extends Component<Iprops>{
    constructor(props:Iprops){
        super(props);
    }
    render(){
        return(
            <div>
                <h2 >Owner</h2>
                <div>
                    <ListGroup variant="flush">
                        { 
                            this.props.authkey.owner.map((k, w): React.ReactNode =>
                                    <ListGroup.Item>{k.key.toString()}</ListGroup.Item>
                                )
                        }
                    </ListGroup>
                </div>
                <h2>Active</h2>
                <div>
                    <ListGroup variant="flush">
                        { 
                            this.props.authkey.active.map((k, w) =>
                                    <ListGroup.Item>{k.key.toString()}</ListGroup.Item>
                                )
                        }
                    </ListGroup>
                </div>
                <h2>Posting</h2>
                <div>
                    <ListGroup variant="flush">
                        { 
                            this.props.authkey.posting.map((k, w) =>
                                    <ListGroup.Item>{k.key.toString()}</ListGroup.Item>
                                )
                        }
                    </ListGroup>
                </div>
            </div>
        )
    }
}
export default AuthorityList;