import { useEffect, useState } from 'react';
import { Button, Form, InputGroup, Modal, Stack } from 'react-bootstrap';
import { copyTextToClipboard } from '../../utils/utils';

interface Iprops {
  show: boolean;
  setShowNewKeys: Function;
  setKeysCoppied: Function;
  privateKey: string;
  publicKey: string;
}
function NewKeys({
  show,
  setShowNewKeys,
  setKeysCoppied,
  privateKey,
  publicKey,
}: Iprops) {
  const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const handleClose = () => {
    setShowNewKeys(false);
  };
  const handleCopy = () => {
    const pvt = 'Private Key: ' + privateKey;
    const pub = 'Public Key: ' + publicKey;
    const copyRes = copyTextToClipboard(pvt + '\n' + pub);
    setCopyStatus(copyRes);
  };
  useEffect(() => {
    setKeysCoppied(copyStatus);
  }, [copyStatus]);
  return (
    <div
      className="modal newKeysModal"
      style={{ display: 'block', position: 'initial' }}>
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        show={show}
        onHide={() => {
          handleClose();
        }}
        backdrop="static"
        keyboard={false}
        centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">New Keys</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>Please copy and save your keys somewhere safe.</div>
          <br></br>
          <Stack gap={3}>
            <InputGroup className="mb-3 ">
              <InputGroup.Text id="basic-addon1">
                <i className="fa fa-lock"> Private</i>
              </InputGroup.Text>
              <Form.Control
                className="me-auto "
                type="text"
                placeholder={privateKey}
                value={privateKey}
                readOnly
              />
            </InputGroup>
            <InputGroup className="mb-3 ">
              <InputGroup.Text id="basic-addon1">
                <i className="fa fa-lock"> Public</i>
              </InputGroup.Text>
              <Form.Control
                className="me-auto "
                type="text"
                placeholder={publicKey}
                value={publicKey}
                readOnly
              />
            </InputGroup>
            {copyStatus ? 'Keys coppied to clipboard' : ''}
          </Stack>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              handleClose();
            }}>
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              handleCopy();
            }}>
            Copy
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default NewKeys;
