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
    const isPostingAuthUpdated =useAppSelector(
      (state) => state.updateAuthorities.isPostingAuthUpdated,
    );
    const[origAuths, setOrigAuths] = useState<Authorities>(originalAuthorities)
    const[newAuths, setNewAuths] = useState<Authorities>(newAuthorities)
    const[isOwnerUpdate, setIsOwnerUpdated] = useState<boolean>(isOwnerAuthUpdated);
    const[isPostingUpdate, setIsPostingUpdate] = useState<boolean>(isPostingAuthUpdated);
    const[key, setKey] =  useState<string>('');

    useEffect(()=>{
      dispatch(setOwnerKey(key));
    },[key])

    useEffect(() => {
      setIsOwnerUpdated(isOwnerAuthUpdated);
    },[isOwnerAuthUpdated])
    useEffect(()=>{
      setIsPostingUpdate(isPostingAuthUpdated)
    },[isPostingUpdate])


    const handleUpdate = () =>{
      if(isOwnerUpdate){
        //usedhive
      }else{
        //usekeychain
      }
    }

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
          {isOwnerUpdate?
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
