import { Formik } from "formik";
import { Button, Card, Container, Form } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import * as yup from 'yup';
import { SignResponseType } from "../../../interfaces";
import { InputRow } from "./InputRow";

const DepositToSavingsCard: React.FC<{}> = () =>{
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    
    const schema = yup.object().shape({
        from: yup.string().required("Required"),
        to: yup.string().required("Required"),
        memo: yup.string(),
        amount:  yup.number()
        .typeError('Must be a number')
        .positive("Must be more than 0")
        .required("Required"),
        request_id: yup.number()
    })
    return (
        <Formik
            validationSchema={schema}
            onSubmit={
                values =>
                { 
                    console.log(values)
                    console.log("Dispatch here")
                }}
            initialValues={{
                amount: 0,
                from: loggedInAccount.data.username,
                memo: '',
                request_id: 0,
                to: '',
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