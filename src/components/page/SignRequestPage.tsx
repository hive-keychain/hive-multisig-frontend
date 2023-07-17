import { Transaction } from '@hiveio/dhive';
import { KeychainKeyTypes } from 'hive-keychain-commons';
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
                <TransactionCard
                  transaction={req.transaction}
                  signerId={req.id}
                  signatureRequestId={req.signatureRequestId}
                  username={req.username}
                  method={req.method}
                  key={req.id}
                />
                <br />
              </div>
            );
          })
        )}
      </Card.Body>
    </Card>
  );
};

interface ITransactionCardProp {
  transaction: Transaction;
  signerId: number;
  signatureRequestId: number;
  username: string;
  method: KeychainKeyTypes;
}
const TransactionCard = ({
  transaction,
  signerId,
  signatureRequestId,
  username,
  method,
}: ITransactionCardProp) => {
  const [showContent, setShowContent] = useState<boolean>(false);
  const opName = transaction
    ? transaction.operations[0][0].charAt(0).toUpperCase() +
      transaction.operations[0][0].slice(1)
    : 'Transfer';

  const handleSign = async () => {
    const multisig = new HiveMultisigSDK(window);
    const data: ISignTransaction = {
      decodedTransaction: transaction,
      signerId: signerId,
      signatureRequestId: signatureRequestId,
      username: username,
      method: method,
    };
    multisig
      .signTransaction(data)
      .then((res) => {
        console.log(`Sign Transaction Result ${res}`);
      })
      .catch((reason: any) => {
        console.log(`Sign Transaction Rejected ${reason}`);
      });
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
                {JSON.stringify(transaction)}
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
