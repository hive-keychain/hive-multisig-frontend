import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Button, Card, Container, Form, InputGroup, Row } from "react-bootstrap";
import * as yup from 'yup';

const PowerDownCard: React.FC<{}> = () => {
    const [accountUsername, setAccountUsername] = useState<string>('');
    const [amount, setAmount] = useState<string>('');

    useEffect(() => {
        console.log("Dispatch here");
        console.log(accountUsername,amount);
    }, [accountUsername,amount])

    const schema = yup.object().shape({
        account: yup.string().required("Required"),
        vestingShare: yup.number()
        .typeError('Must be a number')
        .positive('Must be more than 0')
        .required('Required')
    })
    return (
        <Formik
            validationSchema={schema}
            onSubmit={
                values =>{
                    setAccountUsername(String(values.account));
                    setAmount(String(values.vestingShare));
                }
            }  
            initialValues={{
                account: accountUsername,
                vestingShare: amount,
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
                                            name="account"
                                            placeholder="Username"
                                            value={String(values.account)}
                                            onChange={handleChange}
                                            isInvalid={touched.account && !!errors.account}
                                            />
                                            <Form.Control.Feedback type="invalid">{String(errors.account)}</Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                </Row>
                                
                                <Row  className = "mb-3">
                                    <Form.Group controlId='amountValidation3'>
                                    <Form.Label>Vesting Share</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                        type="text"
                                        name="vestingShare"
                                        value={String(values.vestingShare)}
                                        onChange={handleChange}
                                        isInvalid={touched.vestingShare && !!errors.vestingShare}
                                        />
                                        <Form.Control.Feedback type="invalid">{String(errors.vestingShare)}</Form.Control.Feedback>
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
export default PowerDownCard;