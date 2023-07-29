import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
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
import { showSignRequests } from '../../redux/features/multisig/multisigThunks';
import {
  setAuthority,
  setInitiator,
  setTransactionMethod,
  setTransactionName,
} from '../../redux/features/transaction/transactionThunks';
import HiveUtils from '../../utils/hive.utils';
import HiveTxUtils from '../../utils/hivetx.utils';
import { getISOStringDate } from '../../utils/utils';
import Transfer from '../cards/Transactions/TransferCard';
import { SignRequests } from '../modals/SignRequests';

export const TransactionPage = () => {
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const multisig = new HiveMultisigSDK(window);

  const operation = useAppSelector(
    (state) => state.transaction.transaction.operation,
  );
  const signRequests = useAppSelector(
    (state) => state.multisig.multisig.signRequests,
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
    if (signRequests) {
      if (signRequests.length > 0) {
        dispatch(showSignRequests(true));
      }
    }
  }, [signRequests]);
  useEffect(() => {
    if (loggedInAccount) {
      document.title = 'Hive Multisig - Transaction';
      handleSetInitiator('Active');
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
      weight: auth[1].toString(),
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
          expirationDate: new Date(
            getISOStringDate(transactionState.expiration),
          ),
          initiator: transactionState.initiator,
          authority: transactionState.authority,
        };
        const encodedTxObj = await multisig.encodeTransaction(txEncode);

        const result = await multisig.sendSignatureRequest(encodedTxObj);
        console.log('Send signature request:');
        console.log(result);
      })();
    }
  }, [operation]);

  const handleSelectOnChange = (transaction: string) => {
    switch (transaction) {
      case 'TransferOperation':
        setTransactionCard(<Transfer />);
        break;
      // case 'DelegateVestingSharesOperation':
      //   setTransactionCard(<DelegationsCard />);
      //   break;
      // case 'TransferToVestingOperation':
      //   setTransactionCard(<PowerUpCard />);
      //   break;
      // case 'WithdrawVestingOperation':
      //   setTransactionCard(<PowerDownCard />);
      //   break;
      // case 'TransferToSavingsOperation':
      //   setTransactionCard(<DepositToSavingsCard />);
      //   break;
      // case 'TransferFromSavingsOperation':
      //   setTransactionCard(<WithdrawFromSavingsCard />);
      //   break;
      // case 'AccountWitnessVoteOperation':
      //   setTransactionCard(<VoteForWitnessCard />);
      //   break;
      // case 'AccountWitnessProxyOperation':
      //   setTransactionCard(<AccountWitnessProxCard />);
      //   break;
      // case 'UpdateProposalVotesOperation':
      //   setTransactionCard(<UpdateProposalVoteCard />);
      //   break;
      // case 'RecurrentTransferOperation':
      //   setTransactionCard(<RecurrentTransferCard />);
      //   break;
      // case 'CustomJsonOperation':
      //   setTransactionCard(<BroadcastJson />);
      //   break;
      // case 'VoteOperation':
      //   setTransactionCard(<VoteOperationCard />);
      //   break;
      // case 'BlogOperation':
      //   setTransactionCard(<BlogpostOperationCard />);
      //   break;
      // case 'CommentOperation':
      //   setTransactionCard(<CommentOperationCard />);
      //   break;
      default:
        setTransactionCard(undefined);
        console.log(transaction);
        break;
    }
  };

  return (
    <div>
      <div>
        <SignRequests />
      </div>
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
      <div>{transactionCard ? transactionCard : ''}</div>
    </div>
  );
};
