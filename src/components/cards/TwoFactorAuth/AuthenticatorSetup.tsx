import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
} from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import {
  createQRCode,
  createSecret,
  proceedMultisig,
  setTokenValidation,
} from '../../../redux/features/twoFactorAuth/twoFactorAuthThunks';
import {
  base64ToImage,
  copyTextToClipboard,
  generateRandomKey,
} from '../../../utils/utils';
var base32 = require('thirty-two');
const defaultBot = process.env.TWOFA_BOT;
authenticator.options = {
  window: 1,
};

export const AuthenticatorSetup = () => {
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);

  const secret = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.secret,
  );
  const qrCodeUrl = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.qrCodeUrl,
  );
  const twoFactorEnabled = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.enabled,
  );
  const tokenValidation = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.isValid,
  );

  const [qrCodeImage, setQrCodeImage] = useState<HTMLImageElement>(undefined);
  const [token, setOtp] = useState<string>(undefined);
  const [validToken, setValidToken] = useState<boolean>(false);
  const [otpSubitted, setOtpSubmitted] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState(<div></div>);
  const dispatch = useAppDispatch();

  const generateSecret = () => {
    const key = generateRandomKey();
    var encoded = base32.encode(key);
    var secret = encoded.toString().replace(/=/g, '');
    dispatch(createSecret(secret));
  };
  useEffect(() => {
    if (!twoFactorEnabled) {
      try {
        generateSecret();
      } catch (e) {
        console.error(e);
      }
    }
  }, [twoFactorEnabled]);

  useEffect(() => {
    if (secret && signedAccountObj) {
      handleCreateQrCode();
    }
  }, [secret]);

  useEffect(() => {
    if (qrCodeUrl) {
      setQrCodeImage(base64ToImage(qrCodeUrl));
    }
  }, [qrCodeUrl]);

  useEffect(() => {
    setValidToken(tokenValidation);
  }, [tokenValidation]);

  useEffect(() => {
    if (validToken) {
      setResultMessage(<div className="text-success">Valid</div>);
    } else {
      setResultMessage(<div className="text-danger">Invalid</div>);
    }
  }, [validToken]);

  const handleCreateQrCode = async () => {
    const otpauth = authenticator.keyuri(
      `@${signedAccountObj.data.username}`,
      `hive`,
      secret,
    );
    const qrurl = await qrcode.toDataURL(otpauth);
    dispatch(createQRCode(qrurl));
  };
  const handleOTPValidation = () => {
    const isValid = authenticator.check(token, secret);
    dispatch(setTokenValidation(isValid));
    setOtpSubmitted(true);
    console.log(`Result:${isValid}`);
  };

  const handleProceedMultisig = () => {
    dispatch(proceedMultisig(true));
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="auto" lg="7">
          <Card border="secondary">
            <Container>
              <Card.Body>
                <h3 className="card-title text-center">
                  Authenticator App Setup
                </h3>
                <p className="justify-content-md-center">
                  {' '}
                  1. Install Google Authenticator, Microsoft Authenticator, or
                  Authy.
                </p>
                <p className="justify-content-md-center">
                  {' '}
                  2. Scan the QR Code below or copy the provided secret.
                </p>
                <Container>
                  <Row className="justify-content-md-center justify-content-sm-center">
                    <Col className="otp-qr">
                      {qrCodeImage && (
                        <div className="justify-content-md-center justify-content-sm-center">
                          <img src={qrCodeImage.src} alt="QR Code" />
                        </div>
                      )}
                    </Col>
                  </Row>
                  <Row className="justify-content-md-center justify-content-sm-center">
                    <Col sm>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="fa fa-lock"></i>
                        </InputGroup.Text>
                        <Form.Control type="text" value={secret} />
                        <Button
                          variant="outline-secondary"
                          onClick={() => {
                            generateSecret();
                          }}>
                          Regenerate
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => {
                            copyTextToClipboard(secret);
                          }}>
                          Copy
                        </Button>
                      </InputGroup>
                    </Col>
                  </Row>
                </Container>
                <br />
                <p className="justify-content-md-center">
                  {' '}
                  3. To verify the setup, enter the 6-digit otp from your app.
                </p>
                <Container>
                  <Row className="justify-content-md-center justify-content-sm-center">
                    <Col sm md="5">
                      <InputGroup>
                        <InputGroup.Text>OTP</InputGroup.Text>
                        <Form.Control
                          required
                          type="text"
                          aria-describedby="otpInput"
                          onChange={(e) => {
                            setOtp(e.target.value);
                          }}
                        />

                        <Button
                          variant="outline-secondary"
                          onClick={() => {
                            handleOTPValidation();
                          }}>
                          Verify
                        </Button>
                      </InputGroup>
                      {otpSubitted ? resultMessage : ''}
                    </Col>
                  </Row>
                </Container>
                {otpSubitted ? (
                  <div>
                    {validToken ? (
                      <div className="d-flex justify-content-end">
                        <Button
                          onClick={() => {
                            handleProceedMultisig();
                          }}
                          className=""
                          variant="success">
                          Setup Multisig
                        </Button>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                ) : (
                  ''
                )}
              </Card.Body>
            </Container>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
