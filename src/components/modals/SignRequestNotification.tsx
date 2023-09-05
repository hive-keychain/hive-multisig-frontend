import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
//I want this to show when there is a signature request
// the trigger will be comming from the redux
// it should show a separate list of sign requests for
// each request must have a Sign and Reject button
import { Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { notifySignRequest } from '../../redux/features/multisig/multisigThunks';
// active and posting
export const SignRequestNotification = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState<boolean>(false);
  const [newSignRequests, setNewSignRequests] = useState<number>(0);
  const [totalPendingRequests, setTotalPendingRequests] = useState<number>(0);
  const showSignRequestModal = useAppSelector(
    (state) => state.multisig.multisig.signRequestNotification,
  );
  const newSignRequestsCount = useAppSelector(
    (state) => state.multisig.multisig.newSignRequestCount,
  );
  const signRequestsCount = useAppSelector(
    (state) => state.multisig.multisig.signRequestCount,
  );
  const dispatch = useAppDispatch();
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleView = () => navigate('/signRequest');
  useEffect(() => {
    if (showSignRequestModal) handleShow();
    else handleClose();
  }, [showSignRequestModal]);

  useEffect(() => {
    if (newSignRequestsCount) {
      setNewSignRequests(newSignRequestsCount);
    }
  }, [newSignRequestsCount]);
  useEffect(() => {
    if (signRequestsCount) {
      setTotalPendingRequests(signRequestsCount);
    }
  }, [signRequestsCount]);
  useEffect(() => {
    if (!show) {
      dispatch(notifySignRequest(show));
    }
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Signature Requests</Modal.Title>
      </Modal.Header>
      <Modal.Body>{`You have ${newSignRequests} new signature request.`}</Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            handleClose();
          }}>
          Close
        </Button>

        <Button
          variant="primary"
          onClick={() => {
            handleView();
          }}>
          View
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
