import { ReactNode, useEffect, useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import Transfer from "../cards/Transactions/transferCard";
export const TransactionPage = () =>
{   
    const [transactionType, setTransactionType ] = useState<string>('TransferOperation')
    const [transactionCard, setTransactionCard] = useState<ReactNode>();
    useEffect(()=>{
        document.title = "Hive Multisig - Transaction";
    },[])
    useEffect(() => {
        handleSelectOnChange(transactionType)
    },[transactionType])
    
    const handleSelectOnChange = (transaction:string) =>{
        switch(transaction){
            case 'TransferOperation':
                setTransactionCard(<Transfer/>)
                break;
            default:
                setTransactionCard(undefined)
                console.log(transaction);
                break;
        }
    }

    return (
        <div>
        
        <InputGroup>
            <InputGroup.Text id="basic-addon1">Transaction</InputGroup.Text>
            <Form.Select 
            aria-label="select"
            onChange={e => setTransactionType(e.target.value)}
            >
                <option value='TransferOperation'>Transfer</option>
                <option value='DelegateVestingSharesOperation'>Delegations</option>
                <option value='TransferToVestingOperation'>Power Up</option>
                <option value='WithdrawVestingOperation'>Power Down</option>
                <option value='TransferToSavingsOperation'>Deposit Savings</option>
                <option value='TransferFromSavingsOperation'>Withdraw from Savings</option>
                <option value='AccountWitnessVoteOperation'>Vote for Witness</option>
                <option value='AccountWitnessProxyOperation'>Choose Proxy</option>
                <option value='UpdateProposalVotesOperation'>Vote for Proposal</option>
                <option value='RecurrentTransferOperation'>Recrurrent Transfer</option>
                <option value='CustomJsonOperation'>Broadcast JSON</option>
                <option value='VoteOperation'>Vote</option>
                <option value='BlogCommentOperation'>Blog Post</option>
                <option value='CommentOperation'>Comment</option>
            </Form.Select>
        </InputGroup>
        <br/>
        <div>
            {transactionCard?transactionCard:''}
        </div>
        </div>

    )
}