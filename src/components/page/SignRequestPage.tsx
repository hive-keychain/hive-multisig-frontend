import { HiveMultisig } from 'hive-multisig-sdk/src';
import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import {
  ISignTransaction,
  ITransaction,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Collapse,
  Toast,
  ToastBody,
  ToastContainer,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from 'usehooks-ts/dist/esm/useLocalStorage/useLocalStorage';
import { Config } from '../../config';
import { LoginResponseType } from '../../interfaces';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { addSignRequest } from '../../redux/features/multisig/multisigThunks';
import { MultisigUtils } from '../../utils/multisig.utils';
import {
  getElapsedTimestampSeconds,
  getTimestampInSeconds,
} from '../../utils/utils';

type AlertType = {
  variant?: string;
  text?: string;
  show?: boolean;
};

export const SignRequestsPage = () => {
  const dispatch = useAppDispatch();
  const loginExpirationInSec = Config.login.expirationInSec;

  const [loginTimestamp, setLoginTimestamp] = useLocalStorage(
    'loginTimestap',
    null,
  );
  const account = useAppSelector((state) => state.login.accountObject);
  const operation = useAppSelector(
    (state) => state.transaction.transaction.operation,
  );
  const postingConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessagePosting,
  );
  const activeConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessageActive,
  );
  const signRequest = useAppSelector(
    (state) => state.multisig.multisig.signRequests,
  );

  const [multisig, setMultisig] = useState<HiveMultisig>();
  const [transactions, setTransactions] = useState<SignatureRequest[]>([]);
  const [alerts, setAlerts] = useState<AlertType>({});
  const [listAltText, setListAltText] = useState<string>();
  const navigate = useNavigate();

  const isLoggedIn = () => {
    const loggedinDuration = getElapsedTimestampSeconds(
      loginTimestamp,
      getTimestampInSeconds(),
    );
    return !(loginTimestamp > 0 && loggedinDuration >= loginExpirationInSec);
  };
  const getSignRequests = async () => {
    setListAltText('Retrieving Transactions');
    if (activeConnectMessage) {
      try {
        multisig.api
          .getSignatureRequests(activeConnectMessage)
          .then((activeReqs) => {
            if (activeReqs) {
              dispatch(addSignRequest(activeReqs));
            }
          });
      } catch (error) {
        console.log(`activeConnect: ${error}`);
      }
    } else {
      console.log(`activeConnectMessage: ${activeConnectMessage}`);
    }
    if (postingConnectMessage) {
      try {
        multisig.api
          .getSignatureRequests(postingConnectMessage)
          .then((postingReqs) => {
            if (postingReqs) {
              dispatch(addSignRequest(postingReqs));
            }
          });
      } catch (error) {
        console.log(`postingConnect: ${error}`);
      }
    } else {
      console.log(`postingConnectMessage: ${postingConnectMessage}`);
    }
  };

  useEffect(() => {
    if (account) {
      setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
    } else {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (!operation && multisig && isLoggedIn()) {
      getSignRequests();
    }
  }, [operation]);

  useEffect(() => {
    if (multisig) {
      getSignRequests();
    }
  }, [multisig]);

  useEffect(() => {
    console.log(transactions);
    if (!transactions) {
      setListAltText('No Transaction Found');
    }
  }, [transactions]);

  useEffect(() => {
    if (signRequest) {
      setTransactions(signRequest);
    }
  }, [signRequest]);

  return (
    <div>
      {transactions?.length <= 0 ? (
        <div> {listAltText}</div>
      ) : (
        transactions.map((tx) => {
          const state = GetStatus(tx, account);
          switch (state) {
            case TransactionStatus.PENDING_INITIATED_TRANSACTION:
              return (
                <div key={tx.id}>
                  <PendingRequestCard
                    signRequest={tx}
                    account={account}
                    setAlerts={setAlerts}
                  />
                  <br />
                </div>
              );
            case TransactionStatus.PENDING_TRANSACTION:
              return (
                <div key={tx.id}>
                  <PendingRequestCard
                    signRequest={tx}
                    account={account}
                    setAlerts={setAlerts}
                  />
                  <br />
                </div>
              );
            case TransactionStatus.BROADCASTED_INITIATED_TRANSACTION:
              return (
                <div key={tx.id}>
                  <BroadCastedTransactionCard
                    signRequest={tx}
                    account={account}
                    setAlerts={setAlerts}
                  />
                  <br />
                </div>
              );
            case TransactionStatus.BROADCASTED_TRANSACTION:
              return (
                <div key={tx.id}>
                  <BroadCastedTransactionCard
                    signRequest={tx}
                    account={account}
                    setAlerts={setAlerts}
                  />
                  <br />
                </div>
              );
            case TransactionStatus.EXPIRED_INITIATED_TRANSACTION:
              return (
                <div key={tx.id}>
                  <ExpiredTransactionCard
                    signRequest={tx}
                    account={account}
                    setAlerts={setAlerts}
                  />
                  <br />
                </div>
              );
            case TransactionStatus.EXPIRED_TRANSACTION:
              return (
                <div key={tx.id}>
                  <ExpiredTransactionCard
                    signRequest={tx}
                    account={account}
                    setAlerts={setAlerts}
                  />
                  <br />
                </div>
              );
          }
        })
      )}
      {alerts.show && (
        <ToastContainer position="bottom-end">
          <Toast
            delay={5000}
            autohide
            bg={alerts.variant}
            onClose={() => {
              setAlerts({});
            }}>
            <ToastBody>{alerts.text}</ToastBody>
          </Toast>
        </ToastContainer>
      )}
    </div>
  );
};

interface ITransactionProps {
  signRequest: SignatureRequest;
  account: LoginResponseType;
  setAlerts: any;
}

const PendingRequestCard = ({
  signRequest,
  account,
  setAlerts,
}: ITransactionProps) => {
  const [request, setRequest] = useState(signRequest);
  const [user, setAccount] = useState(account);
  const [status, setStatus] = useState(TransactionStatus.PENDING_TRANSACTION);
  const [initiated, setInitiated] = useState(false);
  const [isBroadcasted, setIsBroadcasted] = useState(false);
  const [creationDate, setCreationDate] = useState(undefined);
  const [expirationDate, setExpirationDate] = useState(undefined);
  const [decodedTransaction, setDecodedTransaction] =
    useState<ITransaction>(undefined);
  const [decoded, setDecoded] = useState(false);
  const [valid, setValid] = useState(false);
  const [showDecodedTx, setShowDecodedTx] = useState(false);
  const multisig = HiveMultisig.getInstance(window, MultisigUtils.getOptions());

  const handleDecode = async () => {
    try {
      const decodedTxs = await multisig.utils.decodeTransaction({
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
    } catch (error) {
      alert(error);
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

    multisig.wss
      .signTransaction(data)
      .then(async (signatures) => {
        if (signatures?.length > 0) {
          let txToBroadcast = structuredClone(decodedTransaction);
          txToBroadcast.transaction.signatures = [...signatures];
          let broadcastResult = await multisig.wss.broadcastTransaction(
            txToBroadcast,
          );
          setIsBroadcasted(broadcastResult !== undefined);
          setAlerts({
            variant: 'success',
            text: 'The transaction was broadcasted successfully!',
            show: true,
          });
        }
      })
      .catch((reason: any) => {
        setAlerts({
          variant: 'danger',
          text: 'Failed to broadcast',
          show: 'true',
        });
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
      if (initiated) {
        setStatus(TransactionStatus.BROADCASTED_INITIATED_TRANSACTION);
      } else {
        setStatus(TransactionStatus.BROADCASTED_TRANSACTION);
      }
    }
  }, [isBroadcasted]);

  useEffect(() => {
    if (initiated && status === TransactionStatus.PENDING_TRANSACTION) {
      setStatus(TransactionStatus.PENDING_INITIATED_TRANSACTION);
    }
  }, [initiated]);
  return (
    <div>
      <Card key={signRequest.id}>
        <Card.Body>
          <Card.Title>{status}</Card.Title>
          {creationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Creation: ${creationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}
          {expirationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Expiration: ${expirationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}
          {status !== TransactionStatus.INVALID && decoded ? (
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
            {(status === TransactionStatus.PENDING_INITIATED_TRANSACTION &&
              !decoded) ||
            (status === TransactionStatus.PENDING_TRANSACTION && !decoded) ? (
              <Button
                variant="success"
                type="button"
                onClick={() => {
                  handleDecode();
                }}>
                Decode
              </Button>
            ) : (status === TransactionStatus.PENDING_INITIATED_TRANSACTION &&
                decoded &&
                !initiated) ||
              (status === TransactionStatus.PENDING_TRANSACTION &&
                decoded &&
                !initiated) ? (
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
  const [status, setStatus] = useState(
    TransactionStatus.BROADCASTED_TRANSACTION,
  );
  const [initiated, setInitiated] = useState(false);
  const [isBroadcasted, setIsBroadcasted] = useState(false);
  const [creationDate, setCreationDate] = useState(undefined);
  const [expirationDate, setExpirationDate] = useState(undefined);
  const [decodedTransaction, setDecodedTransaction] =
    useState<ITransaction>(undefined);
  const [decoded, setDecoded] = useState(false);
  const [valid, setValid] = useState(false);
  const [showDecodedTx, setShowDecodedTx] = useState(false);
  const multisig = HiveMultisig.getInstance(window, MultisigUtils.getOptions());

  const handleDecode = async () => {
    try {
      const decodedTxs = await multisig.utils.decodeTransaction({
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
    } catch {
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
    if (isBroadcasted && initiated) {
      setStatus(TransactionStatus.BROADCASTED_INITIATED_TRANSACTION);
    } else {
      setStatus(TransactionStatus.BROADCASTED_TRANSACTION);
    }
  }, [isBroadcasted]);
  return (
    <div>
      <Card key={signRequest.id}>
        <Card.Body>
          <Card.Title>{status}</Card.Title>
          {creationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Creation: ${creationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}
          {expirationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Expiration: ${expirationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}
          {(status === TransactionStatus.BROADCASTED_INITIATED_TRANSACTION &&
            decoded &&
            valid) ||
          (status === TransactionStatus.BROADCASTED_TRANSACTION &&
            decoded &&
            valid) ? (
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
            {(status === TransactionStatus.BROADCASTED_INITIATED_TRANSACTION &&
              !decoded) ||
            (status === TransactionStatus.BROADCASTED_TRANSACTION &&
              !decoded) ? (
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

const ExpiredTransactionCard = ({
  signRequest,
  account,
}: ITransactionProps) => {
  const [request, setRequest] = useState(signRequest);
  const [user, setAccount] = useState(account);
  const [status, setStatus] = useState(TransactionStatus.EXPIRED_TRANSACTION);
  const [initiated, setInitiated] = useState(false);
  const [creationDate, setCreationDate] = useState(undefined);
  const [expirationDate, setExpirationDate] = useState(undefined);
  const [decodedTransaction, setDecodedTransaction] =
    useState<ITransaction>(undefined);
  const [decoded, setDecoded] = useState(false);
  const [valid, setValid] = useState(false);
  const [showDecodedTx, setShowDecodedTx] = useState(false);
  const multisig = HiveMultisig.getInstance(window, MultisigUtils.getOptions());

  const handleDecode = async () => {
    try {
      const decodedTxs = await multisig.utils.decodeTransaction({
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
    } catch {
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
      setInitiated(initiatedByMe(request, user));
    }
  }, [request]);
  useEffect(() => {
    if (initiated) {
      setStatus(TransactionStatus.EXPIRED_INITIATED_TRANSACTION);
    }
  }, [initiated]);
  return (
    <div>
      <Card key={signRequest.id}>
        <Card.Body>
          <Card.Title>{status}</Card.Title>
          {creationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Creation: ${creationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}
          {expirationDate ? (
            <Card.Subtitle className="mb-2 text-muted">{`Expiration: ${expirationDate.toLocaleString()}`}</Card.Subtitle>
          ) : null}
          {decoded && valid ? (
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
            {!decoded ? (
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

export enum TransactionStatus {
  PENDING_INITIATED_TRANSACTION = 'Pending Initiated Transaction',
  PENDING_TRANSACTION = 'Pending Transaction',
  BROADCASTED_INITIATED_TRANSACTION = 'Broadcasted Initiated Transaction',
  BROADCASTED_TRANSACTION = 'Broadcasted Transaction',
  EXPIRED_INITIATED_TRANSACTION = 'Expired Initiated Transaction',
  EXPIRED_TRANSACTION = 'Expired Transaction',
  INVALID = 'Invalid',
}
const GetStatus = (
  signRequest: SignatureRequest,
  account: LoginResponseType,
) => {
  if (isPending(signRequest, account) && initiatedByMe(signRequest, account)) {
    return TransactionStatus.PENDING_INITIATED_TRANSACTION;
  } else if (
    isPending(signRequest, account) &&
    !initiatedByMe(signRequest, account)
  ) {
    return TransactionStatus.PENDING_TRANSACTION;
  } else if (
    isBroadcasted(signRequest) &&
    initiatedByMe(signRequest, account)
  ) {
    return TransactionStatus.BROADCASTED_INITIATED_TRANSACTION;
  } else if (
    isBroadcasted(signRequest) &&
    !initiatedByMe(signRequest, account)
  ) {
    return TransactionStatus.BROADCASTED_TRANSACTION;
  } else if (isExpired(signRequest) && initiatedByMe(signRequest, account)) {
    return TransactionStatus.EXPIRED_INITIATED_TRANSACTION;
  } else if (isExpired(signRequest) && !initiatedByMe(signRequest, account)) {
    return TransactionStatus.EXPIRED_TRANSACTION;
  } else {
    return undefined;
  }
};

const isExpired = (signRequest: SignatureRequest) => {
  return signRequest.status === 'expired';
};

const isSignedd = (signRequest: SignatureRequest) => {
  return signRequest.status === 'signed';
};

const isBroadcasted = (signRequest: SignatureRequest) => {
  return signRequest.broadcasted || signRequest.status === 'broadcasted';
};

const isPending = (
  signRequest: SignatureRequest,
  account: LoginResponseType,
) => {
  return (
    !isBroadcasted(signRequest) &&
    !isExpired(signRequest) &&
    signRequest.status !== 'expired'
  );
};

const initiatedByMe = (
  signRequest: SignatureRequest,
  account: LoginResponseType,
) => {
  if (account) {
    return signRequest.initiator === account.data.username;
  }
  return false;
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
