import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
import { SignatureRequest } from 'hive-multisig-sdk/src/interfaces/signature-request';
import { IEncodeTransaction } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import { ReactNode, useEffect, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useReadLocalStorage } from 'usehooks-ts';
import { LoginResponseType } from '../../interfaces';
import {
  ITransaction,
  Initiator,
} from '../../interfaces/transaction.interface';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  addBroadcastedTransaction,
  addSignRequest,
  addUserNotifications,
  notifyBroadcastedTransaction,
  notifySignRequest,
  signerConnectActive,
  signerConnectPosting,
  subscribeToBroadcastedTransactions,
  subscribeToSignRequests,
} from '../../redux/features/multisig/multisigThunks';
import {
  resetOperation,
  setAuthority,
  setInitiator,
  setTransactionMethod,
  setTransactionName,
} from '../../redux/features/transaction/transactionThunks';
import HiveUtils from '../../utils/hive.utils';
import HiveTxUtils from '../../utils/hivetx.utils';
import { MultisigUtils } from '../../utils/multisig.utils';
import { getISOStringDate } from '../../utils/utils';
import AccountWitnessProxCard from '../cards/Transactions/AccountWitnessProxCard';
import { BlogpostOperationCard } from '../cards/Transactions/BlogpostOperationCard';
import BroadcastJson from '../cards/Transactions/BroadcastJson';
import { CommentOperationCard } from '../cards/Transactions/CommentOperationCard';
import DelegationsCard from '../cards/Transactions/DelegationsCard';
import DepositToSavingsCard from '../cards/Transactions/DepositToSavingsCard';
import PowerDownCard from '../cards/Transactions/PowerDownCard';
import PowerUpCard from '../cards/Transactions/PowerUpCard';
import RecurrentTransferCard from '../cards/Transactions/RecurrentTransferCard';
import Transfer from '../cards/Transactions/TransferCard';
import UpdateProposalVoteCard from '../cards/Transactions/UpdateProposalVoteCard';
import VoteForWitnessCard from '../cards/Transactions/VoteForWitnessCard';
import { VoteOperationCard } from '../cards/Transactions/VoteOperationCard';
import WithdrawFromSavingsCard from '../cards/Transactions/WithdrawFromSavingsCard';

export const TransactionPage = () => {
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const multisig = HiveMultisigSDK.getInstance(
    window,
    MultisigUtils.getOptions(),
  );
  const postingConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessagePosting,
  );
  const activeConnectMessage = useAppSelector(
    (state) => state.multisig.multisig.signerConnectMessageActive,
  );
  const operation = useAppSelector(
    (state) => state.transaction.transaction.operation,
  );
  const signRequestNotif = useAppSelector(
    (state) => state.multisig.multisig.signRequestNotification,
  );
  const broadcastNotif = useAppSelector(
    (state) => state.multisig.multisig.broadcastNotification,
  );
  const loggedInAccount =
    useReadLocalStorage<LoginResponseType>('accountDetails');
  const [transactionType, setTransactionType] =
    useState<string>('TransferOperation');
  const [transactionCard, setTransactionCard] = useState<ReactNode>();
  const [method, setMethod] = useState<KeychainKeyTypes>(
    KeychainKeyTypes.active,
  );

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (signRequestNotif) {
      alert('Received new sign request');
      navigate('/signRequest');
      dispatch(notifySignRequest(false));
    }
  }, [signRequestNotif]);

  useEffect(() => {
    if (broadcastNotif) {
      alert('A transaction as been broadcasted');
      dispatch(notifyBroadcastedTransaction(false));
    }
  }, [broadcastNotif]);

  useEffect(() => {
    if (loggedInAccount) {
      document.title = 'Hive Multisig - Transaction';
      connectToBackend();
    } else {
      navigate('/login');
    }
  }, []);

  useEffect(() => {
    if (!loggedInAccount) {
      navigate('/login');
    }
  }, [loggedInAccount]);

  useEffect(() => {
    handleSelectOnChange(transactionType);
    dispatch(setTransactionName(transactionType));
  }, [transactionType]);

  useEffect(() => {
    dispatchTxAsync();
  }, [method]);

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
      if (message.initiator !== loggedInAccount.data.username) {
        await dispatch(notifySignRequest(true));
      }
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
  const dispatchTxAsync = async () => {
    try {
      const txInfo: ITransaction = {
        username: loggedInAccount.data.username,
        expiration: undefined,
        method,
      };
      await dispatch(setTransactionMethod(method));
      await handleSetInitiator(method);
      dispatch(setAuthority(txInfo));
    } catch (error) {
      console.log('Error while dispatching transaction details');
    }
  };

  const handleSetInitiator = async (keyType: string) => {
    const auth = await HiveUtils.getAccountPublicKeyAuthority(
      loggedInAccount.data.username,
      keyType,
    );
    const initiator: Initiator = {
      username: loggedInAccount.data.username,
      publicKey: auth[0].toString(),
      weight: auth[1],
    };
    await dispatch(setInitiator(initiator));
  };

  useEffect(() => {
    if (operation) {
      (async () => {
        const transaction = await HiveTxUtils.createTx(
          [operation],
          transactionState.expiration,
        );
        const txEncode: IEncodeTransaction = {
          transaction: transaction,
          method: transactionState.method,
          expirationDate: getISOStringDate(transactionState.expiration),
          initiator: { ...transactionState.initiator },
        };

        console.log(txEncode);
        const encodedTxObj = await multisig.encodeTransaction(txEncode);
        multisig.sendSignatureRequest(encodedTxObj).then(() => {
          dispatch(resetOperation());
        });
      })();
    }
  }, [operation]);

  const handleSelectOnChange = (transaction: string) => {
    switch (transaction) {
      case 'TransferOperation':
        setTransactionCard(<Transfer />);
        break;
      case 'DelegateVestingSharesOperation':
        setTransactionCard(<DelegationsCard />);
        break;
      case 'TransferToVestingOperation':
        setTransactionCard(<PowerUpCard />);
        break;
      case 'WithdrawVestingOperation':
        setTransactionCard(<PowerDownCard />);
        break;
      case 'TransferToSavingsOperation':
        setTransactionCard(<DepositToSavingsCard />);
        break;
      case 'TransferFromSavingsOperation':
        setTransactionCard(<WithdrawFromSavingsCard />);
        break;
      case 'AccountWitnessVoteOperation':
        setTransactionCard(<VoteForWitnessCard />);
        break;
      case 'AccountWitnessProxyOperation':
        setTransactionCard(<AccountWitnessProxCard />);
        break;
      case 'UpdateProposalVotesOperation':
        setTransactionCard(<UpdateProposalVoteCard />);
        break;
      case 'RecurrentTransferOperation':
        setTransactionCard(<RecurrentTransferCard />);
        break;
      case 'CustomJsonOperation':
        setTransactionCard(<BroadcastJson />);
        break;
      case 'VoteOperation':
        setTransactionCard(<VoteOperationCard />);
        break;
      case 'BlogOperation':
        setTransactionCard(<BlogpostOperationCard />);
        break;
      case 'CommentOperation':
        setTransactionCard(<CommentOperationCard />);
        break;
    }
  };

  return (
    <div>
      <InputGroup>
        <InputGroup.Text id="basic-addon1">Transaction</InputGroup.Text>
        <Form.Select
          aria-label="select"
          onChange={(e) => setTransactionType(e.target.value)}>
          <option value="TransferOperation">Transfer</option>
          <option value="DelegateVestingSharesOperation">Delegations</option>
          <option value="TransferToVestingOperation">Power Up</option>
          <option value="WithdrawVestingOperation">Power Down</option>
          <option value="TransferToSavingsOperation">Deposit to Savings</option>
          <option value="TransferFromSavingsOperation">
            Withdraw from Savings
          </option>
          <option value="AccountWitnessVoteOperation">Vote for Witness</option>
          <option value="AccountWitnessProxyOperation">Choose Proxy</option>
          <option value="UpdateProposalVotesOperation">
            Vote for Proposal
          </option>
          <option value="RecurrentTransferOperation">
            Recrurrent Transfer
          </option>
          <option value="CustomJsonOperation">Broadcast JSON</option>
          <option value="VoteOperation">Vote</option>
          <option value="BlogOperation">Blog Post</option>
          <option value="CommentOperation">Comment</option>
        </Form.Select>
      </InputGroup>
      <br />
      <InputGroup>
        <InputGroup.Text id="basic-addon1">Method</InputGroup.Text>
        <Form.Select
          aria-label="select"
          onChange={(e) =>
            setMethod(
              e.target.value === 'active'
                ? KeychainKeyTypes.active
                : KeychainKeyTypes.posting,
            )
          }>
          <option value="active">Active</option>
          <option value="posting">Posting</option>
        </Form.Select>
      </InputGroup>
      <br />
      <div>{transactionCard}</div>
    </div>
  );
};
