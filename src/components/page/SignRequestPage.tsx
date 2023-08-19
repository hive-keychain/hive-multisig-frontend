import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import {
  ISignTransaction,
  ITransaction,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import { useEffect, useState } from 'react';
import { Button, Card, Collapse } from 'react-bootstrap';
import { LoginResponseType } from '../../interfaces';
import { useAppSelector } from '../../redux/app/hooks';

export enum TransactionStatus {
  PENDING = 'pending',
  REQUEST = 'request',
  BROADCASTED = 'broadcasted',
  EXPIRED = 'expired',
  INVALID = 'invalid',
}

export const SignRequestsPage = () => {
  const account = useAppSelector((state) => state.login.accountObject);
  const requests = useAppSelector(
    (state) => state.multisig.multisig.signRequests,
  );
  const userNotifications = useAppSelector(
    (state) => state.multisig.multisig.userNotifications,
  );

  const broadcastedTransactions = useAppSelector(
    (state) => state.multisig.multisig.broadcastedTransactions,
  );
  const [transactions, setTransactions] = useState<SignatureRequest[]>([]);
  const [signRequests, setSignRequests] = useState<SignatureRequest[]>([]);
  const [notifications, setNotifications] = useState<SignatureRequest[]>([]);
  const [broadcasted, setNewBroadcasted] = useState<SignatureRequest[]>([]);

  useEffect(() => {
    console.log('Transactions');
    console.log(transactions);
  }, [transactions]);
  useEffect(() => {
    if (requests) {
      let newSignRequests: SignatureRequest[] = [...signRequests];
      for (var i = 0; i < requests.length; i++) {
        if (newSignRequests.find((req) => req.id === requests[i].id)) {
          continue;
        }
        newSignRequests.push(requests[i]);
      }
      if (newSignRequests?.length > 0) {
        setSignRequests([...newSignRequests]);
      }
      console.log('New Transactions');
      console.log(newSignRequests);
    }
  }, [requests]);

  useEffect(() => {
    if (userNotifications) {
      let newNotifications: SignatureRequest[] = [...notifications];
      for (var i = 0; i < userNotifications.length; i++) {
        if (
          newNotifications.find(
            (notif) => notif.id === userNotifications[i].signatureRequest.id,
          )
        ) {
          continue;
        }
        newNotifications.push({ ...userNotifications[i].signatureRequest });
      }
      if (newNotifications?.length > 0) {
        setNotifications([...newNotifications]);
      }
      console.log('New Notifications');
      console.log(newNotifications);
    }
  }, [userNotifications]);

  useEffect(() => {
    if (broadcastedTransactions) {
      let newBroadcasted: SignatureRequest[] = [...broadcasted];
      for (var i = 0; i < broadcastedTransactions.length; i++) {
        if (
          newBroadcasted.find(
            (broadcasted) => broadcasted.id === broadcastedTransactions[i].id,
          )
        ) {
          continue;
        }
        newBroadcasted.push(broadcastedTransactions[i]);
      }
      if (newBroadcasted?.length > 0) {
        setNewBroadcasted([...newBroadcasted]);
      }

      console.log('New Notifications');
      console.log(newBroadcasted);
    }
  }, [broadcastedTransactions]);

  useEffect(() => {
    if (signRequests?.length > 0) {
      handleAddSignRequests();
    }

    if (notifications?.length > 0) {
      handleAddNotifications();
    }

    if (broadcasted?.length > 0) {
      handleAddBroadcasted();
    }
  }, [signRequests, notifications, broadcasted]);

  const handleAddSignRequests = async () => {
    let newTransactions = [...transactions];
    for (var i = 0; i < signRequests.length; i++) {
      const index = newTransactions.findIndex(
        (tx) => tx.id === signRequests[i].id,
      );
      if (index !== -1) {
        newTransactions[index] = { ...signRequests[i] };
        continue;
      }
      newTransactions.push({ ...signRequests[i] });
    }

    setTransactions([...newTransactions]);
  };

  const handleAddNotifications = async () => {
    let newTransactions = [...transactions];
    for (var i = 0; i < notifications.length; i++) {
      const index = newTransactions.findIndex(
        (tx) => tx.id === notifications[i].id,
      );
      if (index !== -1) {
        newTransactions[index] = { ...notifications[i] };
        continue;
      }
      newTransactions.push({ ...notifications[i] });
    }
    setTransactions([...newTransactions]);
  };
  const handleAddBroadcasted = async () => {
    let newTransactions = [...transactions];
    for (var i = 0; i < broadcasted.length; i++) {
      const index = newTransactions.findIndex(
        (tx) => tx.id === broadcasted[i].id,
      );
      if (index !== -1) {
        newTransactions[index] = { ...broadcasted[i] };
        continue;
      }
      newTransactions.push({ ...broadcasted[i] });
    }
    setTransactions([...newTransactions]);
  };
  return (
    <div>
      {transactions?.length <= 0 ? (
        <div> {'No signature requests'}</div>
      ) : (
        transactions.map((tx) => {
          const state = GetStatus(tx, account);
          switch (state) {
            case TransactionStatus.PENDING:
              return (
                <div key={tx.id}>
                  <PendingRequestCard signRequest={tx} account={account} />
                  <br />
                </div>
              );
            case TransactionStatus.BROADCASTED:
              return (
                <div key={tx.id}>
                  <BroadCastedTransactionCard
                    signRequest={tx}
                    account={account}
                  />
                </div>
              );
            case TransactionStatus.EXPIRED:
              return <div key={tx.id}></div>;
          }
        })
      )}
    </div>
  );
};

interface ITransactionProps {
  signRequest: SignatureRequest;
  account: LoginResponseType;
}

const PendingRequestCard = ({ signRequest, account }: ITransactionProps) => {
  const [request, setRequest] = useState(signRequest);
  const [user, setAccount] = useState(account);
  const [status, setStatus] = useState(TransactionStatus.PENDING);
  const [initiated, setInitiated] = useState(false);
  const [isBroadcasted, setIsBroadcasted] = useState(false);
  const [creationDate, setCreationDate] = useState(undefined);
  const [expirationDate, setExpirationDate] = useState(undefined);
  const [decodedTransaction, setDecodedTransaction] =
    useState<ITransaction>(undefined);
  const [decoded, setDecoded] = useState(false);
  const [valid, setValid] = useState(false);
  const [showDecodedTx, setShowDecodedTx] = useState(false);
  const multisig = HiveMultisigSDK.getInstance(window);

  const handleDecode = async () => {
    const decodedTxs = await multisig.decodeTransaction({
      signatureRequest: [request],
      username: user.data.username,
    });
    if (decodedTxs) {
      if (initiated) {
        setStatus(TransactionStatus.PENDING);
      } else {
        setStatus(TransactionStatus.REQUEST);
      }
      setDecodedTransaction(decodedTxs[0]);
      setValid(true);
    } else {
      setStatus(TransactionStatus.INVALID);
      setValid(false);
    }
    setDecoded(true);
  };

  const handleSign = async () => {
    const data: ISignTransaction = {
      decodedTransaction: decodedTransaction.transaction,
      signerId: decodedTransaction.signer.id,
      signatureRequestId: decodedTransaction.signatureRequestId,
      username: user.data.username,
      method: decodedTransaction.method,
    };

    multisig
      .signTransaction(data)
      .then(async (signatures) => {
        if (signatures?.length > 0) {
          let txToBroadcast = structuredClone(decodedTransaction);
          txToBroadcast.transaction.signatures = [...signatures];
          console.log(txToBroadcast);
          let broadcastResult = await multisig.broadcastTransaction(
            txToBroadcast,
          );
          setIsBroadcasted(broadcastResult);
        }
      })
      .catch((reason: any) => {
        console.log(`Sign Transaction Rejected ${reason}`);
      });
  };

  useEffect(() => {
    if (request) {
      if (request.createdAt) {
        setCreationDate(request.createdAt);
      }
      if (request.expirationDate) {
        setExpirationDate(request.expirationDate);
      }
      setInitiated(initiatedByMe(request, user));
    }
  }, [request]);

  useEffect(() => {
    if (isBroadcasted) {
      setStatus(TransactionStatus.BROADCASTED);
    }
  }, [isBroadcasted]);

  return (
    <div>
      <Card key={signRequest.id}>
        <Card.Body>
          <Card.Title>
            {status.charAt(0).toUpperCase() + status.slice(1)}{' '}
            {initiated ? '  Initiated' : null}
          </Card.Title>
          {creationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Creation: ${creationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}
          {expirationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Expiration: ${expirationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}
          {(status === TransactionStatus.REQUEST && decoded) ||
          (initiated && decoded && valid) ? (
            <div>
              <Card.Subtitle className="mb-2 text-muted">
                <a
                  id="myLink"
                  className="nounderline  text-muted"
                  onClick={() => {
                    setShowDecodedTx(!showDecodedTx);
                  }}>
                  {showDecodedTx ? `Hide` : `Show`} Transaction Details
                </a>
              </Card.Subtitle>
              <Collapse in={showDecodedTx}>
                <Card>
                  <Card.Body>
                    <div id="example-collapse-text">
                      {decodedTransaction
                        ? JSON.stringify(decodedTransaction.transaction)
                        : null}
                    </div>
                  </Card.Body>
                </Card>
              </Collapse>
            </div>
          ) : null}

          <div className="mt-2 d-flex justify-content-end">
            {status === TransactionStatus.PENDING && !decoded ? (
              <Button
                variant="success"
                type="button"
                onClick={() => {
                  handleDecode();
                }}>
                Decode
              </Button>
            ) : status === TransactionStatus.REQUEST ? (
              <Button
                variant="success"
                type="button"
                onClick={() => {
                  handleSign();
                }}>
                Sign
              </Button>
            ) : null}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

const BroadCastedTransactionCard = ({
  signRequest,
  account,
}: ITransactionProps) => {
  const [request, setRequest] = useState(signRequest);
  const [user, setAccount] = useState(account);
  const [status, setStatus] = useState(TransactionStatus.BROADCASTED);
  const [initiated, setInitiated] = useState(false);
  const [isBroadcasted, setIsBroadcasted] = useState(false);
  const [creationDate, setCreationDate] = useState(undefined);
  const [expirationDate, setExpirationDate] = useState(undefined);
  const [decodedTransaction, setDecodedTransaction] =
    useState<ITransaction>(undefined);
  const [decoded, setDecoded] = useState(false);
  const [valid, setValid] = useState(false);
  const [showDecodedTx, setShowDecodedTx] = useState(false);
  const multisig = HiveMultisigSDK.getInstance(window);

  const handleDecode = async () => {
    const decodedTxs = await multisig.decodeTransaction({
      signatureRequest: [request],
      username: user.data.username,
    });
    if (decodedTxs) {
      setDecodedTransaction(decodedTxs[0]);
      setValid(true);
    } else {
      setStatus(TransactionStatus.INVALID);
      setValid(false);
    }
    setDecoded(true);
  };
  useEffect(() => {
    if (request) {
      if (request.createdAt) {
        setCreationDate(request.createdAt);
      }
      if (request.expirationDate) {
        setExpirationDate(request.expirationDate);
      }
      setIsBroadcasted(request.broadcasted);
      setInitiated(initiatedByMe(request, user));
    }
  }, [request]);

  useEffect(() => {
    if (isBroadcasted) {
      setStatus(TransactionStatus.BROADCASTED);
    }
  }, [isBroadcasted]);
  return (
    <div>
      <Card key={signRequest.id}>
        <Card.Body>
          <Card.Title>
            {status.charAt(0).toUpperCase() + status.slice(1)}{' '}
            {initiated ? '  Initiated' : null}
          </Card.Title>
          {creationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Creation: ${creationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}
          {expirationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Expiration: ${expirationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}
          {(status === TransactionStatus.BROADCASTED && decoded) ||
          (decoded && valid) ? (
            <div>
              <Card.Subtitle className="mb-2 text-muted">
                <a
                  id="myLink"
                  className="nounderline  text-muted"
                  onClick={() => {
                    setShowDecodedTx(!showDecodedTx);
                  }}>
                  {showDecodedTx ? `Hide` : `Show`} Transaction Details
                </a>
              </Card.Subtitle>
              <Collapse in={showDecodedTx}>
                <Card>
                  <Card.Body>
                    <div id="example-collapse-text">
                      {decodedTransaction
                        ? JSON.stringify(decodedTransaction.transaction)
                        : null}
                    </div>
                  </Card.Body>
                </Card>
              </Collapse>
            </div>
          ) : null}

          <div className="mt-2 d-flex justify-content-end">
            {status === TransactionStatus.BROADCASTED && !decoded ? (
              <Button
                variant="success"
                type="button"
                onClick={() => {
                  handleDecode();
                }}>
                Decode
              </Button>
            ) : null}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
const GetStatus = (
  signRequest: SignatureRequest,
  account: LoginResponseType,
) => {
  if (isPending(signRequest, account)) {
    return TransactionStatus.PENDING;
  } else if (isBroadcasted(signRequest)) {
    return TransactionStatus.BROADCASTED;
  } else if (isExpired(signRequest)) {
    return TransactionStatus.EXPIRED;
  } else {
    return undefined;
  }
};

const isExpired = (signRequest: SignatureRequest) => {
  return signRequest.expirationDate < new Date();
};

const isBroadcasted = (signRequest: SignatureRequest) => {
  return signRequest.broadcasted;
};

const isPending = (
  signRequest: SignatureRequest,
  account: LoginResponseType,
) => {
  return (
    (!isBroadcasted(signRequest) &&
      !isExpired(signRequest) &&
      !signedByMe(signRequest, account)) ||
    (!isBroadcasted(signRequest) &&
      !isExpired(signRequest) &&
      initiatedByMe(signRequest, account))
  );
};

const initiatedByMe = (
  signRequest: SignatureRequest,
  account: LoginResponseType,
) => {
  return signRequest.initiator === account.data.username;
};
const signedByMe = (
  signRequest: SignatureRequest,
  account: LoginResponseType,
) => {
  const signatures =
    signRequest && account
      ? signRequest.signers
          .filter((signer) => signer.publicKey === account.publicKey)
          .map((tx) => tx.signature)
      : [];
  return signatures.includes('') || signatures.includes(undefined);
};
