import * as Hive from '@hiveio/dhive';
import { useEffect, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Authorities, IDHiveAccountUpdateBroadcast, IHiveAccountUpdateBroadcast } from '../../interfaces';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { dhiveBroadcastUpdateAccount, hiveKeyChainRequestBroadCast, setOwnerKey } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import { useDidMountEffect } from '../../utils/utils';
interface Iprops{
    show: boolean
    handleClose: Function
}

function UpdateAuthoritiesConfirmation({show, handleClose}:Iprops) {
   const dispatch = useAppDispatch();
   
   const isUpdateSucceed = useAppSelector(
    (state) => state.updateAuthorities.isUpdateSucces
   );
    const originalAuthorities = useAppSelector(
        (state) => state.updateAuthorities.Authorities,
      );
    const newAuthorities = useAppSelector(
        (state) => state.updateAuthorities.NewAuthorities,
      );
    const isOwnerAuthUpdated = useAppSelector(
      (state) => state.updateAuthorities.isOwnerAuthUpdated,
    );
    const isPostingAuthUpdated =useAppSelector(
      (state) => state.updateAuthorities.isPostingAuthUpdated,
    );
    const[origAuths, setOrigAuths] = useState<Authorities>(originalAuthorities)
    const[isDispatched,setDispatched] = useState<boolean>(false);
    const[updateError, setUpdateError] = useState<boolean>(false);
    const[updateResult, setUpdateResult] = useState<boolean>(isUpdateSucceed);
    const[newAuths, setNewAuths] = useState<Authorities>(newAuthorities)
    const[isOwnerUpdate, setIsOwnerUpdated] = useState<boolean>(isOwnerAuthUpdated);
    const[isPostingUpdate, setIsPostingUpdate] = useState<boolean>(isPostingAuthUpdated);
    const[key, setKey] =  useState<string>('');
    const[showModal, setShowModal] = useState<boolean>(show);
      
    useEffect(()=>{
      setShowModal(show);
    },[show])

    useDidMountEffect(()=>{
      dispatch(setOwnerKey(key));
    },[key])

    useEffect(()=>{
      setNewAuths({...newAuthorities});
    },[newAuthorities])
    useEffect(() => {
      setIsOwnerUpdated(isOwnerAuthUpdated);
    },[isOwnerAuthUpdated])
    useEffect(()=>{
      setIsPostingUpdate(isPostingAuthUpdated)
    },[isPostingUpdate])

    useDidMountEffect(() =>{
      if(isDispatched || updateResult){ 
        setShowModal(false);
        setUpdateError(false);
        window.location.reload();
      }else {
        setUpdateError(true);
      }
    },[updateResult])

    useDidMountEffect(()=>{
      if(isUpdateSucceed){
        setUpdateResult(true);
      }else{
        setUpdateResult(false);
      }
    },[isUpdateSucceed])
    const orderAlphabetically = (auths:[string|Hive.PublicKey,number][]):[string,number][]=>{
      const names = auths.map((auth) => auth[0]).sort()
      const sortedArr:[string,number][] = []
      for(let i=0; i<names.length;i++){
        const index = auths.findIndex((e) => e[0]==names[i]);
        const element:[string,number] = [auths[index][0].toString(),auths[index][1]]
        sortedArr.push(element);
      }
      return sortedArr;
    }
    const handleUpdate = () =>{
      if(isOwnerUpdate||isPostingUpdate){
        //usedhive
        const dhiveUpdate:IDHiveAccountUpdateBroadcast = {
          newAuthorities:newAuths,
          ownerKey:key,
        };
        dispatch(dhiveBroadcastUpdateAccount(dhiveUpdate));
        setDispatched(true)
      }else{
        // usekeychain
        const activeAccounts = orderAlphabetically(newAuths.active.account_auths);
        const activeKeys = orderAlphabetically(newAuths.active.key_auths);
        const postingAccounts = orderAlphabetically(newAuths.posting.account_auths);
        const postingKeys = orderAlphabetically(newAuths.posting.key_auths);

        const hiveUpdate: IHiveAccountUpdateBroadcast = {
          newAuthorities: {
            ...newAuths,
            owner:undefined,
            active:{
              account_auths:activeAccounts,
              key_auths:activeKeys,
              weight_threshold:newAuths.active.weight_threshold
            },
            posting:{
              account_auths:postingAccounts,
              key_auths:postingKeys,
              weight_threshold:newAuths.posting.weight_threshold
            }
          },
          targetAuthorityType: 'Active',
        };
        dispatch(hiveKeyChainRequestBroadCast(hiveUpdate));
        setDispatched(true)
      }
      setDispatched(false)
    }

    return (
    <div
      className="modal updateAuthoritiesModal"
      style={{ display: 'block', position: 'initial' }}
    >
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        show={showModal}
        onHide={()=> {handleClose()}}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title
          id="contained-modal-title-vcenter"
          >Update Account Authorities</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {updateError?'Update failed! Max number of update reached. Please Try again after 2 hours.':''}
          {isOwnerUpdate||isPostingUpdate?
            <OnwerKeyInput setOwnerKey={setKey}/>
          :  <div>Are you sure you wanna update?</div>
        }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=> {handleClose()}}>
            Close
          </Button>
          <Button variant="primary" onClick={()=>{handleUpdate()}}>Update</Button>
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
  useDidMountEffect(() => {
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
