import { Card, Col, Container, Row } from 'react-bootstrap';
import { AllUsersConfigCard } from './Components/AllUsersConfigCard';
import { AuthoritySelection } from './Components/AuthoritySelection';
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
                <div className="mx-2 mb-3">
                  <AuthoritySelection />
                  <Card className="flex-grow-1 mt-2">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <div>Authorities</div>
                    </Card.Header>
                    <Card.Body className="card-scroll" id="card-body">
                      {/* CustomUserConfigCard components go here */}
                    </Card.Body>
                  </Card>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </Card>
    </Container>
  );
};
