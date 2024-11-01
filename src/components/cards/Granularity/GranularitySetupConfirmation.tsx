import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { AllUsersConfigCard } from './Components/AllUsersConfigCard';
import { CustomUsersConfigCard } from './Components/CustomUsersConfigCard';

export const GranularitySetupConfirmation = () => {
  const handleDoneButton = () => {
    window.location.reload();
  };
  return (
    <Container className="d-flex flex-fill justify-content-md-center">
      <Card border="secondary" className="w-100">
        <Container fluid>
          <Card.Body>
            <h3 className="card-title text-center">
              Granularity Configuration Success
            </h3>
          </Card.Body>
          <Row className="justify-content-between">
            <Col xs={12} md={6} className="mb-3">
              <Card className="h-100" border="secondary">
                <h4 className="text-center mt-2">All Users</h4>
                <AllUsersConfigCard isConfirmation={true} />
              </Card>
            </Col>
            <Col xs={12} md={6} className="mb-3">
              <Card className="h-100" border="secondary">
                <h4 className="text-center mt-2">Custom</h4>
                <CustomUsersConfigCard isConfirmation={true} />
              </Card>
            </Col>
          </Row>
        </Container>
        <div className="d-flex justify-content-end mb-3 me-3 rem-10">
          <Button
            onClick={() => {
              handleDoneButton();
            }}
            className="ms-2"
            variant="success">
            Done
          </Button>
        </div>
      </Card>
    </Container>
  );
};
