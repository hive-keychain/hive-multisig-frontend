import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Button, Card, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import * as yup from 'yup';
import { SignResponseType } from "../../../interfaces";


const AccountWitnessProxCard: React.FC<{}> = () =>{
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    const [accountUsername, setAccountUsername] = useState<string>(loggedInAccount.data.username);
    const [proxyUsername, setProxyUsername] = useState<string>('');

    useEffect(()=>{
        console.log("Dispatch here!")
        console.log(accountUsername,proxyUsername)
    },[accountUsername,proxyUsername])

    const schema = yup.object().shape({
        account: yup.string().required("Required"),
        proxy: yup.string().required("Required")
    })

    return (
        <Formik
        validationSchema={schema}
        onSubmit={
            values => {
                setAccountUsername(values.account);
                setProxyUsername(values.proxy);
            }
        }
        initialValues={{
            account:accountUsername,
            proxy:proxyUsername
        }}
        >
            {(
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
                        <Card.Title>Choose Proxy</Card.Title>
                        <Form 
                        noValidate
                        onSubmit={handleSubmit}>
                            <Row className='mb-3'>
                                <Form.Group controlId="proxyValidation1">
                                <Form.Label>Account</Form.Label>
                                <InputGroup hasValidation>
                                <InputGroup.Text>@</InputGroup.Text>
                                <Form.Control
                                type="text"
                                name="account"
                                placeholder="Username"
                                value={String(values.account)}
                                onChange={handleChange}
                                isInvalid={touched.account && !!errors.account}
                                />
                                <Form.Control.Feedback type='invalid'>
                                    {String(errors.account)}
                                </Form.Control.Feedback>
                                </InputGroup>
                                </Form.Group>
                            </Row>
                            <Row className='mb-3'>
                                <Form.Group controlId="proxyValidation2">
                                <Form.Label>Proxy</Form.Label>
                                <InputGroup hasValidation>
                                <InputGroup.Text>@</InputGroup.Text>
                                <Form.Control
                                type="text"
                                name="proxy"
                                placeholder="Username"
                                value={String(values.proxy)}
                                onChange={handleChange}
                                isInvalid={touched.proxy && !!errors.proxy}
                                />
                                <Form.Control.Feedback type='invalid'>
                                    {String(errors.proxy)}
                                </Form.Control.Feedback>
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

export default AccountWitnessProxCard;