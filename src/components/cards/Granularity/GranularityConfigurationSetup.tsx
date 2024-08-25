import { Card, Container, Row } from 'react-bootstrap';
import { AllUsersConfig } from './AllUsersConfig';
import { AuthoritySelection } from './AuthoritySelection';
import { CustomUserConfig } from './CustomUserConfig';

export const GranularityConfigurationSetup = () => {
  return (
    <Container className="d-flex justify-content-md-center">
      <Row className="justify-content-md-center">
        <Card border="secondary">
          <Container>
            <Card.Body>
              <h3 className="card-title text-center">
                Granularity Configuration
              </h3>
            </Card.Body>

            <div>
              <Card className="my-2" border="secondary">
                <h4 className="text-center"> All Users</h4>
                <AllUsersConfig />
              </Card>

              <Card className="my-2" border="secondary">
                <div className="d-flex justify-content-md-center"></div>
                <h4 className="text-center mt-2"> Custom</h4>
                <div className="mx-4 mb-3">
                  <AuthoritySelection />
                </div>
                <CustomUserConfig authority={['@krios', 1]} />
                <CustomUserConfig authority={['@krios', 1]} />
                <CustomUserConfig authority={['@krios', 1]} />
                <CustomUserConfig authority={['@krios', 1]} />
                <CustomUserConfig authority={['@krios', 1]} />
              </Card>
            </div>
          </Container>
        </Card>
      </Row>
    </Container>
  );
};
