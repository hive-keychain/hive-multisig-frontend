import { useEffect, useState } from 'react';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import OtpInput from 'react-otp-input';
import { TxStatus } from '../../interfaces/transaction.interface';
import { TwoFACodes } from '../../interfaces/twoFactorAuth.interface';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { setBotOtp } from '../../redux/features/multisig/multisigThunks';
import { setTxStatus } from '../../redux/features/transaction/transactionThunks';

interface IOtpModal {
  handleSubmit: Function;
  show: boolean;
}
export const OtpModal = ({ handleSubmit, show }: IOtpModal) => {
  const dispatch = useAppDispatch();
  const twoFactorSigners = useAppSelector(
    (state) => state.multisig.multisig.twoFASigners,
  );
  const [isShow, setIsShow] = useState<boolean>(show);
  const [otpInputs, setOtpInputs] = useState([]);

  useEffect(() => {
    setIsShow(show);
  }, [show]);
  useEffect(() => {
    if (isShow && twoFactorSigners) {
      const botNames = Object.keys(twoFactorSigners);
      let inputs = [];
      for (let i = 0; i < botNames.length; i++) {
        inputs.push(<Otp botName={botNames[i]} />);
      }
      setOtpInputs(inputs);
    } else {
      setOtpInputs([]);
    }
  }, [isShow]);

  const handleClose = () => {
    setIsShow(false);
    dispatch(setTxStatus(TxStatus.cancel));
  };
  const handleSubmitOnclick = () => {
    handleSubmit();
  };
  return (
    <Modal
      show={isShow}
      onHide={handleClose}
      animation={false}
      dialogClassName="modal-30w"
      centered>
      <Modal.Header closeButton>
        <Modal.Title>One-Time-Password (OTP)</Modal.Title>
      </Modal.Header>
      <Container>{otpInputs}</Container>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          type="submit"
          onClick={() => {
            handleSubmitOnclick();
          }}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

interface IOtpProp {
  botName: string;
}
const Otp = ({ botName }: IOtpProp) => {
  const [otp, setOtp] = useState('');
  const dispatch = useAppDispatch();
  useEffect(() => {
    let twoFa: TwoFACodes = {};
    twoFa[botName] = otp;
    dispatch(setBotOtp(twoFa));
  }, [otp]);
  const handleOnChange = (input: string) => {
    setOtp(input);
  };
  return (
    <Row>
      <Col>
        {`Enter ${botName} OTP`}
        <OtpInput
          containerStyle="xs"
          value={otp}
          onChange={handleOnChange}
          numInputs={6}
          renderSeparator={<span>{'-'}</span>}
          renderInput={(props) => <input {...props} />}
          shouldAutoFocus
          inputStyle="otpInputStyle"
        />
      </Col>
    </Row>
  );
};
