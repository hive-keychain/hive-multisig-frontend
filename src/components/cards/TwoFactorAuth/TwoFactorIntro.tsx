import { Button, Card, Col, Container, Figure, Row } from 'react-bootstrap';
import { useAppDispatch } from '../../../redux/app/hooks';
import { proceedIntro } from '../../../redux/features/twoFactorAuth/twoFactorAuthThunks';

export const TwoFactorIntro = () => {
  const dispatch = useAppDispatch();
  const handleProceedIntro = () => {
    dispatch(proceedIntro(true));
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="auto" lg="7">
          <Card border="secondary">
            <Container>
              <Card.Body>
                <h3 className="card-title text-center">
                  Welcome to Hive Multisig 2FA!
                </h3>
                <p className="card-text text-center">
                  Hive Multisig enhances your account security by employing
                  Time-Based One-Time Passwords (TOTP), adding an extra layer of
                  protection for your active authority operations.{' '}
                </p>
                <h3 className="card-title text-center"> How it works</h3>
                <p>
                  <strong>Choose Your App:</strong> Pick a TOTP-supported
                  authenticator app like Google or Microsoft Authenticator.
                </p>
                <Container>
                  <Row className="justify-content-md-center justify-content-sm-center">
                    <Col className="authenticator-icon" sm="2" md="2" lg="2">
                      <Figure className="text-center pull-left">
                        <Figure.Image
                          alt="googleAuthenticator"
                          src="\img\g-auth-logo.png"
                        />
                        <Figure.Caption>Google</Figure.Caption>
                      </Figure>
                    </Col>
                    <Col className="authenticator-icon" sm="2" md="2" lg="2">
                      <Figure className="text-center pull-right">
                        <Figure.Image
                          src="\img\m-auth-logo.png"
                          alt="microsoftAuthenticator"
                        />
                        <Figure.Caption>Microsoft</Figure.Caption>
                      </Figure>
                    </Col>
                  </Row>
                </Container>
                <p>
                  <strong>Scan QR Code:</strong>During the setup, use the app to
                  scan our QR code, linking it securely to your account.
                </p>

                <p>
                  <strong>Generate OTP:</strong> When signing transfers and
                  other active authority operations, enter your TOTP.
                </p>

                <div className="d-flex justify-content-end">
                  <Button
                    onClick={() => handleProceedIntro()}
                    className=""
                    variant="success">
                    Proceed
                  </Button>
                </div>
              </Card.Body>
            </Container>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
