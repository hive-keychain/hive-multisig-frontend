   import { useEffect, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import { Authorities, IDHiveAccountUpdateBroadcast, IHiveAccountUpdateBroadcast } from '../../interfaces';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { dhiveBroadcastUpdateAccount, hiveKeyChainRequestBroadCast, setOwnerKey } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
interface Iprops{
    show: boolean
    handleClose: Function
}

function UpdateAuthoritiesConfirmation({show, handleClose}:Iprops) {
   const dispatch = useAppDispatch();
   
   const isUpdateSuceed = useAppSelector(
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
    const[updateResult, setUpdateResult] = useState<boolean>(isUpdateSuceed);
    const[newAuths, setNewAuths] = useState<Authorities>(newAuthorities)
    const[isOwnerUpdate, setIsOwnerUpdated] = useState<boolean>(isOwnerAuthUpdated);
    const[isPostingUpdate, setIsPostingUpdate] = useState<boolean>(isPostingAuthUpdated);
    const[key, setKey] =  useState<string>('');
    const[showModal, setShowModal] = useState<boolean>(show);
    const navigate = useNavigate();
      
    useEffect(()=>{
      setShowModal(show);
    },[show])

    useEffect(()=>{
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

    useEffect(() =>{
      if(isDispatched){// || updateResult
        setShowModal(false);
        navigate(`/@${newAuthorities.account}`);
      }
    },[updateResult])
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
        const hiveUpdate: IHiveAccountUpdateBroadcast = {
          newAuthorities: {
            ...newAuthorities,
            owner:undefined
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
      className="modal show"
      style={{ display: 'block', position: 'initial' }}
    >
      <Modal
        show={showModal}
        onHide={()=> {handleClose()}}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Account Authorities</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
