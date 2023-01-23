import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Button, Card, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import * as yup from 'yup';
import { SignResponseType } from "../../../interfaces";


const VoteForWitnessCard: React.FC<{}> = () =>{
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    const [accountUsername, setAccountUsername] = useState<string>('')
    const [approval,setApproval] = useState<boolean>(false)
    const [witnessString, setWitnessString] = useState<string>('')

    useEffect(()=>{
        console.log("Dispatch here")
        console.log(accountUsername,approval,witnessString)
    },[accountUsername,approval,witnessString])

    const schema = yup.object().shape({
        account: yup.string().required("Required"),
        witness: yup.string().required("Required"),
        approve: yup.bool().required("Required")
    })
    return (
        <Formik
        validationSchema={schema}
        onSubmit={
            values => {
                setAccountUsername(values.account);
                setApproval(values.approve);
                setWitnessString(values.witness)
            }
        }
        initialValues={{
            account:accountUsername,
            witness:witnessString,
            approve:approval
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
                                <Form.Group controlId="witnessValidation1">
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
                                        <Form.Control.Feedback type="invalid">
                                            {String(errors.account)}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                            </Row>

                            <Row className='mb-3'>
                                <Form.Group controlId="witnessValidation2">
                                    <Form.Label>Witness</Form.Label>
                                    <InputGroup hasValidation>
                                        <InputGroup.Text>@</InputGroup.Text>
                                        <Form.Control
                                        type="text"
                                        name="witness"
                                        placeholder="Username"
                                        value={String(values.witness)}
                                        onChange={handleChange}
                                        isInvalid={touched.witness && !!errors.witness}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {String(errors.witness)}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                            </Row>

                            <Row className='mb-3'>
                                <Form.Group>
                                <Form.Label>Approval</Form.Label>
                                    <Form.Check 
                                    type='checkbox'
                                    label='Approve'
                                    name='approve'
                                    id='approve'
                                    onChange={handleChange}                           
                                    />
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
export default VoteForWitnessCard;