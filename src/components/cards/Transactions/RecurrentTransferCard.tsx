import { Formik } from "formik";
import { Button, Card, Container, Form } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import * as yup from 'yup';
import { SignResponseType } from "../../../interfaces";
import { InputRow } from "./InputRow";

const RecurrentTransferCard: React.FC<{}> =()=>{
    const loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    const schema = yup.object().shape({
        amount: yup.number()
        .typeError('Must be a number')
        .positive('Must be more than 0')
        .required('Required'),
        executions: yup.number()
        .typeError('Must be a number')
        .positive('Must be more than 0')
        .required('Required'),
        extensions: yup.array(),
        from: yup.string().required('Required'),
        memo: yup.string().required('Required'),
        recurrence:yup.number()
        .typeError('Must be a number')
        .positive('Must be more than 0')
        .required('Required'),
        to: yup.string().required('Required')
    })
    return (
        <Formik
        validationSchema={schema}
        onSubmit={
            (values) => {
                console.log(values)
                console.log("Dispatch here")
            }
        }
        initialValues={{
            amount: 0,
            executions: 1,
            extensions: [],
            from: loggedInAccount.data.username,
            memo: '',
            recurrence: 1,
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
            <Card.Title>Recurrent Transfer</Card.Title>
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
                    rowKey="executions"
                    label="Executions"
                    rowName="executions"
                    type="text"
                    placeholder="0"
                    value={values.executions}
                    onChangeFunc={handleChange}
                    invalidFlag = {touched.executions && !!errors.executions}
                    error = {errors.executions}
                />
                <InputRow 
                    rowKey="recurrence"
                    label="Recurrence"
                    rowName="executions"
                    type="text"
                    placeholder="0"
                    value={values.recurrence}
                    onChangeFunc={handleChange}
                    invalidFlag = {touched.recurrence && !!errors.recurrence}
                    error = {errors.recurrence}
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

const makeMemo = (userMemo:string=''):string => {
    const memo = `
        Operation: transfer_to_savings;
        Date:${Date.now()};
        UserMemo:${userMemo};
    `
    return memo;
}

export default RecurrentTransferCard;