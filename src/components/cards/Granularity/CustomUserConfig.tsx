import { useState } from 'react';
import { Accordion, Button, Card } from 'react-bootstrap';
import { OperationRow } from './OperationRow';

export interface ICustomUserConfigProps {
  authority: [string, number];
}
export const CustomUserConfig = ({ authority }: ICustomUserConfigProps) => {
  const [open, setOpen] = useState(true);

  const handleToggle = () => setOpen(!open);
  const handleDelete = () => alert('Delete Item #1');

  return (
    <div className="d-flex align-items-center my-1 mx-2">
      <Accordion className="flex-grow-1" defaultActiveKey="0">
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>{authority[0]}</div>

            <div>
              <Button variant="outline-danger" onClick={handleDelete}>
                <i className="fa fa-trash"></i>
              </Button>
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
            </div>
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
    </div>
  );
};
