import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
//I want this to show when there is a signature request
// the trigger will be comming from the redux
// it should show a separate list of sign requests for
// each request must have a Sign and Reject button
import { Modal } from 'react-bootstrap';
import { showSignRequests } from '../../redux/features/multisig/multisigThunks';
// active and posting
export const SignRequests = () => {
  const [show, setShow] = useState<boolean>(false);
  const showSignRequestModal = useAppSelector(
    (state) => state.multisig.multisig.showSignRequests,
  );
  const signRequests = useAppSelector(
    (state) => state.multisig.multisig.signRequests,
  );
  const dispatch = useAppDispatch();
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (showSignRequestModal) handleShow();
    else handleClose();
  }, [showSignRequestModal]);

  useEffect(() => {
    if (!show) {
      dispatch(showSignRequests(show));
    }
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Signature Requests</Modal.Title>
      </Modal.Header>
      <Modal.Body>{}</Modal.Body>
    </Modal>
  );
};
