import { Card, Col, Container, Row } from 'react-bootstrap';
import { AllUsersConfigCard } from './Components/AllUsersConfigCard';
import { CustomUsersConfigCard } from './Components/CustomUsersConfigCard';
export const GranularityConfigurationSetup = () => {
  return (
    <Container className="d-flex flex-fill justify-content-md-center">
      <Card border="secondary" className="w-100">
        <Container fluid>
          <Card.Body>
            <h3 className="card-title text-center">
              Granularity Configuration
            </h3>
          </Card.Body>
          <Row className="justify-content-between">
            <Col xs={12} md={6} className="mb-3">
              <Card className="h-100" border="secondary">
                <h4 className="text-center mt-2">All Users</h4>
                <AllUsersConfigCard />
              </Card>
            </Col>
            <Col xs={12} md={6} className="mb-3">
              <Card className="h-100" border="secondary">
                <h4 className="text-center mt-2">Custom</h4>
                <CustomUsersConfigCard />
              </Card>
            </Col>
          </Row>
        </Container>
      </Card>
    </Container>
  );
};
