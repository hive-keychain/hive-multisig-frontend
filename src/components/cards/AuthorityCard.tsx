import * as Hive from '@hiveio/dhive';
import { FC, ReactNode, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Container,
  Form,
  InputGroup,
  Stack,
} from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import { Authorities } from '../../interfaces';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { addAccount, deleteAccount, updateAccount } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import { useDidMountEffect } from '../../utils/utils';

export interface IAccountKeyRowProps {
  authorityName: string;
  type: string;
  accountKeyAuth?: [string, number];
  threshold?: number;
}
 interface IAccountKeysCardProps {
  authorityName: string;
  authAccountType: string;
  accountKeyAuths: [string, number][];
}
interface IAuthorityCardProps {
  authorityName: string;
  authority: Hive.AuthorityType;
}
interface IAddAccountKeyProps {
  authAccountType: string;
  setNewAccount: Function;
}



export const AccountKeyRow: FC<IAccountKeyRowProps> = ({
  authorityName,
  type,
  accountKeyAuth,
}) =>{
  const [editFlag, setEdiFlag] = useState<string>('text-body');
  const [deleteComponentKey, setDeleteComponentKey] = useState<string>();
  const [weight, setWeight] = useState<number>(accountKeyAuth[1]);
  const [newAuth, setNewAuth] = useState<[string,number]>(accountKeyAuth);
  const dispatch = useAppDispatch();
  let isLoggedIn = useReadLocalStorage<boolean>('loginStatus');
  const [loginState, setLoginState] = useState<boolean>(isLoggedIn);
  useEffect(()=>{
    setLoginState(isLoggedIn);
  },[isLoggedIn])
  

  useDidMountEffect(()=> {
    if (weight !== accountKeyAuth[1]) {
      setEdiFlag('text-danger');
    } else {
      setEdiFlag('text-body');
    }
    setNewAuth([accountKeyAuth[0],weight]);
  },[weight])

  useDidMountEffect(()=>{
    if(newAuth){
      const payload: IAccountKeyRowProps = {
        authorityName,
        type,
        accountKeyAuth: [...newAuth]
      }
      dispatch(updateAccount(payload));
    }
  },[newAuth])
  
  useDidMountEffect(() => {
    if(deleteComponentKey!==''){
      const payload: IAccountKeyRowProps = {
        authorityName,
        type,
        accountKeyAuth: [...newAuth],
      }
      dispatch(deleteAccount(payload));
      setDeleteComponentKey('');
    }
  },[deleteComponentKey])
  
  const handleUpdate = (v:number) =>{
    setWeight(v);
  }
  const handleDelete = () => {
    setDeleteComponentKey(accountKeyAuth[0]);
  };

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
        <InputGroup.Text className={editFlag} id="basic-addon1">
          Weight
        </InputGroup.Text>
        <Form.Control
          type= {loginState?"number":'text'}
          min="1"
          step="1"
          className="form-control"
          id="weightInput"
          onChange={loginState?(e) => handleUpdate(parseInt(e.target.value)):null}
          placeholder={weight.toString()}
          value={weight}
          readOnly={loginState}
        />
      </InputGroup>
      {loginState?
        <Button
        className="mb-3"
        variant="outline-danger"
        onClick={() => {
          handleDelete();
        }}>
           Delete
      </Button>
      :<div></div>}
    </Stack>
  );
}
export function AccountKeysCard({
  authorityName,
  authAccountType,
  accountKeyAuths,
}: IAccountKeysCardProps) {
  const dispatch = useAppDispatch();
  const newAuthorities:Authorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities
  );
  let isLoggedIn = useReadLocalStorage<boolean>('loginStatus');
  const [loginState, setLoginState] = useState<boolean>(isLoggedIn);
  const [cardBorder, setCardBorder] = useState<string>('secondary');
  const [newAccount, setNewAccount] = useState<[string, number]>(['',1]);
  const [accountComponentList, setAccountComponentList] = useState<[string,ReactNode][]>(
    accountKeyAuths.map(
      (accountKeyAuth):[string,ReactNode] =>
        { return [accountKeyAuth[0], <AccountKeyRow
          key={accountKeyAuth[0].toString()}
          authorityName = {authorityName}
          type={authAccountType}
          accountKeyAuth={accountKeyAuth} />]}
     )
  );
  useEffect(()=>{
    setLoginState(isLoggedIn);
  },[isLoggedIn])
  
 
  useDidMountEffect(()=>{
    const newRow:[string, ReactNode ] = [newAccount[0].toString(),
    <AccountKeyRow
     key={newAccount[0].toString()}
     authorityName = {authorityName}
     type={authAccountType}
     accountKeyAuth={newAccount} />]

    setAccountComponentList(accountComponentList => [
        ...accountComponentList,
        newRow
      ])
    const payload:IAccountKeyRowProps={
      authorityName, 
      type:authAccountType,
      accountKeyAuth:newAccount
    }
  dispatch(addAccount(payload))
  },[newAccount])
  
  useDidMountEffect(()=>{
    removeComponent();
  },[newAuthorities])

  const removeComponent = ():void =>{
    const componentKeys = getComponentKeys();
    const accountNames = getNewAuthorityNames();
    const componentToDelete = componentKeys.filter((e) => !accountNames.includes(e))[0]
    const componentIndex = getComponentIndex(componentToDelete);
    let newComponentList:[string,ReactNode][] = []
    if(componentIndex!==-1){
      newComponentList=[...accountComponentList.slice(0,componentIndex), ...accountComponentList.slice(componentIndex+1)]
      setAccountComponentList([...newComponentList])
    }
  }

  const getComponentIndex = (key:string):number=>{
    let index = -1
    for(let i =0; i<accountComponentList.length; i++){
      if(accountComponentList[i][0] === key){
        index = i;
        break;
      }
    }
    return index;
  }
  const getComponentKeys = ():string[] =>{
    return accountComponentList?accountComponentList.map((component) => {return component[0]}):[]
  }
  const getNewAuthorityNames = ():string[] =>{
    let names:string[] = [];
    switch(authorityName.toLowerCase()){
      case 'owner':
        authAccountType.toLowerCase() === 'accounts'?
        names = newAuthorities.owner.account_auths.map((e) => {return e[0]}):
        names = newAuthorities.owner.key_auths.map((e) => {return e[0].toString()})
      break;
      case 'active':
        authAccountType.toLowerCase() === 'accounts'?
        names = newAuthorities.active.account_auths.map((e) => {return e[0]}):
        names = newAuthorities.active.key_auths.map((e) => {return e[0].toString()})
        break;
      case 'posting':
        authAccountType.toLowerCase() === 'accounts'?
        names = newAuthorities.posting.account_auths.map((e) => {return e[0]}):
        names = newAuthorities.posting.key_auths.map((e) => {return e[0].toString()})
        break;
    }
    return names;
  }

  return (
    <Card border={cardBorder}>
      <Container>
        <Card.Body>
          <Card.Title>{authAccountType}</Card.Title>
          <Stack gap={2}>
            {accountComponentList?accountComponentList.map((component) => {return component[1]}):<div></div>}
            {loginState?<AddAccountKeyRow authAccountType={authAccountType} setNewAccount={setNewAccount} />:<div></div>}
          </Stack>
        </Card.Body>
      </Container>
    </Card>
  );
}
export function AuthorityWeightThreshold({authorityName, type, threshold}: IAccountKeyRowProps) {
  const dispatch = useAppDispatch();
  const [weight, setNewWeightThresh] = useState<number>(threshold);
  const [editFlag, setEdiFlag] = useState<string>('text-body');
  let isLoggedIn = useReadLocalStorage<boolean>('loginStatus');
  const [loginState, setLoginState] = useState<boolean>(isLoggedIn);
  useEffect(()=>{
    setLoginState(isLoggedIn);
  },[isLoggedIn])
  
  useDidMountEffect(() => {
    if (weight !== threshold) {
      setEdiFlag('text-danger');
    } else {
      setEdiFlag('text-body');
    }
    const payload:IAccountKeyRowProps ={
      authorityName,
      type,
      threshold: weight
    }
    dispatch(updateAccount(payload));
  }, [weight]);

  return (
    <div>
      <InputGroup className="mb-3">
        <InputGroup.Text className={editFlag} id="basic-addon1">
          Weight Threshold
        </InputGroup.Text>
        <Form.Control
          type={loginState?"number":"text"}
          min="1"
          step="1"
          className="form-control"
          id="threshInput"
          onChange={loginState?(e) => {
            setNewWeightThresh(parseInt(e.target.value));
          }:null}
          placeholder={weight.toString()}
          value={weight}
          readOnly={loginState}
        />
      </InputGroup>
    </div>
  );
}
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

export function AuthorityCard(props: IAuthorityCardProps) {
  const accounts: IAccountKeysCardProps = {
    authorityName: props.authorityName,
    authAccountType: 'Accounts',
    accountKeyAuths: props.authority.account_auths,
  };
  let keyAuths: [string, number][] = [];
  const castToString = ([k, w]: [string | Hive.PublicKey, number]) => {
    keyAuths.push([k.toString(), w]);
  };
  props.authority.key_auths.forEach((e) => {
    castToString(e);
  });
  const keys: IAccountKeysCardProps = {
    authorityName: props.authorityName,
    authAccountType: 'Keys',
    accountKeyAuths: keyAuths,
  };
  const thresh: IAccountKeyRowProps = {
    type: 'threshold',
    authorityName: props.authorityName,
    threshold: props.authority.weight_threshold,
  };
  return (
    <Card>
      <Container>
        <Card.Body>
          <Card.Title>{props.authorityName}</Card.Title>
          <Stack gap={2}>
            <AccountKeysCard
              authorityName={props.authorityName}
              authAccountType={accounts.authAccountType}
              accountKeyAuths={accounts.accountKeyAuths}
            />
            <AccountKeysCard
              authorityName={props.authorityName}
              authAccountType={keys.authAccountType}
              accountKeyAuths={keys.accountKeyAuths}
            />
            <AuthorityWeightThreshold
              type={thresh.type}
              authorityName={thresh.authorityName}
              threshold={thresh.threshold}
            />
          </Stack>
        </Card.Body>
      </Container>
    </Card>
  );
}
