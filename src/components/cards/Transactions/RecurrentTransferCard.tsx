import { Formik } from "formik";
import { ReactNode, useEffect, useState } from "react";
import { Button, Card, Container, Form, InputGroup, Row, Stack } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import * as yup from 'yup';
import { SignResponseType } from "../../../interfaces";
import { useDidMountEffect } from "../../../utils/utils";
import { AddExtensionRow, ExtensionRow } from "./ExtensionRow";

interface errors{
    from:string,
    to:string,
    amount:string,
    executions:string,
    recurrence:string,
    extensions:string,
    
}
const RecurrentTransferCard: React.FC<{}> =()=>{
    const loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    const [amountValue, setAmountValue] = useState<string>('');
    const [executionNum, setExecutionNum] = useState<string>('');
    const [extensionList, setExtensionList] = useState<string[]>([]);
    const [fromUsername,setfromUsername] = useState<string>(loggedInAccount.data.username);
    const [memoString, setMemoString] = useState<string>('');
    const [recurrenceValue, setRecurrenceValue ] = useState<string>('');
    const [toUsername, setToUsername] = useState<string>('');
    const [extensionRows, setExtensionRows] = useState<ReactNode[]>()
    const [inputErrors, setInputErrors] = useState<errors>({
        from:'',
        to:'',
        amount:'',
        executions:'',
        recurrence:'',
        extensions:'',
    })
    const [submissionFlag, setSubmissionFlag] = useState<boolean>(false);
   
    useDidMountEffect(()=>{
        if(submissionFlag===true){
            console.log("Dispatch here");
        }
    },[submissionFlag])
    useDidMountEffect(()=>{
        const err = hasErrors();
        console.log("Has error: ", err, inputErrors);
        if(!err){
            setSubmissionFlag(true);
        }else{
            setSubmissionFlag(false);
        }
    },[inputErrors])

    const hasErrors =  ():boolean => {
        return !(inputErrors.from ==='' &&
                inputErrors.to === '' && 
                inputErrors.amount === '' &&
                inputErrors.executions === '' &&
                inputErrors.recurrence === '' &&
                inputErrors.extensions == ''
                ) 
    }
   
    const checkErrors = () =>{
        fromError();
        toError();
        amountError();
        executionsError();
        recurrenceError();
        extensionRowsError();
     }
     const fromError = () =>{
        if(!fromUsername || fromUsername===''){
            setInputErrors((prevState) => {
                return({
                    ...prevState,
                    from: 'Provide username'
                })
            })
        }
        else{
            setInputErrors((prevState) => {
                return({
                    ...prevState,
                    from: ''
                })
            })
        }
     }
     const toError = () =>{
        if(!toUsername || toUsername===''){
            setInputErrors((prevState) => {
                return({
                    ...prevState,
                    to:'Provide username'
                })
            })
        }else{
            setInputErrors((prevState) => {
                return({
                    ...prevState,
                    to:''
                })
            })
        }
     }
     const amountError = () =>{
        if(!amountValue || amountValue===''){
            setInputErrors((prevState) => {
                return({
                    ...prevState,
                    amount:'Provide amount'
                })
            })
        }else{
            setInputErrors((prevState) => {
                return({
                    ...prevState,
                    amount:''
                })
            })
        }
     }
     const executionsError = () =>{
        if(!executionNum || executionNum===''){
            setInputErrors((prevState) => {
                return({
                    ...prevState,
                    executions:'Provide number of executions'
                })
            })
        }else{
            setInputErrors((prevState) => {
                return({
                    ...prevState,
                    executions:''
                })
            })
        }
     }
     const recurrenceError = () =>{
        if(!recurrenceValue || recurrenceValue===''){
            setInputErrors((prevState) => {
                return({
                    ...prevState,
                    recurrence:'Provide number of recurrence'
                })
            })
        }else{
            setInputErrors((prevState) => {
                return({
                    ...prevState,
                    recurrence:''
                })
            })
        }
     }
     const extensionRowsError = ()=>{
        if(!checkExtensionList()){
            setInputErrors((prevState) => {
               return ({
                ...prevState,               
                extensions:'Provide at least one extension'
               })
            })
        }else{

            setInputErrors((prevState) => {
                return ({
                 ...prevState,
                 extensions:''
                })
             })
        }
    }

    const checkExtensionList = ():boolean =>{
        return extensionList && extensionList.length >0;
     }
    
    const handleDeleteExtension = (ext:string)=>{
        const index = extensionList.indexOf(ext);
        if(index!==-1){
            const newList = [...extensionList.slice(0,index),...extensionList.slice(index+1)];
            setExtensionList([...newList]);
        }
     }
     useDidMountEffect(()=>{
        if(extensionRows.length>0){
            checkErrors();
        }
    },[extensionRows])
    useEffect(()=>{
        const extRows =   extensionList.map((ext:string):ReactNode=>{
            return <ExtensionRow key={ext} extension={ext} handleDelete={handleDeleteExtension}/>
        })
        setExtensionRows([...extRows]);
    },[extensionList])
    const schema = yup.object().shape({
        from: yup.string().required('Required'),
        to: yup.string().required('Required'),
        //extensions
        amount: yup.number()
        .typeError('Must be a number')
        .positive("Must be more than 0")
        .required("Required"),
        executions: yup.number()
        .typeError('Must be a number')
        .positive("Must be more than 0")
        .required("Required"),
        recurrence: yup.number()
        .typeError('Must be a number')
        .positive("Must be more than 0")
        .required("Required"),
        memo: yup.string(),
    })
    return (
        <Formik
        validationSchema = {schema}
        onSubmit={
            (values) => {
                setfromUsername(values.from);
                setToUsername(values.to);
                setAmountValue(values.amount);
                setExecutionNum(values.executions);
                setRecurrenceValue(values.recurrence);
                const memo= makeMemo(values.memo);
                setMemoString(memo);
            }
        }
        initialValues={{
            from:fromUsername,
            to:toUsername,
            amount:amountValue,
            executions:executionNum,
            recurrence:recurrenceValue,
            memo:memoString
        }}
        >
            {
                ({
                    handleSubmit,
                    handleChange,
                    values,
                    touched,
                    errors,

                }) => (
                    
                    <Card border='secondary'>
                        <Container>
                            <Card.Body>
                                <Card.Title>Reurrent Transfer</Card.Title>
                                <Form
                                noValidate
                                onSubmit={handleSubmit}>
                                    <Row className='mb-3'>
                                    <Form.Group>
                                    <Form.Label>From</Form.Label>
                                    <InputGroup hasValidation>
                                        <InputGroup.Text>@</InputGroup.Text>
                                        <Form.Control
                                        type="text"
                                        name="from"
                                        placeholder="Username"
                                        value={String(values.from)}
                                        onChange={handleChange}
                                        isInvalid={touched.from && !!errors.from}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {String(errors.from)}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                    </Form.Group>
                                    </Row>
                                    <Row className='mb-3'>
                                    <Form.Group>
                                    <Form.Label>To</Form.Label>
                                    <InputGroup hasValidation>
                                        <InputGroup.Text>@</InputGroup.Text>
                                        <Form.Control
                                        type="text"
                                        name="to"
                                        placeholder="Username"
                                        value={String(values.to)}
                                        onChange={handleChange}
                                        isInvalid={touched.to && !!errors.to}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {String(errors.to)}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                    </Form.Group>
                                    </Row>

                                    <Row className='mb-3'>
                                    <Form.Group>
                                    <Form.Label>Amount</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                        type="text"
                                        name="amount"
                                        placeholder="0"
                                        value={String(values.amount)}
                                        onChange={handleChange}
                                        isInvalid={touched.amount && !!errors.amount}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {String(errors.amount)}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                    </Form.Group>
                                    </Row>
                                    <Row className='mb-3'>
                                    <Form.Group>
                                    <Form.Label>Executions</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                        type="text"
                                        name="executions"
                                        placeholder="0"
                                        value={String(values.executions)}
                                        onChange={handleChange}
                                        isInvalid={touched.executions && !!errors.executions}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {String(errors.executions)}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                    </Form.Group>
                                    </Row>
                                    <Row className='mb-3'>
                                    <Form.Group>
                                    <Form.Label>Recurrence</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                        type="text"
                                        name="recurrence"
                                        placeholder="0"
                                        value={String(values.recurrence)}
                                        onChange={handleChange}
                                        isInvalid={touched.recurrence && !!errors.recurrence}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {String(errors.recurrence)}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                    </Form.Group>
                                    </Row>
                                    <Form.Label>Extensions</Form.Label>
                                    <Card border={inputErrors.extensions && inputErrors.extensions!==''? 'danger':'secondary'}>
                                        <Card.Body>
                                        <Form.Group>
                                        <Stack direction='vertical' gap={3}>
                                            {extensionRows}
                                            <AddExtensionRow  handleAdd={(ext:string) => {
                                                if(!extensionList.includes(ext)){
                                                    setExtensionList([...extensionList,ext])
                                                }
                                            }}/>
                                        </Stack>
                                        </Form.Group>
                                        {inputErrors.extensions && inputErrors.extensions!==''?<div style={{ color: 'red' }}>{inputErrors.extensions}</div>:null}
                                    </Card.Body>
                                    </Card>
                                    <br/>
                                    <Row>
                                    <Form.Group >
                                        <Form.Label>Memo</Form.Label>
                                        <InputGroup>
                                        <Form.Control 
                                        as="textarea" 
                                        aria-label="With textarea" 
                                        name="memo"
                                        placeholder="Transaction Note (Optional)"
                                        value={String(values.memo)}
                                        onChange={handleChange}
                                        />
                                        </InputGroup>
                                    </Form.Group>
                                </Row>
                                <br/>
                                <Button key='submitFormBtn' type="submit" className='pull-right' variant="success" onClick={() => checkErrors()}>Submit</Button>
                                <br/>
                                <br/>

                                </Form>
                            </Card.Body>
                        </Container>
                    </Card>
                )
            }
        </Formik>
    )
}

const makeMemo = (userMemo:string=''):string => {
    const memo = `
        Operation: transfer_to_savings;
        Date:${Date.now()};
        UserMemo:${userMemo};
    `
    return memo;
}

export default RecurrentTransferCard;