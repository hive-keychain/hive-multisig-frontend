import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Button, Card, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import * as yup from 'yup';
import { SignResponseType } from "../../../interfaces";

const PowerUpCard: React.FC<{}> = () => {
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    const [powerAmount, setPowerAmount] = useState<string>('')
    const [fromUsername, setFromUsername] = useState<string>(loggedInAccount.data.username);
    const [toUsername, setToUsername] = useState<string>('')
    useEffect(() => {
        console.log("Dispatch here")
        console.log(powerAmount,fromUsername,toUsername);
    },[powerAmount,fromUsername,toUsername])

    const schema = yup.object().shape({
        amount: yup.number()
        .typeError('Must be a number')
        .positive('Must be more than 0')
        .required('Required'),
        from: yup.string().required("Required"),
        to: yup.string().required("Required")
    })
    return (
        <Formik
            validationSchema={schema}
            onSubmit={
                values =>{
                    setPowerAmount(String(values.amount));
                    setFromUsername(String(values.from));
                    setToUsername(String(values.to));
                }
            }  
            initialValues={{
                amount: powerAmount,
                from: fromUsername,
                to: toUsername
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
                                <Card.Title>Power Up</Card.Title>
                                <Form
                                noValidate
                                onSubmit={handleSubmit}
                                >
                                <Row className = "mb-3">
                                    <Form.Group controlId='fromValidation'>
                                        <Form.Label>From</Form.Label>
                                        <InputGroup hasValidation>
                                            <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                                            <Form.Control
                                            type="text"
                                            name="from"
                                            placeholder="Username"
                                            value={String(values.from)}
                                            onChange={handleChange}
                                            isInvalid={touched.from && !!errors.from}
                                            />
                                            <Form.Control.Feedback type="invalid">{String(errors.from)}</Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Row>
                                
                                <Row  className = "mb-3">
                                    <Form.Group controlId='toValidation'>
                                        <Form.Label>To</Form.Label>
                                        <InputGroup hasValidation>
                                            <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                                            <Form.Control
                                            type="text"
                                            name="to"
                                            placeholder="Username"
                                            value={String(values.to)}
                                            onChange={handleChange}
                                            isInvalid={touched.to && !!errors.to}
                                            />
                                            <Form.Control.Feedback type="invalid">{String(errors.to)}</Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Row>

                                <Row  className = "mb-3">
                                    <Form.Group controlId='amountValidation3'>
                                    <Form.Label>Amount</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                        type="text"
                                        name="amount"
                                        value={String(values.amount)}
                                        onChange={handleChange}
                                        isInvalid={touched.amount && !!errors.amount}
                                        />
                                        <Form.Control.Feedback type="invalid">{String(errors.amount)}</Form.Control.Feedback>
                                    </InputGroup>
                                    </Form.Group>
                                </Row>
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

export default PowerUpCard;