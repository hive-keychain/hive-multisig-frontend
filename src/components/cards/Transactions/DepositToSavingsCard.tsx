import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Button, Card, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import * as yup from 'yup';
import { SignResponseType } from "../../../interfaces";

const DepositToSavingsCard: React.FC<{}> = () =>{
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    const [savingsAmount, setSavingsAmount] = useState<string>('');
    const [fromUsername, setFromUsername] = useState<string>(loggedInAccount.data.username);
    const [memoString, setMemoString] = useState<string>('');
    const [reqId, setReqId] = useState<number>(0);
    const [toUsername, setToUsername] = useState<string>('');

    useEffect(() => {
        console.log("Dispatch here");
        console.log("TODO: generate request ID")
        console.log(savingsAmount,fromUsername,memoString,reqId,toUsername)
    },[savingsAmount,fromUsername,memoString,reqId,toUsername])

    const schema = yup.object().shape({
        from: yup.string().required("Required"),
        to: yup.string().required("Required"),
        memo: yup.string(),
        amount:  yup.number()
        .typeError('Must be a number')
        .positive("Must be more than 0")
        .required("Required")
    })
    return (
        <Formik
            validationSchema={schema}
            onSubmit={
                values =>
                { 
                    const memo= makeMemo(values.memo);
                    setFromUsername(values.from);
                    setToUsername(values.to);
                    setMemoString(memo);
                    setSavingsAmount(values.amount);
                }}
            initialValues={{
                from: fromUsername,
                to: toUsername,
                memo: memoString,
                amount: savingsAmount,
            }}
            >
                {
                    (
                        {
                            handleSubmit,
                            handleChange,
                            values,
                            touched,
                            errors,
                        }
                    ) => (


                    <Card border='secondary'>
                    <Container>
                            <Card.Body>
                            <Card.Title>Deposit to Savings</Card.Title>
                            <Form 
                             noValidate
                             onSubmit={handleSubmit}>
                                <Row className='mb-3'>
                                    <Form.Group controlId='savingsValidation1'>
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
                                    <Form.Group controlId='savingsValidation2'>
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
                                    <Form.Group controlId='savingsValidation3'>
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

                                <Row>
                                    <Form.Group controlId='savingsValidation4'>
                                        <Form.Label>Memo</Form.Label>
                                        <InputGroup>
                                        <Form.Control 
                                        as="textarea" 
                                        aria-label="With textarea" 
                                        name="memo"
                                        placeholder="Transaction Note"
                                        value={String(values.memo)}
                                        onChange={handleChange}
                                        />
                                        </InputGroup>
                                    </Form.Group>
                                </Row>
                                <br/>
                                <Button type="submit" className='pull-right' variant="success" >Submit</Button>
                                <br/>
                                <br/>
                            </Form>
                            </Card.Body>
                    </Container>
                    </Card>
                    )}
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

export default DepositToSavingsCard;