import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisig } from 'hive-multisig-sdk/src';
import { IEncodeTransaction } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import { ReactNode, useEffect, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from 'usehooks-ts/dist/esm/useLocalStorage/useLocalStorage';
import { Config } from '../../config';
import {
  ITransaction,
  Initiator,
} from '../../interfaces/transaction.interface';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
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
import {
  getElapsedTimestampSeconds,
  getISOStringDate,
  getTimestampInSeconds,
} from '../../utils/utils';
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
  const loginExpirationInSec = Config.login.expirationInSec;

  const [loginTimestamp, setLoginTimestamp] = useLocalStorage(
    'loginTimestap',
    null,
  );
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);

  const operation = useAppSelector(
    (state) => state.transaction.transaction.operation,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const [transactionType, setTransactionType] =
    useState<string>('TransferOperation');
  const [transactionCard, setTransactionCard] = useState<ReactNode>();
  const [method, setMethod] = useState<KeychainKeyTypes>(
    KeychainKeyTypes.active,
  );

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (signedAccountObj) {
      document.title = 'Hive Multisig - Transaction';
      dispatch(resetOperation());
      setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
    } else {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    handleSelectOnChange(transactionType);
    dispatch(setTransactionName(transactionType));
  }, [transactionType]);

  useEffect(() => {
    if (signedAccountObj && isLoggedIn()) {
      dispatchTxAsync();
    }
  }, [method]);

  useEffect(() => {
    if (operation && isLoggedIn()) {
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
        try {
          const encodedTxObj = await multisig.utils.encodeTransaction(txEncode);
          multisig.wss.requestSignatures(encodedTxObj).then(() => {
            dispatch(resetOperation());
          });
        } catch (error) {
          alert(`${error}`);
        }
      })();
    }
  }, [operation]);

  const dispatchTxAsync = async () => {
    try {
      const txInfo: ITransaction = {
        username: signedAccountObj.data.username,
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
      signedAccountObj.data.username,
      keyType,
    );
    const initiator: Initiator = {
      username: signedAccountObj.data.username,
      publicKey: auth[0].toString(),
      weight: auth[1],
    };
    await dispatch(setInitiator(initiator));
  };
  const isLoggedIn = () => {
    const loggedinDuration = getElapsedTimestampSeconds(
      loginTimestamp,
      getTimestampInSeconds(),
    );
    return !(loginTimestamp > 0 && loggedinDuration >= loginExpirationInSec);
  };

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
