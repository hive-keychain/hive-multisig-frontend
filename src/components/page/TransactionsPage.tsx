import * as Hive from '@hiveio/dhive';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisig } from 'hive-multisig-sdk/src';
import { ReactNode, useEffect, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import { Config } from '../../config';
import {
  ITransaction,
  Initiator,
  TxStatus,
} from '../../interfaces/transaction.interface';
import { TwoFACodes } from '../../interfaces/twoFactorAuth.interface';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { setTwoFASigners } from '../../redux/features/multisig/multisigThunks';
import {
  resetOperation,
  setAuthority,
  setInitiator,
  setTransactionMethod,
  setTransactionName,
  setTxStatus,
} from '../../redux/features/transaction/transactionThunks';
import HiveUtils from '../../utils/hive.utils';
import HiveTxUtils from '../../utils/hivetx.utils';
import { MultisigUtils } from '../../utils/multisig.utils';
import {
  getElapsedTimestampSeconds,
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
import { OtpModal } from '../modals/OtpModal';

export const TransactionPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoggedIn = useLoginState();
  const multisig = useMultisigState();

  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const operation = useAppSelector(
    (state) => state.transaction.transaction.operation,
  );
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  useTxStatus();
  const twoFASigners = useAppSelector(
    (state) => state.multisig.multisig.twoFASigners,
  );
  const [transactionType, setTransactionType] =
    useState<string>('TransferOperation');
  const [transactionCard, setTransactionCard] = useState<ReactNode>();
  const [method, setMethod] = useState<KeychainKeyTypes>(
    KeychainKeyTypes.active,
  );
  const [otpBots, setOtpBots] = useState<
    { bot: [string, number]; otp: string }[]
  >([]);
  const [askOtp, setAskOtp] = useState<boolean>(false);

  const [transaction, setTransaction] = useState<Hive.Transaction>(undefined);

  const submittedOp = useSubmitTransactionState();

  useEffect(() => {
    if (signedAccountObj) {
      document.title = 'Hive Multisig - Transaction';
      dispatch(resetOperation());
      handleMethodChange();
      handleSetInitiator(method);
    } else {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (operation && isLoggedIn) {
      handleMultisigTransaciton();
      //handle non multisig
    }
  }, [submittedOp]);

  useEffect(() => {
    handleSelectOnChange(transactionType);
    dispatch(setTransactionName(transactionType));
  }, [transactionType]);

  useEffect(() => {
    if (signedAccountObj && isLoggedIn) {
      handleMethodChange();
      handleSetInitiator(method);
    }
  }, [method]);

  const handleMethodChange = async () => {
    try {
      const txInfo: ITransaction = {
        username: signedAccountObj.data.username,
        expiration: undefined,
        method,
      };
      dispatch(setTransactionMethod(method));
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
    console.log(initiator);
    await dispatch(setInitiator(initiator));
  };

  const handleMultisigTransaciton = async () => {
    const transaction = await HiveTxUtils.createTx(
      [operation],
      transactionState.expiration,
    );

    const twoFASigners = await multisig.utils.get2FASigners(
      transaction,
      transactionState.method,
    );

    if (twoFASigners.length === 0) {
      try {
        MultisigUtils.broadcastTransaction(
          transaction,
          signedAccountObj.data.username,
          transactionState.initiator,
        )
          .then(() => {
            dispatch(setTxStatus(TxStatus.success));
          })
          .catch((e) => {
            dispatch(setTxStatus(TxStatus.failed));
          });
      } catch (error) {
        dispatch(setTxStatus(TxStatus.failed));
      }
    } else {
      setTransaction(transaction);
      let bots: TwoFACodes = {};
      for (let i = 0; i < twoFASigners.length; i++) {
        bots[twoFASigners[i][0]] = '';
      }
      dispatch(setTwoFASigners(bots));
      setAskOtp(true);
    }
  };

  const handleOtpSubmit = async () => {
    try {
      MultisigUtils.broadcastTransaction(
        transaction,
        signedAccountObj.data.username,
        transactionState.initiator,
        twoFASigners,
      )
        .then(() => {
          dispatch(setTxStatus(TxStatus.success));
        })
        .catch((e) => {
          dispatch(setTxStatus(TxStatus.failed));
        });
    } catch (error) {
      dispatch(setTxStatus(TxStatus.failed));
    }
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
      <div>
        <OtpModal handleSubmit={handleOtpSubmit} show={askOtp} />
        <InputGroup>
          <InputGroup.Text id="basic-addon1">Transaction</InputGroup.Text>
          <Form.Select
            aria-label="select"
            onChange={(e) => setTransactionType(e.target.value)}>
            <option value="TransferOperation">Transfer</option>
            <option value="DelegateVestingSharesOperation">Delegations</option>
            <option value="TransferToVestingOperation">Power Up</option>
            <option value="WithdrawVestingOperation">Power Down</option>
            <option value="TransferToSavingsOperation">
              Deposit to Savings
            </option>
            <option value="TransferFromSavingsOperation">
              Withdraw from Savings
            </option>
            <option value="AccountWitnessVoteOperation">
              Vote for Witness
            </option>
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
      </div>
      <br />
      <div>{transactionCard}</div>
    </div>
  );
};

const useSubmitTransactionState = () => {
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const [opSubmitted, setOpSubmitted] = useState(false);

  useEffect(() => {
    if (transactionState) {
      if (transactionState.operation) {
        setOpSubmitted(true);
      } else {
        setOpSubmitted(false);
      }
    }
  }, [transactionState]);
  return opSubmitted;
};

const useLoginState = () => {
  const loginExpirationInSec = Config.login.expirationInSec;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginTimestamp, setLoginTimestamp] = useLocalStorage(
    'loginTimestap',
    null,
  );
  useEffect(() => {
    const loggedinDuration = getElapsedTimestampSeconds(
      loginTimestamp,
      getTimestampInSeconds(),
    );
    const status = !(
      loginTimestamp > 0 && loggedinDuration >= loginExpirationInSec
    );
    setIsLoggedIn(status);
  }, []);

  return isLoggedIn;
};

const useMultisigState = () => {
  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);

  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  useEffect(() => {
    if (signedAccountObj) {
      setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
    }
  }, []);
  return multisig;
};

const useTxStatus = () => {
  const txStatus = useAppSelector(
    (state) => state.transaction.transaction.transactionStatus,
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useEffect(() => {
    switch (txStatus) {
      case TxStatus.success:
        dispatch(setTxStatus(TxStatus.none));
        navigate('/');
        break;
      case TxStatus.failed:
        dispatch(setTxStatus(TxStatus.none));
        navigate('/');
        break;
      case TxStatus.cancel:
        dispatch(setTxStatus(TxStatus.none));
        navigate('/');
        break;
    }
  }, [txStatus]);
};
