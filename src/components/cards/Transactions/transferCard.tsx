import * as Hive from '@hiveio/dhive';
import { Formik } from "formik";
import { useState } from 'react';
import { Button, Card, Container, Form } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import * as yup from 'yup';
import { SignResponseType } from "../../../interfaces";
import { InputRow } from "./InputRow";
function Transfer() {
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    const [transfer, setTransfer] = useState<Hive.TransferOperation>();
    
    
    const schema = yup.object().shape({
        amount: yup.number()
        .typeError('Must be a number')
        .positive('Must be more than 0')
        .required('Required'),
        from: yup.string().required('Required'),
        memo: yup.string().required('Required'),
        to: yup.string().required('Required')
    })
    return(
        <Formik
        validationSchema={schema}
        onSubmit={
            (values) => {
                
                console.log(values)
                console.log('Dispatch Here')

            }
        }
        initialValues={{
            amount: 0,
            from: loggedInAccount.data.username,
            memo: '',
            to: ''
        }}
        >{(
            {
                handleSubmit,
                handleChange,
                values,
                touched,
                errors,
            }
        )=>(
            <Card border='secondary'>
            <Container>
            <Card.Body>
            <Card.Title>Transfer Operation</Card.Title>
            <Form
            noValidate
            onSubmit={handleSubmit}>
                <InputRow 
                    rowKey="from"
                    prepend="@"
                    label="From"
                    rowName="from"
                    type="text"
                    placeholder="Username"
                    value={values.from}
                    onChangeFunc={handleChange}
                    invalidFlag = {touched.from && !!errors.from}
                    error = {errors.from}
                />
                <InputRow 
                    rowKey="to"
                    prepend="@"
                    label="To"
                    rowName="to"
                    type="text"
                    placeholder="Username"
                    value={values.to}
                    onChangeFunc={handleChange}
                    invalidFlag = {touched.to && !!errors.to}
                    error = {errors.to}
                />
                <InputRow 
                    rowKey="amount"
                    label="Amount"
                    rowName="amount"
                    type="text"
                    placeholder="0"
                    value={values.amount}
                    onChangeFunc={handleChange}
                    invalidFlag = {touched.amount && !!errors.amount}
                    error = {errors.amount}
                />
                <InputRow 
                    rowKey="memo"
                    label="Memo"
                    rowName="memo"
                    type="textarea"
                    as="textarea"
                    placeholder=""
                    value={values.memo}
                    onChangeFunc={handleChange}
                    invalidFlag = {touched.memo && !!errors.memo}
                    error = {errors.memo}
                />
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

export default Transfer
