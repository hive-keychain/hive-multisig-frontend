import { useState } from "react";
import { Button, Form, InputGroup, Stack } from "react-bootstrap";
import { IAddAccountKeyProps } from "../interfaces";

  
export function AddAccountKeyRow({authAccountType, setNewAccount}: IAddAccountKeyProps) {
    const [accountName, setAccountName] = useState<string>('');
    const [weight, setAccountWeight] = useState<number>(1);
    const handleAddOnClick = () =>{
      if(accountName!==''){
        setNewAccount([accountName,weight]);
        setAccountName('');
        setAccountWeight(1);
      }
    }
    return (
      <Stack direction="horizontal" gap={3}>
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">
            {authAccountType === 'Accounts' ? (
              '@'
            ) : (
              <i className="fa fa-lock"></i>
            )}
          </InputGroup.Text>
          <Form.Control
            className="me-auto"
            type="text"
            placeholder={`Add ${
              authAccountType === 'Accounts' ? 'Account' : 'Key'
            }`}
            onChange={(e) => {setAccountName(e.target.value)}}
            value = {accountName}
          />
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">Weight</InputGroup.Text>
          <Form.Control
            type="number"
            min="1"
            step="1"
            className="form-control"
            id="weightInput"
            placeholder={'1'}
            onChange={(e) => {setAccountWeight(parseInt(e.target.value))}}
            value = {weight}
          />
        </InputGroup>
        <Button className="mb-3" variant="outline-primary" onClick={() => {handleAddOnClick()}}>
          Add{' '}
        </Button>
      </Stack>
    );
  }
  