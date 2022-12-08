import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import { UpdateAuthorityType } from "../interfaces";

export const UpdateWeight = (showForm:boolean, setShowForm:Dispatch<SetStateAction<boolean>>, authDetails:UpdateAuthorityType) => {
    const isLoggedIn =  useReadLocalStorage('loginStatus')
    const accountDetails =  useReadLocalStorage('accountDetails')

    const [show, setShow] = useState(showForm);
    useEffect(() => {
        setShow(showForm)
    },[showForm])
    useEffect(() => {
        if(!show){
            setShowForm(show)
        }
    },[show])
    const handleClose = () => setShow(false);
    
    const numberInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const eventCode = event.code.toLowerCase();
        if (!(event.code !== null
        && (eventCode.includes("digit")
            || eventCode.includes("arrow")
            || eventCode.includes("home")
            || eventCode.includes("end")
            || eventCode.includes("period")
            || eventCode.includes("backspace") 
            || (eventCode.includes("numpad") && eventCode.length === 7)))
        ) {
        event.preventDefault();
        }
    };
    return(
        <div>
            <Modal show={show} onHide={() => {handleClose()}}>
                <Modal.Header closeButton>
                <Modal.Title>Update Weight</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <b className="text-secondary">{authDetails.accountType}</b>{authDetails.authorityToUpdate[0]} <br/>
                            <b className="text-secondary">Weight: </b>{'1'}
                            <Form.Control
                            type="text"
                            placeholder="Assign new weight"
                            autoFocus
                            onKeyDown={numberInputKeyDown}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={() => {handleClose()}}>
                    Close
                </Button>
                <Button variant="primary" onClick={() => {handleClose()}}>
                    Save Changes
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}