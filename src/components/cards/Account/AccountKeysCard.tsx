import { ReactNode, useEffect, useState } from "react";
import { Card, Container, Row } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import { Authorities, SignResponseType } from "../../../interfaces";
import { IAccountKeyRowProps, IAccountKeysCardProps } from "../../../interfaces/cardInterfaces";
import { useAppDispatch, useAppSelector } from "../../../redux/app/hooks";
import { addAccount } from "../../../redux/features/updateAuthorities/updateAuthoritiesSlice";
import { useDidMountEffect } from "../../../utils/utils";
import { AccountKeyRow } from "./AccountKeyRow";
import { AddAccountKeyRow } from "./AddAccountKeyRow";



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
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
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
            accountKeyAuth={accountKeyAuth} 
            isLoggedIn={loginState}
            componentColor={'gray'}
            />]}
       )
    );
    useEffect(()=>{
        if(isLoggedIn){
            if(loggedInAccount.data.username == newAuthorities.account){
                setLoginState(true);
            }
        }
        else{
            setLoginState(false);
        }
    },[isLoggedIn])
    
   
    useDidMountEffect(()=>{
      const newRow:[string, ReactNode ] = [newAccount[0].toString(),
      <AccountKeyRow
       key={newAccount[0].toString()}
       authorityName = {authorityName}
       type={authAccountType}
       accountKeyAuth={newAccount} 
       isLoggedIn={loginState}
       componentColor={'blue'}
       />]
  
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
     if(loginState){ 
        removeComponent() ;
      }
    },[newAuthorities])
  
    const removeComponent = ():void =>{
      const componentKeys = getComponentKeys();
      const accountNames = getNewAuthorityNames();
      const componentToDelete = componentKeys.filter((e) => !accountNames.includes(e))[0]
      console.log("componentToDelete",componentToDelete)
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
              {accountComponentList?accountComponentList.map((component) => {return <Row>{component[1]}</Row> }):<div></div>}
              {loginState? <Row><AddAccountKeyRow authAccountType={authAccountType} setNewAccount={setNewAccount}/></Row> :<div></div>}
          </Card.Body>
        </Container>
      </Card>
    );
  }