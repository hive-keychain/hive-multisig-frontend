import { ReactNode, useEffect, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useReadLocalStorage } from 'usehooks-ts';
import { SignResponseType } from '../../interfaces';
import Transfer from '../cards/Transactions/TransferCard';

export const TransactionPage = () => {
  const loggedInAccount =
    useReadLocalStorage<SignResponseType>('accountDetails');
  const [transactionType, setTransactionType] =
    useState<string>('TransferOperation');
  const [transactionCard, setTransactionCard] = useState<ReactNode>();
  const navigate = useNavigate();

  useEffect(() => {
    if (loggedInAccount) {
      document.title = 'Hive Multisig - Transaction';
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
  }, [transactionType]);

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
      <div>{transactionCard ? transactionCard : ''}</div>
    </div>
  );
};
