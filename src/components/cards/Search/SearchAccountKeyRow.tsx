import { FC } from 'react';
import { Form, InputGroup, Stack } from 'react-bootstrap';
import { IAccountKeyRowProps } from '../interfaces';

export const SearchAccountKeyRow: FC<IAccountKeyRowProps> = ( 
    {authorityName,
    type,
    accountKeyAuth}) =>{
        
        return (
            <Stack direction="horizontal" gap={3}>
              <InputGroup className="mb-3 ">
                <InputGroup.Text id="basic-addon1">
                  {type === 'Accounts' ? (
                    '@'
                  ) : (
                    <i className="fa fa-lock"></i>
                  )}
                </InputGroup.Text>
                <Form.Control
                  className="me-auto "
                  type="text"
                  placeholder={accountKeyAuth[0].toString()}
                  value = {accountKeyAuth[0]}
                  readOnly
        
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text className={'text-body'} id="basic-addon1">
                  Weight
                </InputGroup.Text>
                <Form.Control
                  type= {'text'}
                  min="1"
                  step="1"
                  className="form-control"
                  id="weightInput"
                  placeholder={accountKeyAuth[1].toString()}
                  value={accountKeyAuth[1]}
                  readOnly
                />
              </InputGroup>
            </Stack>
        )
}
