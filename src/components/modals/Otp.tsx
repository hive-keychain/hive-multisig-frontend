import { authenticator } from '@otplib/preset-browser';
import { useEffect, useState } from 'react';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import OtpInput from 'react-otp-input';
import { useAppSelector } from '../../redux/app/hooks';

/**
 * To open call dispatch(showOtpInput(true)) otherwise false
 * @returns When OTP has been submitted, the state.transaction.transaction.otpValid sill be set
 */

interface IOtpProp {
  setIsValidOtp: Function;
  show: boolean;
}
//TODO: Replace the source of the secret. It must be retrieved from the backend!!
export const Otp = ({ setIsValidOtp, show }: IOtpProp) => {
  const [isValid, setIsValid] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const secret = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.secret,
  );

  useEffect(() => {
    setIsShow(show);
  }, [show]);

  useEffect(() => {
    if (isValid) {
      setIsValidOtp(isValid);
      setIsShow(false);
    } else {
      setErrorMessage('Incorrect OTP');
    }
  }, [isValid]);

  const validateOtp = () => {
    console.log(otp);
    if (secret) {
      const isValid = authenticator.check(otp, secret);
      setIsValid(isValid);
    } else {
      setErrorMessage('2FA secret is unavailable');
    }
  };

  const handleSubmit = () => {
    validateOtp();
  };
  const handleClose = () => setIsShow(false);
  const handleOnChange = (input: string) => {
    setOtp(input);
  };
  return (
    <Modal
      show={isShow}
      onHide={handleClose}
      animation={false}
      dialogClassName="modal-30w"
      centered>
      <Modal.Body>Enter your 2FA One-time-word (OTP)</Modal.Body>
      <Container>
        <Row>
          <Col>
            {' '}
            <OtpInput
              value={otp}
              onChange={handleOnChange}
              numInputs={6}
              renderSeparator={<span>{'-'}</span>}
              renderInput={(props) => <input {...props} />}
              shouldAutoFocus
              inputStyle="otpInputStyle"
            />
            {errorMessage !== '' ? (
              <label className="text-danger">{errorMessage}</label>
            ) : (
              ''
            )}
          </Col>
        </Row>
      </Container>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" type="submit" onClick={handleSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
