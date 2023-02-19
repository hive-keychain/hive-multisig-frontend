import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { ErrorProps } from '../../interfaces/errors.interface';
import { capitalizeFirstLetter } from '../../utils/utils';

const ErrorModal = ({ show, setShow, error }: ErrorProps) => {
  const [showModal, setShowModal] = useState<boolean>(show);
  useEffect(() => {
    setShowModal(show);
  }, [show]);

  const handleModalClose = () => {
    setShowModal(false);
    setShow(false);
  };

  return (
    <Modal
      show={showModal}
      onHide={() => {
        handleModalClose();
      }}
      centered>
      <Modal.Header closeButton>
        <Modal.Title>{error.Title}</Modal.Title>
      </Modal.Header>
      {error.ErrorName !== '' || error.ErrorMessage !== '' ? (
        <Modal.Body>
          <h6>{`${capitalizeFirstLetter(error.ErrorName)}: `}</h6>
          <Form.Control
            as="textarea"
            value={error.ErrorMessage}
            rows={4}
            readOnly
          />
        </Modal.Body>
      ) : null}
      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleModalClose()}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;
