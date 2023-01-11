import { TransferOperation } from "@hiveio/dhive";
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form, Stack } from 'react-bootstrap';
import { useReadLocalStorage } from "usehooks-ts";
import { SignResponseType } from "../../../interfaces";

function Transfer() {
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    const [ transferOpObj, setTransferOpObj] = useState<TransferOperation>();   
    const [from,setFrom] = useState<string>(loggedInAccount.data.username);
    const [to,setTo] = useState<string>();
    const [amount,setAmount] = useState<string>();
    const [memo,setMemo] = useState<string>();

    useEffect(()=>{
        console.log(transferOpObj)
    },[transferOpObj])

    const handleSendOnclick = ()=>{
        const newTransferOpObj:TransferOperation = {
            0: 'transfer',
            1: {
                from,
                to,
                amount,
                memo
            }
        }
        setTransferOpObj({...newTransferOpObj})
    }

    return (
        <Card>
      <Container>
        <Card.Body>
          <Card.Title>Transfer</Card.Title>
          <Stack gap={2}>
            <Form>
                <Form.Group className="mb-3" controlId="trasnferFrom">
                    <Form.Label>From</Form.Label>
                    <Form.Control 
                        type="username"
                        placeholder={loggedInAccount.data.username} 
                        onChange= {(e) => setFrom(e.target.value)}
                        value={from}
                        />
                </Form.Group>
                <Form.Group className="mb-3" controlId="trasnferTo">
                    <Form.Label>To</Form.Label>
                    <Form.Control 
                        type="username" 
                        onChange= {(e) => setTo(e.target.value)}
                        />
                </Form.Group>
                <Form.Group className="mb-3" controlId="transferAmount">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control 
                        type="text" 
                        onChange= {(e) => setAmount(e.target.value)}
                        />
                </Form.Group>
                <Form.Group className="mb-3" controlId="transferMemo">
                <Form.Label>Memo</Form.Label>
                <Form.Control 
                    as="textarea" 
                    rows={3} 
                    onChange= {(e) => setMemo(e.target.value)}
                    />
                </Form.Group>
            </Form>
          </Stack>
          <Button className='pull-right' variant="success" onClick={() => handleSendOnclick()}>Send</Button>{' '}
          <br/>
          <br/>

        </Card.Body>
      </Container>
    </Card>
    )
}

export default Transfer
