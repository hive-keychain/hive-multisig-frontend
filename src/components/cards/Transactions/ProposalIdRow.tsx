import { useState } from "react"
import { Button, Container, Form, Stack } from "react-bootstrap"

interface IProposalIDsRowProps{
    proposalId:string
    handleDelete:Function
}
interface IAddProposalIdRowProps{
    handleAdd:Function
}

export const ProposalIDRow: React.FC<IProposalIDsRowProps> = ({proposalId,handleDelete}) => {
   
    return(
        <Container fluid>
        <Stack direction="horizontal" gap={3}>
            <Form.Control
            className='gray-input-outline'
            value={String(proposalId)}
            readOnly
            />

            <Button
            className='txn-crd-btn'
            variant="outline-danger"
            onClick={() => {
                handleDelete(proposalId);
            }}>
                Delete
            </Button>
        </Stack>
        </Container>
    )
}

export const AddProposalIDRow: React.FC<IAddProposalIdRowProps> = ({handleAdd}) =>{
    const [input, setInput] = useState('')
    const onAddBtnClicked = ()=>{
        if(input && input!==''){
            handleAdd(input)
            setInput('')
        }
    }
    return (
        <Container fluid>
        <Stack direction="horizontal" gap={3}>
            <Form.Control
            className='gray-input-outline'
            type='text'
            placeholder='Proposal ID'
            value={input}
            onChange={(e) => {setInput(e.target.value.replace(/[^\d.-]/g, ''))}}
            />
            <Button
            className='txn-crd-btn'
            variant="success"
            onClick={ () => {onAddBtnClicked()}}
            >
            Add
            </Button>
        </Stack>
        </Container>
    )
}