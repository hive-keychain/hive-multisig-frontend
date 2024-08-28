import { useState } from 'react';
import { Accordion, Button, Card } from 'react-bootstrap';
import { OperationRow } from './OperationRow';
import { OperationSelection } from './OperationSelection';

export const AllUsersConfig = () => {
  const [open, setOpen] = useState(true);
  const handleToggle = () => setOpen(!open);

  return (
    <div className=" my-1 mx-2">
      <div>
        <OperationSelection />
      </div>
      <div>
        <div className="d-flex align-items-center my-2 mx-2">
          <Accordion className="flex-grow-1" defaultActiveKey="0">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>Operations</div>
                <Button
                  className="ms-2"
                  variant="outline-dark"
                  onClick={handleToggle}
                  aria-controls="card-body"
                  aria-expanded={open}>
                  {open ? (
                    <i className="fa fa-chevron-down" />
                  ) : (
                    <i className="fa fa-chevron-up" />
                  )}
                </Button>
              </Card.Header>

              <Accordion.Collapse eventKey="0" in={open}>
                <Card.Body id="card-body">
                  <OperationRow operation={'Transfer'} key={'1'} />
                  <OperationRow operation={'Transfer'} key={'2'} />
                  <OperationRow operation={'Transfer'} key={'3'} />
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>

          {/* <OperationRow operation={'Transfer'} key={'1'} />
        <OperationRow operation={'Sign Buffer'} key={'1'} />
        <OperationRow operation={'Custom JSON'} key={'1'} /> */}
        </div>
      </div>
    </div>
  );
};
