import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import {
  ISignTransaction,
  ITransaction,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import { useEffect, useState } from 'react';
import { Button, Card, Collapse } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { removeSignRequest } from '../../redux/features/multisig/multisigThunks';

export const SignRequestsPage = () => {
  const signRequests = useAppSelector(
    (state) => state.multisig.multisig.signRequests,
  );

  return (
    <div>
      <div>
        <PendingSignRequestCard signRequests={signRequests} key={1} />
      </div>
      <br />
      <div>
        <SignedTransactionsCard signRequests={signRequests} key="2" />
      </div>
      <br />
      <div>
        <PendingTransactionsCard key="3" />
      </div>
    </div>
  );
};

interface ISignRequestCardProps {
  signRequests: ITransaction[];
}

const PendingSignRequestCard = ({ signRequests }: ISignRequestCardProps) => {
  return (
    <Card key={signRequests.length}>
      <Card.Body>
        <Card.Title>Pending Sign Requests</Card.Title>
        {signRequests.length === 0 ? (
          <Card.Text className="text-center text-secondary">
            No signature requests
          </Card.Text>
        ) : (
          signRequests.map((req) => {
            if (!req.signer.signature) {
              return (
                <div key={req.signer.id}>
                  <RequestCard
                    signer={req.signer}
                    signatureRequestId={req.signatureRequestId}
                    transaction={req.transaction}
                    method={req.method}
                    username={req.username}
                    key={req.signatureRequestId}
                  />
                  <br />
                </div>
              );
            }
          })
        )}
      </Card.Body>
    </Card>
  );
};

const SignedTransactionsCard = ({ signRequests }: ISignRequestCardProps) => {
  return (
    <Card key={signRequests.length}>
      <Card.Body>
        <Card.Title>Signed Transactions</Card.Title>
        {signRequests.length === 0 ? (
          <Card.Text className="text-center text-secondary">
            No signature requests
          </Card.Text>
        ) : (
          signRequests.map((req) => {
            if (req.signer.signature) {
              return (
                <div key={req.signer.id}>
                  <RequestCard
                    signer={req.signer}
                    signatureRequestId={req.signatureRequestId}
                    transaction={req.transaction}
                    method={req.method}
                    username={req.username}
                    key={req.signatureRequestId}
                  />
                  <br />
                </div>
              );
            }
          })
        )}
      </Card.Body>
    </Card>
  );
};

const PendingTransactionsCard = () => {
  const [showContent, setShowContent] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<SignatureRequest[]>([]);
  const [transactionIds, setTtransactionIds] = useState<number[]>([]);
  const activeTransactions = useAppSelector(
    (state) => state.multisig.multisig.signerConnectActive.result,
  );
  const postingTransactions = useAppSelector(
    (state) => state.multisig.multisig.signerConnectPosting.result,
  );
  const accountobj = useAppSelector((state) => state.login.accountObject);

  useEffect(() => {
    const activeTxs: SignatureRequest[] = [];
    const postingTxs: SignatureRequest[] = [];
    const txIds: number[] = [];
    if (activeTransactions.pendingSignatureRequests[accountobj.data.username]) {
      const txs =
        activeTransactions.pendingSignatureRequests[accountobj.data.username];
      for (var i = 0; i < txs.length; i++) {
        if (!txIds.includes(txs[i].id)) {
          txIds.push(txs[i].id);
          if (txs[i].initiator === accountobj.data.username) {
            activeTxs.push(txs[i]);
          }
        }
      }
    }

    if (
      postingTransactions.pendingSignatureRequests[accountobj.data.username]
    ) {
      const txs =
        postingTransactions.pendingSignatureRequests[accountobj.data.username];
      for (var i = 0; i < txs.length; i++) {
        if (txs[i].initiator === accountobj.data.username) {
          postingTxs.push(txs[i]);
        }
      }
    }
    setTransactions([...activeTxs, ...postingTxs]);
  }, [activeTransactions, postingTransactions]);

  useEffect(() => {
    console.log(transactions);
  }, [transactions]);

  return (
    <Card>
      <Card.Body>
        <Card.Title>Pending Transaction</Card.Title>
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
              {transactions ? JSON.stringify(transactions) : ''}
            </Card.Body>
          </Card>
        </Collapse>
      </Card.Body>
    </Card>
  );
};

const RequestCard = (prop: ITransaction) => {
  const multisig = new HiveMultisigSDK(window);
  const dispatch = useAppDispatch();
  const [showContent, setShowContent] = useState<boolean>(false);
  const opName = prop.transaction
    ? prop.transaction.operations[0][0].charAt(0).toUpperCase() +
      prop.transaction.operations[0][0].slice(1)
    : '';

  const handleSign = async () => {
    const data: ISignTransaction = {
      decodedTransaction: prop.transaction,
      signerId: prop.signer.id,
      signatureRequestId: prop.signatureRequestId,
      username: prop.username,
      method: prop.method,
    };
    multisig
      .signTransaction(data)
      .then(async (signatures) => {
        const txToBroadcast = { ...prop };
        txToBroadcast.transaction.signatures = [...signatures];
        const broadcastRes = await broadcast(txToBroadcast);
        console.log(`broadcastRes ${broadcastRes}`);
        if (broadcastRes) {
          console.log(`signrequestId ${prop.signatureRequestId}`);
          dispatch(removeSignRequest(prop.signatureRequestId));
        }
      })
      .catch((reason: any) => {
        console.log(`Sign Transaction Rejected ${reason}`);
      });
  };

  const broadcast = async (txToBroadcast: ITransaction): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        const broadcastResult = await multisig.broadcastTransaction(
          txToBroadcast,
        );
        resolve(broadcastResult);
      } catch (error) {
        reject(`Broadcast Error: ${error}`);
      }
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
                {JSON.stringify(prop.transaction)}
              </div>
            </Card.Body>
          </Card>
        </Collapse>
        <div>
          {!prop.signer.signature ? (
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
            </div>
          ) : null}
        </div>
      </Card.Body>
    </Card>
  );
};
