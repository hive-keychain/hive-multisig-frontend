import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';

interface IOperationRowProps {
  operation: string;
  key?: string;
}
export const OperationRow = ({ operation, key }: IOperationRowProps) => {
  const handleDelete = () => {
    console.log(`Delete ${operation}`);
  };
  return (
    <Container className="my-2 d-flex justify-content-center align-items-center">
      <Row>
        <Col>
          <InputGroup>
            <InputGroup.Text>Operation</InputGroup.Text>
            <Form.Control
              className={`form-control`}
              id={key}
              placeholder={operation}
              value={operation}
              readOnly={true}
            />
            <Button
              variant="outline-danger"
              onClick={() => {
                handleDelete();
              }}>
              <i className="fa fa-trash"></i>
            </Button>
          </InputGroup>
        </Col>

        {/* <Col>
          <Button
            variant="outline-danger"
            onClick={() => {
              handleDelete();
            }}>
            <i className="fa fa-trash"></i>
          </Button>
        </Col> */}
      </Row>
    </Container>
  );
};
