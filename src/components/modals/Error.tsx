import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

interface ErrorProps {
  show: boolean;
  setShow: Function;
  message: string;
}

const ErrorModal = ({ show, setShow, message }: ErrorProps) => {
  const [showModal, setShowModal] = useState<boolean>(show);
  useEffect(() => {
    setShowModal(show);
  }, [show]);

  const handleModalClose = () => {
    setShowModal(false);
    setShow(false);
  };
  return (
    <div className="modal" style={{ display: 'block', position: 'initial' }}>
      <Modal
        show={showModal}
        onHide={() => {
          handleModalClose();
        }}
        centered>
        <Modal.Dialog>
          <Modal.Header closeButton>
            <Modal.Title>Transaction Error</Modal.Title>
          </Modal.Header>

          <Modal.Body>{message}</Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => handleModalClose()}>
              Close
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>
    </div>
  );
};

export default ErrorModal;
