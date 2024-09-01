import { Card } from 'react-bootstrap';
import { AuthoritySelection } from './AuthoritySelection';

export const CustomUsersConfigCard = () => {
  return (
    <div className="mx-3 mb-3">
      <AuthoritySelection />
      <Card className="flex-grow-1 mt-2">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>Authorities</div>
        </Card.Header>
        <Card.Body className="card-scroll" id="card-body">
          {/* GranularityAuthorityCard components go here */}
        </Card.Body>
      </Card>
    </div>
  );
};
