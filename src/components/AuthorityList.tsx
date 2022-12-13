import * as Hive from '@hiveio/dhive';
import React, { useEffect, useState } from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import { useReadLocalStorage } from 'usehooks-ts';
import { Authorities, IDHiveAccountUpdateBroadcast, IHiveAccountUpdateBroadcast, IUpdateAuthorities, SignResponseType, UPDATE_TARGET, UPDATE_TARGET_AUTHORITY } from "../interfaces";
import { useAppDispatch } from '../redux/app/hooks';
import { dhiveBroadcastUpdateAccount, hiveKeyChainRequestBroadCast } from '../redux/features/updateAuthorities/updateAuthoritiesSlice';
import { UpdateWeight } from "./UpdateAuthorityModals";
interface Iprops {
    authorities: Authorities;
}
const CreateNewAuthority = (props:IUpdateAuthorities, weight:number): Authorities => {
    const newAuthority: Hive.Authority = JSON.parse(JSON.stringify(props.targetAuthority));
    const newAuthorities: Authorities = JSON.parse(JSON.stringify(props.authorities));

    let index = 0;
    switch(props.targetAccountType){
        case UPDATE_TARGET.ACCOUNT:
            index = newAuthority.account_auths.findIndex((acc) => acc[0] === props.targetAuthAccount[0].toString())
            newAuthority.account_auths[index] = [newAuthority.account_auths[index][0].toString(),weight]
            break;
        case UPDATE_TARGET.KEY:
            index = newAuthority.key_auths.findIndex((acc) => acc[0] === props.targetAuthAccount[0].toString())
            newAuthority.key_auths[index] = [newAuthority.key_auths[index][0].toString(),weight]
            break;

    }
    switch(props.targetAuthType){
        case UPDATE_TARGET_AUTHORITY.ACTIVE:
            newAuthorities.active = newAuthority;
            newAuthorities.posting = undefined;
            newAuthorities.owner = undefined;
            break;

        case UPDATE_TARGET_AUTHORITY.POSTING:
            newAuthorities.posting = newAuthority;
            break;

        default:
            newAuthorities.owner = newAuthority;
            break;

    }
    return newAuthorities;
}

const AuthorityUpdateButtons  = (props:IUpdateAuthorities) => {
    const accountDetails = useReadLocalStorage<SignResponseType>('accountDetails');
    const username:string = accountDetails?accountDetails.data.username:'';
    const isLoggedIn =  useReadLocalStorage<boolean>('loginStatus')
    const [showUpdateWeight, setShowUpdateWeight] = useState<boolean>(false);
    const [weight, setNewWeight] = useState<number>(props.targetAuthAccount[1]);
    const [ownerKey, setOwnerKey] = useState<string>('')
    const dispatch = useAppDispatch();

    const onUpdateWeightBtnClick = () => {
        setShowUpdateWeight(true);
       
    }
    const onDeleteBtnClick = () => {
    }       

  
    useEffect(() => {
        if(weight!==props.targetAuthAccount[1]){
            const newAuthorities = CreateNewAuthority(props,weight);

            if(props.targetAuthType === UPDATE_TARGET_AUTHORITY.OWNER
                 || props.targetAuthType === UPDATE_TARGET_AUTHORITY.POSTING){
                    const dhiveUpdate:IDHiveAccountUpdateBroadcast = {
                        newAuthorities,
                        ownerKey
                    }
                    dispatch(dhiveBroadcastUpdateAccount(dhiveUpdate));
                 }
            else{
                const hiveUpdate:IHiveAccountUpdateBroadcast = {
                    newAuthorities,
                    targetAuthorityType: props.targetAuthType
                }
                dispatch(hiveKeyChainRequestBroadCast(hiveUpdate))
            }
        }
    },[weight])

    if(isLoggedIn){
        return(
            <div>
                <div>
                    <UpdateWeight  showForm={showUpdateWeight} 
                                    setShowForm={setShowUpdateWeight} 
                                    setOwnerKey={setOwnerKey}
                                    targetAuthType = {props.targetAuthType}
                                    targetAccountType = {props.targetAccountType}
                                    targetAuthAccount={props.targetAuthAccount}
                                    setNewWeight={setNewWeight}
                                    />
                </div>
                <div className="btn-group" role="group" aria-label="Basic example">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onUpdateWeightBtnClick()}>Update Weight</button>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onDeleteBtnClick()}>Delete Authority</button>
                </div>
            </div>
        )
    }
}

const ThesholdUpdateButton =(props:any) => {
    let isLoggedIn  = useReadLocalStorage<boolean>('loginStatus')
    const OnUpdateClick = (authType:string) =>{
        console.log(`UPDATE Treshold of ${authType}`)
    } 
    if(isLoggedIn)
    {
        return(
            <button  type="button" className="btn btn-outline-secondary btn-sm" onClick={() => {OnUpdateClick(props.authType)}}>Update Threshold</button>
        )
    }
}

const AddAuthorityButton = (props:any) => {
    const isLoggedIn =  useReadLocalStorage<boolean>('loginStatus')
    const onAddClick = (authType:string) => {
        console.log(`ADD Authority in ${authType}`)
    }
    if(isLoggedIn)
    {
        return(
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onAddClick(props.authType)}>Add Authority</button>
        )
    }
}
const AuthorityList = (props:Iprops) =>{
    console.log(props.authorities)
    const addList = (name:string, authority:Hive.Authority)=>{
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
                                                                <div>
                                                                    <b className="text-secondary">Account: @</b>{k[0].toString()} <br/>
                                                                    <b className="text-secondary">Weight: </b>{k[1]}
                                                                    <AuthorityUpdateButtons authorities={props.authorities}
                                                                    targetAuthority={authority} targetAuthType={name} 
                                                                    targetAuthAccount={k} targetAccountType={UPDATE_TARGET.ACCOUNT}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </ListGroup.Item>
                                                    )
                                                    
                                            }
                                            {   
                                                    authority.key_auths.map((k):  React.ReactNode=>
                                                    <ListGroup.Item key={k[0].toString()}>
                                                        <div>
                                                            <b className="text-secondary">Key: </b>{k[0].toString()} <br/>
                                                            <b className="text-secondary">Weight: </b>{k[1]} <br/>
                                                            <AuthorityUpdateButtons authorities={props.authorities} 
                                                            targetAuthority={authority} targetAuthType={name} 
                                                            targetAuthAccount={k} targetAccountType={UPDATE_TARGET.KEY}
                                                            />
                                                        </div>
                                                    </ListGroup.Item>
                                                    )
                                            }
                                            { 
                                                    <div>
                                                        {
                                                            <div >
                                                            <ListGroup.Item key={name+'WeighThreshold'}>
                                                                <b className="text-secondary">Threshold: </b>{authority.weight_threshold}<br/>
                                                                <ThesholdUpdateButton authType={name}/>
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
                                <br/>
                                <AddAuthorityButton authType={name}/>
                            </div>
                        </ListGroup.Item>
                    </div>
                    :''
        )
    }
        return(
            props.authorities?
            <ListGroup as="ol">            
                <div>
                    {addList('Owner',props.authorities.owner)}
                    {addList('Active',props.authorities.active)}
                    {addList('Posting',props.authorities.posting)}    
                </div>
            </ListGroup>:<div></div>
        )
    }
export default AuthorityList;