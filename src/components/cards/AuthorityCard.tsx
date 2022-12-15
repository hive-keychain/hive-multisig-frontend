import * as Hive from '@hiveio/dhive';
import { ReactNode, useEffect, useState } from 'react';
import { Button, Card, Container, Form, InputGroup, Stack } from "react-bootstrap";
import { useAppDispatch } from '../../redux/app/hooks';
import { updateAccount } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';


interface IAccountKeyRowProps {
    authAccountType: string
    accountKeyAuths: [string , number]
    updateAccKeyAuth: Function
    deleteAccKeyAuth: Function
}
export interface IAccountKeysCardProps {
    authorityName: string
    authAccountType: string
    accountKeyAuths: [string , number][]
}
interface IAuthorityCardProps{
    authorityName: string
    authority: Hive.AuthorityType
}
interface IAddAccountKeyProps {
    authAccountType: string
}
interface IAuthorityThreshProps{
    authorityName:string
    threshold:number
}

export function AccountKeyRow(props:IAccountKeyRowProps){
    const [editFlag, setEdiFlag] = useState<string> ('text-body')
    const handleUpdate = (newWeight:number) =>{
        console.log(newWeight, props.accountKeyAuths[1])
        if(newWeight!==props.accountKeyAuths[1]){
            setEdiFlag("text-danger")
            props.updateAccKeyAuth([props.accountKeyAuths[0],newWeight])
        }else{
            setEdiFlag("text-body")
        }
    }

    const handleDelete = () =>{
        props.deleteAccKeyAuth([props.accountKeyAuths[0]])
    }

    return(
        <Stack direction="horizontal" gap={3}>
            <InputGroup className="mb-3 ">
                <InputGroup.Text  id="basic-addon1">{props.authAccountType==='Accounts'?'@':<i className="fa fa-lock"></i>}</InputGroup.Text>
                <Form.Control className="me-auto " type="text" placeholder={props.accountKeyAuths[0].toString()} readOnly/>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text className={editFlag} id="basic-addon1" >Weight</InputGroup.Text>
                <Form.Control type="number" min="1" step="1" className="form-control" id="weightInput" 
                onChange={(e) => {handleUpdate(parseInt(e.target.value))}}
                placeholder={props.accountKeyAuths[1].toString()}
                />
            </InputGroup>
            <Button className="mb-3" variant="outline-danger" onClick={() => {handleDelete()}}>Delete</Button>
        </Stack>
    )
}


export function AccountKeysCard({authorityName,
                                authAccountType,
                                accountKeyAuths}:IAccountKeysCardProps) {
    const[editFlag, setEditFlag] = useState<boolean>(false);
    const[cardBorder, setCardBorder] = useState<string>('secondary');
    const[updateAccoutntKeyAuth, updateAccKeyAuth] = useState<[string, number]>();
    const[deleteAccKeyAuth, setDeleteAccKeyAuth] = useState<[string, number]>();

    const dispatch = useAppDispatch();

    useEffect(()=>{
        console.log(updateAccoutntKeyAuth)
        console.log(accountKeyAuths)
        if(updateAccoutntKeyAuth)
        {
            const index  =accountKeyAuths.findIndex((e) => e[0] === updateAccoutntKeyAuth[0]);
            console.log(index)
            if(index!==-1){
                //update the auth list
                accountKeyAuths[index] = updateAccoutntKeyAuth;
                //dispatch
                const prop:IAccountKeysCardProps = {
                    authorityName,
                    authAccountType,
                    accountKeyAuths
                }
                console.log(prop)
                dispatch(updateAccount(prop))
            }
        }
    },[updateAccoutntKeyAuth])


    return (
       <Card border={cardBorder}>
            <Container>
                <Card.Body>
                <Card.Title>{authAccountType}</Card.Title>
                    <Stack gap={2}>
                        {accountKeyAuths.map(
                            (accKeyAuth):ReactNode => (
                                <AccountKeyRow key={accKeyAuth[0].toString()} 
                                authAccountType={authAccountType}
                                accountKeyAuths={accKeyAuth} 
                                updateAccKeyAuth={updateAccKeyAuth}
                                deleteAccKeyAuth={setDeleteAccKeyAuth}
                                />
                            ) 
                        )}
                        <AddAccountKeyRow authAccountType={authAccountType} />
                    </Stack>
                </Card.Body>
            </Container>
        </Card>
  )
}

export function AuthorityWeightThreshold(props:IAuthorityThreshProps){
    const [weight,setNewWeightThresh] = useState<number>(props.threshold)
    const [editFlag, setEdiFlag] = useState<string> ('text-body')
    
    useEffect(()=>{
        if(weight!==props.threshold){
            setEdiFlag("text-danger")
        }else{
            setEdiFlag("text-body")
        }
    },[weight])

    return(
    <div>
            <Card>
            <Container>
                <Card.Body>
                <Stack direction="horizontal" gap={3}>
                    <InputGroup className="mb-3">
                        <InputGroup.Text className={editFlag} id="basic-addon1">Weight Threshold</InputGroup.Text>
                        <Form.Control type="number" min="1" step="1" className="form-control" id="threshInput" 
                        onChange={(e) => {setNewWeightThresh(parseInt(e.target.value))}}
                        placeholder={props.threshold.toString()}
                        />
                    </InputGroup>
                    <Button className="mb-3" variant="outline-danger">Delete</Button>
                </Stack>
                </Card.Body>
            </Container>
        </Card>
    </div>)
}
export function AddAccountKeyRow(props:IAddAccountKeyProps){

   
    return(
        <Stack direction="horizontal" gap={3}>
            <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">{props.authAccountType==='Accounts'?'@':<i className="fa fa-lock"></i>}</InputGroup.Text>
                <Form.Control className="me-auto" type="text" placeholder={`Add ${props.authAccountType==='Accounts'?'Account':'Key'}`} />
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">Weight</InputGroup.Text>
                <Form.Control type="number" min="1" step="1" className="form-control" id="weightInput" 
                    placeholder={'2'}
                />
            </InputGroup>
            <Button className="mb-3" variant="outline-primary">Add   </Button>
        </Stack>
    )
}
export function AuthorityCard(props:IAuthorityCardProps){
    const accounts:IAccountKeysCardProps = {
        authorityName: props.authorityName,
        authAccountType:"Accounts",
        accountKeyAuths: props.authority.account_auths
    }
    let keyAuths:[string,number][] = []
    const castToString = ([k,w]:[string|Hive.PublicKey,number]) => { keyAuths.push([k.toString(),w])}
    props.authority.key_auths.forEach((e) => {
        castToString(e);
    })
    const keys:IAccountKeysCardProps = {
        authorityName: props.authorityName,
        authAccountType:"Keys",
        accountKeyAuths: keyAuths
    }
    const thresh: IAuthorityThreshProps = {
        authorityName: props.authorityName,
        threshold: props.authority.weight_threshold
      }
    return (
        <Card>
        <Container>
        <Card.Body>
        <Card.Title>{props.authorityName}</Card.Title>
        <Stack gap={2}>
            <AccountKeysCard authorityName={props.authorityName} authAccountType={accounts.authAccountType} accountKeyAuths={ accounts.accountKeyAuths}/>
            <AccountKeysCard authorityName={props.authorityName} authAccountType={keys.authAccountType} accountKeyAuths={ keys.accountKeyAuths}/>
            <AuthorityWeightThreshold authorityName={props.authorityName} threshold={thresh.threshold}/>
        </Stack>
        </Card.Body>
        </Container>
        </Card>
    );
}

