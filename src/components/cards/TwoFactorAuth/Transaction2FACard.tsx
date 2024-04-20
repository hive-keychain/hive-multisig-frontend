import { useState } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
interface ITransaction2FACard {
  botName: string;
}

export const Transaction2FACard = ({ botName }: ITransaction2FACard) => {
  const [errorText, setErrorText] = useState('');
  const [otp, setOtp] = useState('');

  const handleOnVerifyClick = () => {};

  
  return (
    <div>
      <Container className="ps-0">
        <Form.Group>
          <Form.Label>{`2FA Bot: ${botName}`}</Form.Label>
          <Row className="mb-3">
            <Col sm md="5">
              <InputGroup>
                <InputGroup.Text>OTP</InputGroup.Text>
                <Form.Control
                  required
                  type="text"
                  name={`${botName}-otp`}
                  aria-describedby="otpInput"
                  onChange={(e) => setOtp(e.target.value)}
                />

                <Button variant="outline-primary" onClick={() => {}}>
                  Verify
                </Button>

                <Form.Control.Feedback type="invalid">
                  {String(errorText)}
                </Form.Control.Feedback>
              </InputGroup>
            </Col>
            <br />
          </Row>
        </Form.Group>
      </Container>
    </div>
  );
};
