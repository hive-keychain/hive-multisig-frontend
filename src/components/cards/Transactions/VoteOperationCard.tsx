import { Formik } from "formik";
import { Button, Card, Container, Form } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import * as yup from 'yup';
import { SignResponseType } from "../../../interfaces";
import { InputRow } from "./InputRow";

export const VoteOperationCard = () =>{
    const loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');

    const schema =  yup.object().shape({
        author: yup.string().required('Required'),
        permalink: yup.string().required('Required'),
        voter: yup.string().required('Required'),
        weight: yup.number()
        .typeError('Must be a number')
        .positive('Must be more than 0')
        .required('Required')
    })
    return(
        <Formik
        validationSchema={schema}
        onSubmit={
            values => {
                    console.log(values);
                    console.log('Dispatch here');
            }
        }
        initialValues={{
            author: loggedInAccount.data.username,
            permalink:'',
            voter:'',
            weight: ''
        }
        }>
            {
                (
                    {
                        handleSubmit,
                        handleChange,
                        values,
                        touched,
                        errors
                    }
                ) => (
                    <Card border='secondary'>
                    <Container>
                    <Card.Body>
                    <Card.Title>Vote</Card.Title>
                    <Form noValidate onSubmit={handleSubmit}>
                    <InputRow 
                        rowKey="author"
                        prepend="@"
                        label="Author"
                        rowName="author"
                        type="text"
                        placeholder="Username"
                        value={values.author}
                        onChangeFunc={handleChange}
                        invalidFlag = {touched.author && !!errors.author}
                        error = {errors.author}
                    />
                    <InputRow 
                        rowKey="permalink"
                        label="Permalink"
                        rowName="permalink"
                        type="text"
                        placeholder="Permalink"
                        value={values.permalink}
                        onChangeFunc={handleChange}
                        invalidFlag = {touched.permalink && !!errors.permalink}
                        error = {errors.permalink}
                    />
                    <InputRow 
                        rowKey="voter"
                        prepend="@"
                        label="Voter"
                        rowName="voter"
                        type="text"
                        placeholder="Username"
                        value={values.voter}
                        onChangeFunc={handleChange}
                        invalidFlag = {touched.voter && !!errors.voter}
                        error = {errors.voter}
                    />
                    <InputRow 
                        rowKey="weight"
                        label="Weight"
                        rowName="weight"
                        type="text"
                        placeholder="100% = 10000"
                        value={values.weight}
                        onChangeFunc={handleChange}
                        invalidFlag = {touched.weight && !!errors.weight}
                        error = {errors.weight}
                    />
                        <Button type="submit" className='pull-right' variant="success" >Submit</Button>
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