import { Transaction } from '@hiveio/dhive';
import { useState } from 'react';
import { Button, Card, Collapse } from 'react-bootstrap';
import { useAppSelector } from '../../redux/app/hooks';

//TODO: create a ISignTransaction as data
// send data to multisig.SignTransaction(data);
// broadcast..
// notify backend..
export const SignRequestsPage = () => {
  const signRequests = useAppSelector(
    (state) => state.multisig.multisig.signRequests,
  );
  return (
    <div>
      <SignRequestCard signRequests={signRequests} />
    </div>
  );
};

interface ISignRequestCardProps {
  signRequests: Transaction[];
}

const SignRequestCard = ({ signRequests }: ISignRequestCardProps) => {
  console.log(`SignRequestsLEngth:${signRequests.length}`);
  return (
    <Card>
      <Card.Body>
        <Card.Title>Sign Requests</Card.Title>
        {signRequests.length === 0 ? (
          <Card.Text className="text-center text-secondary">
            No signature requests
          </Card.Text>
        ) : (
          signRequests.map((req) => {
            return (
              <div>
                <TransactionCard transaction={req} key={req.ref_block_num} />
                <br />
              </div>
            );
          })
        )}
        <TransactionCard transaction={null} />
      </Card.Body>
    </Card>
  );
};

interface ITransactionProp {
  transaction: Transaction;
}
const TransactionCard = ({ transaction }: ITransactionProp) => {
  const [showContent, setShowContent] = useState<boolean>(false);
  const opName = transaction
    ? transaction.operations[0][0].charAt(0).toUpperCase() +
      transaction.operations[0][0].slice(1)
    : 'Transfer';
  return (
    <Card>
      <Card.Body>
        <Card.Title>
          <div className="me-auto">{opName}</div>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          <a
            id="myLink"
            href="#"
            className="nounderline  text-muted"
            onClick={() => {
              setShowContent(!showContent);
            }}>
            See Transaction Details
          </a>
        </Card.Subtitle>
        <Collapse in={showContent}>
          <Card>
            <Card.Body>
              <div id="example-collapse-text">
                {JSON.stringify(transaction)}
              </div>
            </Card.Body>
          </Card>
        </Collapse>
        <div className="mt-2 d-flex justify-content-end">
          <Button variant="success">Sign</Button>
        </div>
      </Card.Body>
    </Card>
  );
};
