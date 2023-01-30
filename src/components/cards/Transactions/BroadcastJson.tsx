
import { Formik } from 'formik';
import { useState } from 'react';
import { Button, Card, Container, Form, InputGroup, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { AddArrayFieldType } from './AddArrayField';
import { FieldArrayCard } from './FieldArrayCard';

function BroadcastJson() {
    const [newAuth, setNewAuth] = useState<string>('')
    const [newPostingAuth, setNewPostingAuth] = useState<string>('')
    const schema = yup.object().shape({
        id: yup.number()
        .typeError('Must be a number')
        .positive('Must be more than 0')
        .required('Required'),
        json: yup.string().required("Required"),
        auths: yup.array().required("Required").min(1, 'Minimum of 1 Authority'),
        posting_auths: yup.array().required("Required").min(1, 'Minimum of 1 Posting Authority')

    })
    const addAuthBtnClicked = (push:Function) =>{
        if(newAuth && newAuth!==''){
            push(newAuth)
            setNewAuth('')
        }
    }
    const addPostingAuthBtnClicked = (push:Function) =>{
        if(newPostingAuth && newPostingAuth!==''){
            push(newPostingAuth)
            setNewPostingAuth('')
        }
    }
    const authAddArrayProps:AddArrayFieldType ={
        stateValue:newAuth,
        placeHolder:'Authority',
        setStateFunc:setNewAuth,
        addButtonHandler:addAuthBtnClicked
    }
    const posintAuthAddArrayProps:AddArrayFieldType={
        stateValue:newPostingAuth,
        placeHolder:'Posting Authority',
        setStateFunc:setNewPostingAuth,
        addButtonHandler:addPostingAuthBtnClicked
    }
    return (
        <Formik
            validationSchema={schema}
            onSubmit={
                (values) =>{
                   console.log(values)
                   console.log('Dispatch Here')
                }
            }  
            initialValues={{
                id:'',
                json: '',
                auths: [],
                posting_auths: [],
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
                <Card.Title>Broadcast JSON</Card.Title>
                <Form
                noValidate
                onSubmit={handleSubmit}>
                <Row className='mb-3'>
                <Form.Group controlId='fromValidation'>
                <Form.Label>ID</Form.Label>
                <InputGroup hasValidation>
                    <Form.Control
                    type="text"
                    name="id"
                    placeholder="ID"
                    value={String(values.id)}
                    onChange={handleChange}
                    isInvalid={touched.id && !!errors.id}
                    />
                    <Form.Control.Feedback type="invalid">{String(errors.id)}</Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
                </Row>
                <Row className='mb-3'>
                    <FieldArrayCard 
                        key='authsCard'
                        name='auths'
                        label='Required Authorities'
                        error={typeof errors.auths==='string'?String(errors.auths):""}
                        addArrayFieldProps={authAddArrayProps}
                    />
                  
                </Row>
                <Row className='mb-3'>
                    <FieldArrayCard 
                        key='postingAuthsCard'
                        name='posting_auths'
                        label='Required Posting Authorities'
                        error={typeof errors.posting_auths==='string'?String(errors.posting_auths):""}
                        addArrayFieldProps={posintAuthAddArrayProps}
                    />
                </Row>
                <Row className='mb-3'>
                    <Form.Group >
                        <Form.Label>JSON</Form.Label>
                        <InputGroup>
                        <Form.Control 
                        as="textarea" 
                        aria-label="With textarea" 
                        name="json"
                        value={String(values.json)}
                        onChange={handleChange}
                        isInvalid={touched.json && !!errors.json}
                        />
                        <Form.Control.Feedback type="invalid">{String(errors.json)}</Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                </Row>
                <br/>
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

export default BroadcastJson
