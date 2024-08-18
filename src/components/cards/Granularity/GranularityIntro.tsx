import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useAppDispatch } from '../../../redux/app/hooks';

export const GranularityIntro = () => {
  const dispatch = useAppDispatch();
  const handleProceedIntro = () => {
    //  dispatch(proceedIntro(true));
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
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                  Atque sed, velit sequi quisquam pariatur fugiat tempora iusto
                  voluptatem officia animi debitis repellendus error! Obcaecati
                  ipsum eaque voluptatem pariatur, nihil blanditiis.
                </p>
                <h3 className="card-title text-center"> How it works</h3>
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Delectus praesentium, reprehenderit, incidunt at culpa
                  cupiditate facere doloremque corrupti officia cum ex placeat
                  atque nostrum esse totam quibusdam provident eveniet impedit?
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
