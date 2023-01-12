import { TransferOperation } from "@hiveio/dhive";
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form, Stack } from 'react-bootstrap';
import { useReadLocalStorage } from "usehooks-ts";
import { SignResponseType } from "../../../interfaces";
import { isNumeric } from "../../../utils/utils";
function Transfer() {
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    const [ transferOpObj, setTransferOpObj] = useState<any>();   
    const [from,setFrom] = useState<string>(loggedInAccount.data.username);
    const [to,setTo] = useState<string>('');
    const [amount,setAmount] = useState<string>('');
    const [memo,setMemo] = useState<string>('');
    const [invalidINputList, setInvalidInputList] = useState<string[]>([])
    const [isFromValid, setFromValid] = useState<boolean>();
    const [isToValid, setToValid] = useState<boolean>();
    const [isAmountValid, setAmountValid] = useState<boolean>();
    const [isMemoValid, setMemoValid] = useState<boolean>();
    const [fromText, setFromText] = useState<string>('');
    const [toText, setToText] = useState<string>('');
    const [amountText, setAmountText] = useState<string>('');
    const [memoText, setMemoText] = useState<string>('');
    const [isReadyToSend, setIsReadyToSend] = useState<boolean>(false);

    useEffect(() => {
        if(isReadyToSend){
            console.log("Ready to send!")
        }
    },[isReadyToSend])
    useEffect(()=>{
        if(isFromValid && isToValid && isAmountValid && isMemoValid){
            setIsReadyToSend(true);
        }else{
            setIsReadyToSend(false);
        }
    },[isFromValid,isToValid,isAmountValid,isMemoValid])
    useEffect(() =>{
        setFromValid(!invalidINputList.includes('from'));
        setToValid(!invalidINputList.includes('to'));
        setAmountValid(!invalidINputList.includes('amount'));
        setMemoValid(!invalidINputList.includes('memo'));
    },[invalidINputList]);

    useEffect(()=>{
        if(!isFromValid){
            setFromText('Please enter valid username.')
        }else{
            setFromText('')
        }
    },[isFromValid])
    useEffect(()=>{
        if(!isToValid){
            setToText('Please enter valid username.')
        }else{
            setToText('')
        }
    },[isToValid])
    useEffect(()=>{
        if(!isAmountValid){
            setAmountText('Please enter valid amount.')
        }else{
            setAmountText('')
        }
    },[isAmountValid])
    useEffect(()=>{
        if(!isMemoValid){
            setMemoText('Please enter valid memo.')
        }else{
            setMemoText('')
        }
    },[isMemoValid])


    useEffect(
        ()=>{
        let newList = [...invalidINputList]
        if(transferOpObj){
            (Object.keys(transferOpObj[1]) as (keyof typeof transferOpObj[1])[]).forEach((key:string, index) => {
                const value:string = transferOpObj[1][key]
                if(value || value !== ''){
                    if(key==='amount'){
                        if(!isNumeric(value)){
                            if(!invalidINputList.includes(key)){
                                newList.push(key)
                                setInvalidInputList([...newList]);
                            }
                        }
                        else{
                            const index = newList.indexOf(key);
                            if (index > -1) { 
                                newList.splice(index, 1); 
                                }
                            setInvalidInputList([...newList])
                        }
                    }
                    else{
                        const index = newList.indexOf(key);
                        if (index > -1) { 
                            newList.splice(index, 1); 
                            }
                        setInvalidInputList([...newList])
                    }
                }
                else{
                    if(!invalidINputList.includes(key)){
                        newList.push(key)
                        setInvalidInputList([...newList]);
                    }
                }
            })
        }
              
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
        <Card border='secondary'>
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
                    {!isFromValid?
                    <Form.Text className="text-danger">
                    {fromText}
                    </Form.Text>:''}
                </Form.Group>
                <Form.Group className="mb-3" controlId="trasnferTo">
                    <Form.Label>To</Form.Label>
                    <Form.Control 
                        type="username" 
                        onChange= {(e) => setTo(e.target.value)}
                        />
                    {!isToValid?
                    <Form.Text className="text-danger">
                    {toText}
                    </Form.Text>:''}
                </Form.Group>
                <Form.Group className="mb-3" controlId="transferAmount">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control 
                        type="text" 
                        onChange= {(e) => setAmount(e.target.value)}
                        />
                    {!isAmountValid?
                    <Form.Text className="text-danger">
                    {amountText}
                    </Form.Text>:''}
                </Form.Group>
                <Form.Group className="mb-3" controlId="transferMemo">
                <Form.Label>Memo</Form.Label>
                <Form.Control 
                    as="textarea" 
                    rows={3} 
                    onChange= {(e) => setMemo(e.target.value)}
                    />
                    {!isMemoValid?
                    <Form.Text className="text-danger">
                    {memoText}
                    </Form.Text>:''}
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
