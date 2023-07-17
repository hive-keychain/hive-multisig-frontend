import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
import {
  ISignTransaction,
  ITransaction,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
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
  signRequests: ITransaction[];
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
                <TransactionCard prop={req} key={req.id} />
                <br />
              </div>
            );
          })
        )}
        <TransactionCard prop={null} />
      </Card.Body>
    </Card>
  );
};

interface ITransactionProp {
  prop: ITransaction;
}
const TransactionCard = ({ prop }: ITransactionProp) => {
  const [showContent, setShowContent] = useState<boolean>(false);
  const opName = prop.transaction
    ? prop.transaction.operations[0][0].charAt(0).toUpperCase() +
      prop.transaction.operations[0][0].slice(1)
    : 'Transfer';

  const handleSign = () => {
    const multisig = new HiveMultisigSDK(window);
    const data: ISignTransaction = {
      decodedTransaction: prop.transaction,
      signerId: prop.id,
      signatureRequestId: prop.signatureRequestId,
      username: prop.username,
      method: prop.method,
    };
    const res = multisig.signTransaction(data);
    console.log(`Sign Transaction Result ${res}`);
  };

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
                {JSON.stringify(prop.transaction)}
              </div>
            </Card.Body>
          </Card>
        </Collapse>
        <div className="mt-2 d-flex justify-content-end">
          <Button className="me-2" variant="danger">
            Refuse
          </Button>
          <Button
            variant="success"
            onClick={() => {
              handleSign();
            }}>
            Sign
          </Button>
        </div>{' '}
      </Card.Body>
    </Card>
  );
};
