import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { UPDATE_TARGET_AUTHORITY_TYPE } from '../../interfaces';
interface IUpdateThresholdProps { 
    showForm:boolean,
    setShowForm:Function,
    setNewThreshold: Function,
    setOwnerKey: Function,
    targetAuthType: string | UPDATE_TARGET_AUTHORITY_TYPE,
    currentThreshold: number
}

function UpdateThreshold({showForm, setShowForm, 
                    setNewThreshold, setOwnerKey, 
                    targetAuthType, currentThreshold}:IUpdateThresholdProps) {
    const [threshold, setThreshold] = useState<number>(currentThreshold)
    const [ownerKey, _setOwnerKey] = useState<string>('');
    const [show, setShow] = useState(showForm);

    useEffect(() => {
        setShow(showForm)
    },[showForm])
    useEffect(() => {
        if(!show){
        setShowForm(show)
        }
    },[show])
    const handleClose = () => setShow(false)
    
    const handleUpdate = () => {
        setOwnerKey(ownerKey);
        setNewThreshold(threshold);
        setShow(false);
    }

    const numberInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const eventCode = event.code.toLowerCase();
        if (!(event.code !== null
        && (eventCode.includes("digit")
            || eventCode.includes("arrow")
            || eventCode.includes("home")
            || eventCode.includes("end")
            || eventCode.includes("backspace") 
            || (eventCode.includes("numpad") && eventCode.length === 7)))
        ) {
        event.preventDefault();
        }
    };
    return (
        <div>
        <Modal show={show} onHide={() => {}}>
            <Modal.Header closeButton>
            <Modal.Title>Update Threshold</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                       
                        <h2>{targetAuthType +" Authority"}</h2>
                        <b className="text-secondary">Threshold: </b> {currentThreshold} <br/>
                        {targetAuthType === 'Owner'|| targetAuthType ==='Posting'? 
                            <Form.Control
                            type="text"
                            placeholder="Enter Owner Key"
                            autoFocus
                            onChange = {e => {_setOwnerKey(e.target.value)}}
                            />
                            :<div></div>
                        }
                        <Form.Control
                        type="number"
                        placeholder="Assign new weight"
                        autoFocus
                        onKeyDown={numberInputKeyDown}
                        onChange = {e => {setThreshold(+e.target.value)}}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={() => {handleClose()}}>
                Close
            </Button>
            <Button variant="primary" onClick={() => {handleUpdate()}}>
                Update
            </Button>
            </Modal.Footer>
        </Modal>
        </div>
    )

                    }

export default UpdateThreshold
