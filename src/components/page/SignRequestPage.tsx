import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
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
import { useLocalStorage } from 'usehooks-ts';
import { Config } from '../../config';
import { LoginResponseType } from '../../interfaces';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { loginActions } from '../../redux/features/login/loginSlice';
import { multisigActions } from '../../redux/features/multisig/multisigSlices';
import {
  addBroadcastedTransaction,
  addSignRequest,
  addUserNotifications,
  notifyBroadcastedTransaction,
  signerConnectActive,
  signerConnectPosting,
  subscribeToBroadcastedTransactions,
  subscribeToSignRequests,
} from '../../redux/features/multisig/multisigThunks';
import { transactionActions } from '../../redux/features/transaction/transactionSlices';
import { updateAuthorityActions } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
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
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);

  const [accountDetails, setStorageAccountDetails] = useLocalStorage(
    'accountDetails',
    signedAccountObj,
  );
  const [loginTimestamp, setLoginTimestamp] = useLocalStorage(
    'loginTimestap',
    null,
  );
  const [transactionType, setTransactionType] =
    useState<string>('TransferOperation');

  const account = useAppSelector((state) => state.login.accountObject);
  const postingConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessagePosting,
  );
  const activeConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessageActive,
  );
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
  const [alerts, setAlerts] = useState<AlertType>({});
  const multisig = HiveMultisigSDK.getInstance(
    window,
    MultisigUtils.getOptions(),
  );
  const navigate = useNavigate();

  const getSignRequests = async () => {
    if (activeConnectMessage) {
      try {
        var activeReqs: SignatureRequest[] =
          await multisig.getSignatureRequests(activeConnectMessage);
        if (activeReqs) {
          dispatch(addSignRequest(activeReqs));
        }
      } catch {}
    }
    if (postingConnectMessage) {
      try {
        var postingReqs: SignatureRequest[] =
          await multisig.getSignatureRequests(postingConnectMessage);
        if (postingReqs) {
          dispatch(addSignRequest(postingReqs));
        }
      } catch {}
    }
  };
  useEffect(() => {
    if (account) {
      const loggedinDuration = getElapsedTimestampSeconds(
        loginTimestamp,
        getTimestampInSeconds(),
      );
      if (loginTimestamp > 0 && loggedinDuration >= loginExpirationInSec) {
        handleLogout();
        navigate('/');
      } else {
        getSignRequests();
        connectToBackend();
      }
    } else {
      navigate('/');
    }
  }, []);

  const handleLogout = async () => {
    setLoginTimestamp(0);
    setStorageAccountDetails(null);
    await dispatch(loginActions.logout());
    await dispatch(multisigActions.resetState());
    await dispatch(transactionActions.resetState());
    await dispatch(updateAuthorityActions.resetState());
  };
  useEffect(() => {
    if (transactions) {
      transactions.sort((a, b) => {
        var keyA = new Date(a.createdAt);
        var keyB = new Date(b.createdAt);
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
      });
    }
  }, [transactions]);
  useEffect(() => {
    if (requests) {
      let newSignRequests: SignatureRequest[] = [...signRequests];
      for (var i = 0; i < requests.length; i++) {
        if (newSignRequests.find((req) => req.id === requests[i].id)) {
          continue;
        }
        newSignRequests.unshift(requests[i]);
      }
      if (newSignRequests?.length > 0) {
        setSignRequests([...newSignRequests]);
      }
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
        newNotifications.unshift({ ...userNotifications[i].signatureRequest });
      }
      if (newNotifications?.length > 0) {
        setNotifications([...newNotifications]);
      }
    }
  }, [userNotifications]);

  useEffect(() => {
    if (broadcastedTransactions) {
      let newBroadcasted: SignatureRequest[] = [...broadcasted];
      for (var i = 0; i < broadcastedTransactions.length; i++) {
        const index = newBroadcasted.findIndex(
          (broadcasted) => broadcasted.id === broadcastedTransactions[i].id,
        );
        if (index > -1) {
          newBroadcasted[index] = { ...broadcastedTransactions[i] };
          continue;
        }
        newBroadcasted.unshift(broadcastedTransactions[i]);
      }
      if (newBroadcasted?.length > 0) {
        setNewBroadcasted([...newBroadcasted]);
      }
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
      newTransactions.unshift({ ...signRequests[i] });
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
      newTransactions.unshift({ ...notifications[i] });
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
      newTransactions.unshift({ ...broadcasted[i] });
    }
    setTransactions([...newTransactions]);
  };

  const subToSignRequests = async () => {
    const subscribeRes = await multisig.subscribeToSignRequests(
      signRequestCallback,
    );
    dispatch(subscribeToSignRequests(subscribeRes));
  };
  const subToBroadcastedTransactions = async () => {
    const subscribeRes = await multisig.subscribeToBroadcastedTransactions(
      broadcastedTransactionCallback,
    );
    dispatch(subscribeToBroadcastedTransactions(subscribeRes));
  };
  const signRequestCallback = async (message: SignatureRequest) => {
    if (message) {
      await dispatch(addSignRequest([message]));
    }
  };
  const broadcastedTransactionCallback = async (message: SignatureRequest) => {
    if (message) {
      await dispatch(addBroadcastedTransaction([message]));
      await dispatch(notifyBroadcastedTransaction(true));
    }
  };

  const connectActive = async () => {
    if (activeConnectMessage) {
      const signerConnectResponse = await multisig.signerConnect(
        activeConnectMessage,
      );
      if (signerConnectResponse.result) {
        if (signerConnectResponse.result.pendingSignatureRequests) {
          const pendingReqs =
            signerConnectResponse.result.pendingSignatureRequests[
              activeConnectMessage.username
            ];
          if (pendingReqs?.length > 0) {
            await dispatch(addSignRequest(pendingReqs));
          }
        }

        if (signerConnectResponse.result.notifications) {
          const notifications =
            signerConnectResponse.result.notifications[
              activeConnectMessage.username
            ];
          if (notifications?.length > 0) {
            await dispatch(addUserNotifications(notifications));
          }
        }
        await dispatch(signerConnectActive(signerConnectResponse));
      } else {
        console.log('connectActive Failed');
      }
    }
  };
  const connectPosting = async () => {
    if (postingConnectMessage) {
      const signerConnectResponse = await multisig.signerConnect(
        postingConnectMessage,
      );
      if (signerConnectResponse.result) {
        if (signerConnectResponse.result.pendingSignatureRequests) {
          const pendingReqs =
            signerConnectResponse.result.pendingSignatureRequests[
              postingConnectMessage.username
            ];
          if (pendingReqs.length > 0) {
            await dispatch(addSignRequest(pendingReqs));
          }
        }
        if (signerConnectResponse.result.notifications) {
          const notifications =
            signerConnectResponse.result.notifications[
              postingConnectMessage.username
            ];
          if (notifications?.length > 0) {
            await dispatch(addUserNotifications(notifications));
          }
        }
        await dispatch(signerConnectPosting(signerConnectResponse));
      } else {
        console.log('connectPosting Failed');
      }
    }
  };
  const connectToBackend = async () => {
    await connectPosting();
    await connectActive();
    await subToSignRequests();
    await subToBroadcastedTransactions();
  };

  return (
    <div>
      {transactions?.length <= 0 ? (
        <div> {'No signature requests'}</div>
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
  const multisig = HiveMultisigSDK.getInstance(
    window,
    MultisigUtils.getOptions(),
  );

  const handleDecode = async () => {
    try {
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

    multisig
      .signTransaction(data)
      .then(async (signatures) => {
        if (signatures?.length > 0) {
          let txToBroadcast = structuredClone(decodedTransaction);
          txToBroadcast.transaction.signatures = [...signatures];
          let broadcastResult = await multisig.broadcastTransaction(
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
  const multisig = HiveMultisigSDK.getInstance(
    window,
    MultisigUtils.getOptions(),
  );

  const handleDecode = async () => {
    try {
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
  const multisig = HiveMultisigSDK.getInstance(
    window,
    MultisigUtils.getOptions(),
  );

  const handleDecode = async () => {
    try {
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
  return signRequest.broadcasted && signRequest.status === 'broadcasted';
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
