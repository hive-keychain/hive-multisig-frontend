import * as Hive from '@hiveio/dhive';
import { useEffect, useState } from "react";
import { Button, Form, InputGroup, Stack } from "react-bootstrap";
import { useReadLocalStorage } from 'usehooks-ts';
import { SignResponseType } from '../../../interfaces';
import { GetPrivateKeyFromSeed } from '../../../utils/hive.utils';
import { useDidMountEffect } from '../../../utils/utils';
import NewKeys from '../../modals/NewKeys';
import { IAddAccountKeyProps } from "../interfaces";

  
export function AddAccountKeyRow({authAccountType, setNewAccount}: IAddAccountKeyProps) {
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    const [user, setUser] = useState<SignResponseType>(loggedInAccount);
    const [accountName, setAccountName] = useState<string>('');
    const [weight, setAccountWeight] = useState<number>(1);
    const [privateKey, setPrivateKey] = useState<string>('');
    const [publicKey, setPublicKey] = useState<string>('');
    const [showNewKeys, setShowNewKeys] = useState<boolean>(false);
    useEffect(()=>{
      setUser(loggedInAccount)
    },[user])
    useEffect(()=>{
      setAccountName(publicKey);
    },[publicKey])

    useDidMountEffect(()=>{
      if(privateKey!==''){
        setShowNewKeys(true);
      }
    },[privateKey])

    const handleAddOnClick = () =>{
      if(accountName!==''){
        setNewAccount([accountName,weight]);
        setAccountName('');
        setAccountWeight(1);
      }
    }
    const handleNewKeyOnClick = () =>{
      const pvtKey:Hive.PrivateKey  = GetPrivateKeyFromSeed(user.data.username+Date.now()+Math.random());
      const pubKey:Hive.PublicKey = pvtKey.createPublic();
      setPrivateKey(pvtKey.toString());
      setPublicKey(pubKey.toString());
    }
    return (
      <div>
      <div>
        <NewKeys show={showNewKeys} setShowNewKeys={setShowNewKeys} publicKey={publicKey} privateKey={privateKey}/>
      </div>
      <div>
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
           {authAccountType==='Keys'?
          <Button  variant="outline-secondary" onClick={() => {handleNewKeyOnClick()}}>
           New Key
          </Button>
          :<div></div>
          }
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
      </div>
      </div>
      
      
    );
  }
  