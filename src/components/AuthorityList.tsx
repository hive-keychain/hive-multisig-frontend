import * as Hive from '@hiveio/dhive';
import React, { useState } from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import { useReadLocalStorage } from 'usehooks-ts';
import { Authorities, UpdateAuthorityType } from "../interfaces";
import { UpdateWeight } from "./UpdateAuthorityModals";
interface Iprops {
    authorities: Authorities;
}


const AuthorityUpdateButtons = (props:UpdateAuthorityType) => {
  
    const isLoggedIn =  useReadLocalStorage('loginStatus')
    const [showUpdateWeight, setShowUpdateWeight] = useState<boolean>(false);
    const onUpdateWeightBtnClick = () => {
        setShowUpdateWeight(true);
    }
    const onDeleteBtnClick = () => {
    }

    if(isLoggedIn){
        return(
            <div>
                <div>
                    <UpdateWeight authDetails={props} showForm={showUpdateWeight} setShowForm={setShowUpdateWeight} />
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
    const isLoggedIn =  useReadLocalStorage('loginStatus')
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
                                                                </div>
                                                                <AuthorityUpdateButtons 
                                                                authorityType={name} 
                                                                authorities={authority} 
                                                                accountType={"account"} 
                                                                authorityToUpdate={k}/>
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
                                                            <AuthorityUpdateButtons 
                                                                authorityType={name} 
                                                                authorities={authority} 
                                                                accountType={"key"} 
                                                                authorityToUpdate={[k[0].toString(),k[1]]}/>
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