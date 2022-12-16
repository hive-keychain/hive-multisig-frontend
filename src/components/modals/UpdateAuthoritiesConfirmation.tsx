import * as Hive from '@hiveio/dhive';
import { useEffect, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useDispatch } from 'react-redux';
import { Authorities } from '../../interfaces';
import { useAppSelector } from '../../redux/app/hooks';
import { setOwnerKey } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
interface Iprops{
    show: boolean
    handleClose: Function
}
function UpdateAuthoritiesConfirmation({show, handleClose}:Iprops) {
   const dispatch = useDispatch();
    const originalAuthorities = useAppSelector(
        (state) => state.updateAuthorities.Authorities,
      );
    const newAuthorities = useAppSelector(
        (state) => state.updateAuthorities.NewAuthorities,
      );
    const isOwnerAuthUpdated = useAppSelector(
      (state) => state.updateAuthorities.isOwnerAuthUpdated,
    );
    const[origAuths, setOrigAuths] = useState<Authorities>(originalAuthorities)
    const[newAuths, setNewAuths] = useState<Authorities>(newAuthorities)
    const[key, setKey] =  useState<string>('');
    const[isOwnerUpdate, setIsOwnerUpdated] = useState<boolean>(isOwnerAuthUpdated);
    const[ownerAccountsDiff, setOwnerAccountsDiff] = useState<[string|Hive.PublicKey,number][]>([...origAuths.owner.account_auths]);
    const[ownerKeysDiff, setOwnerKeysDiff] = useState<[string|Hive.PublicKey,number][]>([...origAuths.owner.key_auths]);
    const[activeAccountsDiff, setActiveAccountsDiff] = useState<[string|Hive.PublicKey,number][]>([...origAuths.active.account_auths]);
    const[activeKeysDiff, setActiveKeysDiff] = useState<[string|Hive.PublicKey,number][]>([...origAuths.active.key_auths]);
    const[postingAccountsDiff, setPostingAccountsDiff] = useState<[string|Hive.PublicKey,number][]>([...origAuths.posting.account_auths]);
    const[postingKeysDiff, setPostingKeysDiff] = useState<[string|Hive.PublicKey,number][]>([...origAuths.posting.account_auths]);

    const update = (origAuth:[string|Hive.PublicKey,number][], newAuth:[string|Hive.PublicKey,number][], setter:Function) => {
        setter((prev:[string|Hive.PublicKey,number][]) => {
            const newAuths = [...prev];
            for(var i = 0; i< origAuth.length; i++){
                if(origAuth[i][1] !== newAuth[i][1]){
                    newAuths[i]=[...newAuth[i]];
                    newAuths[i][1] = newAuths[i][1];
                }
            }
            return newAuths;
        })
    }

    useEffect(()=>{
      console.log(key);
      dispatch(setOwnerKey(key));
    },[key])

    useEffect(()=>{
        setOrigAuths({...originalAuthorities});
    },[originalAuthorities])

    useEffect(()=>{
        setNewAuths({...newAuthorities});
        update(origAuths.owner.account_auths, newAuths.owner.account_auths, setOwnerAccountsDiff);
        update(origAuths.owner.key_auths, newAuths.owner.key_auths, setOwnerKeysDiff);
        update(origAuths.active.account_auths, newAuths.active.account_auths, setActiveAccountsDiff);
        update(origAuths.active.key_auths, newAuths.active.key_auths, setActiveKeysDiff);
        update(origAuths.posting.account_auths, newAuths.posting.account_auths, setPostingAccountsDiff);
        update(origAuths.posting.key_auths, newAuths.posting.key_auths, setPostingKeysDiff);
        console.log("newAuthorities.posting: ",newAuthorities.posting)
    },[newAuthorities])
   
    useEffect(() => {
      setIsOwnerUpdated(isOwnerAuthUpdated);
    },[isOwnerAuthUpdated])
    
    useEffect(() => {
        if(show)
        {
           
        }
    },[show])
    
    return (
    <div
      className="modal show"
      style={{ display: 'block', position: 'initial' }}
    >
      <Modal
        show={show}
        onHide={()=> {handleClose()}}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Account Authorities</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isOwnerAuthUpdated?
            <OnwerKeyInput setOwnerKey={setKey}/>
          :  <div>Are you sure you wanna update?</div>
        }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=> {handleClose()}}>
            Close
          </Button>
          <Button variant="primary">Update</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

interface IOwnerKeyProp{
  setOwnerKey: Function
}

const OnwerKeyInput = ({setOwnerKey}:IOwnerKeyProp) =>{
  const [key, setKey] = useState<string>('');
  useEffect(() => {
    setOwnerKey(key);
  },[key])
  return (
    <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">
          Owner Key
        </InputGroup.Text>
        <Form.Control
          type="text"
          min="1"
          step="1"
          className="form-control"
          id="threshInput"
          onChange={(e) => {
            setKey(e.target.value);
          }}
          placeholder={'Please enter your owner key.'}
          value={key}
        />
      </InputGroup>
  )
}

export default UpdateAuthoritiesConfirmation
