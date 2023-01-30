import { Formik } from "formik";
import { Button, Card, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import * as yup from 'yup';
import { SignResponseType } from "../../../interfaces";

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
                console.log('Dispatch here')
            }
        }
        initialValues={{
            author: loggedInAccount.data.username,
            permalink:'',
            voter:'',
            weight: 0
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
                        <Row className='mb-3'>
                        <Form.Group controlId='fromValidation'>
                            <Form.Label>Author</Form.Label>
                            <InputGroup hasValidation>
                                <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                                <Form.Control
                                type="text"
                                name="author"
                                placeholder="Username"
                                value={String(values.author)}
                                onChange={handleChange}
                                isInvalid={touched.author && !!errors.author}
                                />
                                <Form.Control.Feedback type="invalid">{String(errors.author)}</Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                        </Row>
                        <Row className='mb-3'>
                        <Form.Group controlId='fromValidation'>
                            <Form.Label>Permalink</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                type="text"
                                name="permalink"
                                value={String(values.permalink)}
                                onChange={handleChange}
                                isInvalid={touched.permalink && !!errors.permalink}
                                />
                                <Form.Control.Feedback type="invalid">{String(errors.permalink)}</Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                        </Row>
                        <Row className='mb-3'>
                        <Form.Group controlId='fromValidation'>
                        <Form.Label>Voter</Form.Label>
                        <InputGroup hasValidation>
                            <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                            <Form.Control
                            type="text"
                            name="voter"
                            placeholder="Voter"
                            value={String(values.voter)}
                            onChange={handleChange}
                            isInvalid={touched.voter && !!errors.voter}
                            />
                            <Form.Control.Feedback type="invalid">{String(errors.voter)}</Form.Control.Feedback>
                        </InputGroup>
                        </Form.Group>
                        </Row>
                        <Row className='mb-3'>
                        <Form.Group controlId='fromValidation'>
                            <Form.Label>Weight</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                type="text"
                                name="weight"
                                placeholder="0"
                                value={String(values.weight)}
                                onChange={handleChange}
                                isInvalid={touched.weight && !!errors.weight}
                                />
                                <Form.Control.Feedback type="invalid">{String(errors.weight)}</Form.Control.Feedback>
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