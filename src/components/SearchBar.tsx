import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
export default () => (
    <InputGroup className="mb-3">
    <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
    <Form.Control
      placeholder="Username"
      aria-label="Username"
      aria-describedby="basic-addon1"
    />

    <Button variant="outline-secondary" id="button-addon2">
          Button
        </Button>
  </InputGroup>
)