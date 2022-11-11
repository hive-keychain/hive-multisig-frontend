import React, { Component } from "react";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

interface IProps {
    handleClick: (username: string) => void;
    isValidUser: boolean;
}
interface IState{
    username: string;
}

class SearchBar extends Component<IProps, IState>{
    constructor(props:IProps){
        super(props);
        this.state = {
             username: ''
            };
    }
   
    render() {
        return (
            <div>
                <div className="ms-2 text-start" style={{color:"red"}}>{this.props.isValidUser?'':'Invalid User'}</div>
                <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
                    <Form.Control
                    placeholder="Username"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    onChange={e=>this.setState({username: e.target.value})}
                    />
                    <Button 
                        variant="outline-secondary" 
                        id="button-addon2"
                        onClick={(event) => this.props.handleClick(this.state.username)}
                    >
                        Search
                        </Button>
                </InputGroup>
            </div>
        )
    }

}


export default SearchBar;