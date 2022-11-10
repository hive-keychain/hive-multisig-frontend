import React, { Component } from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import {Keys} from '../interfaces/account.interface';


class AuthorityList extends Component<Keys>{
    constructor(props:Keys){
        super(props);
        console.log(props);
    }
    render(){
        return(
            <div>
                <div>
                    <ListGroup variant="flush">
                        { 
                            this.props.owner.map((k, w) =>
                                    <ListGroup.Item>k</ListGroup.Item>
                                )
                        }
                    </ListGroup>
                </div>
            
                <div>
                    <ListGroup variant="flush">
                        { 
                            this.props.active.map((k, w) =>
                                    <ListGroup.Item>k</ListGroup.Item>
                                )
                        }
                    </ListGroup>
                </div>
            
                <div>
                    <ListGroup variant="flush">
                        { 
                            this.props.posting.map((k, w) =>
                                    <ListGroup.Item>k</ListGroup.Item>
                                )
                        }
                    </ListGroup>
                </div>
            </div>
        )
    }
}
export default AuthorityList;