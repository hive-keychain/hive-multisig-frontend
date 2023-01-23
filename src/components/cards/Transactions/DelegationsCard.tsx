import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { SignResponseType } from '../../../interfaces';


const DelegationsCard: React.FC<{}> = () => {
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    const [delegateUsername,setDelegateUsername] = useState<string>(loggedInAccount.data.username);
    const [delegatorUsername,setDelegatorUsername] = useState<string>('');
    const [vestingShares,setVestingShares] = useState<string>('');
   
    useEffect(()=>{
        console.log("Dispatch here")
        console.log(delegateUsername,delegatorUsername,vestingShares);
    },[delegateUsername,delegatorUsername,vestingShares])


    const schema = yup.object().shape({
        delegate: yup.string().required('Required'),
        delegator: yup.string().required('Required'),
        shares: yup.number()
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
                    setDelegateUsername(String(values.delegate));
                    setDelegatorUsername(String(values.delegator));
                    setVestingShares(String(values.shares));
                }}
            initialValues={{
                delegate: delegateUsername,
                delegator: delegatorUsername,
                shares: vestingShares
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
                            <Card.Title>Delegation</Card.Title>
                                <Form 
                                noValidate
                                onSubmit={handleSubmit}
                                >
                                <Row className="mb-3">
                                    <Form.Group controlId='delagateValidation1'>
                                    <Form.Label>Delegate</Form.Label>
                                    <InputGroup hasValidation>
                                        <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                                        <Form.Control
                                        type="text"
                                        name="delegate"
                                        placeholder="Username"
                                        value={String(values.delegate)}
                                        onChange={handleChange}
                                        isInvalid={touched.delegate && !!errors.delegate}
                                        />
                                        <Form.Control.Feedback type="invalid">{String(errors.delegate)}</Form.Control.Feedback>
                                    </InputGroup>
                                    </Form.Group>
                                </Row>

                                <Row className="mb-3">
                                    <Form.Group controlId='delegateValidation2'>
                                    <Form.Label>Delegator</Form.Label>
                                    <InputGroup hasValidation>
                                        <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                                        <Form.Control
                                        type="text"
                                        name="delegator"
                                        placeholder="Username"
                                        value={String(values.delegator)}
                                        onChange={handleChange}
                                        isInvalid={touched.delegator && !!errors.delegator}
                                        />
                                        <Form.Control.Feedback type="invalid">{String(errors.delegator)}</Form.Control.Feedback>
                                    </InputGroup>
                                    </Form.Group>
                                </Row>

                                <Row className="mb-3">
                                    <Form.Group controlId='delegateValidation3'>
                                    <Form.Label>Vesting Shares</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                        type="text"
                                        name="shares"
                                        value={String(values.shares)}
                                        onChange={handleChange}
                                        isInvalid={touched.shares && !!errors.shares}
                                        />
                                        <Form.Control.Feedback type="invalid">{String(errors.shares)}</Form.Control.Feedback>
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

        
    );
}

export default DelegationsCard;
