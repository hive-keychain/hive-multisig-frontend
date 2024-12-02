import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useAppDispatch } from '../../../redux/app/hooks';
import { proceedIntro } from '../../../redux/features/granularity/granularityThunks';

export const GranularityIntro = () => {
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
                  Welcome to Hive Multisig Granularity!
                </h3>
                <p className="card-text text-center">
                  This bot helps you delegate access to hand picked operations
                  on your account to certain users.
                </p>
                <h3 className="card-title text-center"> How it works</h3>
                <p>
                  By adding posting or active authority to the granularity bot,
                  you will be able to configure certain operations to be
                  automatically accepted and signed by the bot when initiated by
                  certain users. Other operations will be automatically
                  rejected.
                  <br />
                  Operations initiated by its own account are accepted by
                  default.
                </p>
                <h3 className="card-title text-center"> Example</h3>
                <p>
                  Let's say you have many account creation tickets and want to
                  let an account creation service (@account-creator) use them.
                  <br />
                  You'd have your own account, @${
                    process.env.GRANULARITY_BOT
                  }{' '}
                  and @account-creator all with a weight of 1 and a threshold of
                  2, and a configuration that only accept account creation from
                  @account-creator. <br />
                  The bot will automatically sign and broadcast the requests
                  made from your own account, while it we only comply to
                  @account-creator when asking for an account creation.
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
