
import { Formik } from 'formik';
import { useState } from 'react';
import { Button, Card, Container, Form, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { AddArrayFieldType } from './AddArrayField';
import { FieldArrayCard } from './FieldArrayCard';
import { InputRow } from './InputRow';

function BroadcastJson() {
    const [newAuth, setNewAuth] = useState<string>('')
    const [newPostingAuth, setNewPostingAuth] = useState<string>('')
    const schema = yup.object().shape({
        id: yup.string()
        .required('Required').max(32, 'ID string must be less than 32 characters long'),
        json: yup.string().required("Required"),
        required_auths: yup.array().required("Required").min(1, 'Minimum of 1 Authority'),
        required_posting_auths: yup.array().required("Required").min(1, 'Minimum of 1 Posting Authority')
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
                required_auths: [],
                required_posting_auths: [],
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
                <InputRow 
                    rowKey="id"
                    label="ID"
                    rowName="id"
                    type="text"
                    placeholder=""
                    value={values.id}
                    onChangeFunc={handleChange}
                    invalidFlag = {touched.id && !!errors.id}
                    error = {errors.id}
                />
            </Form.Group>
                </Row>
                <Row className='mb-3'>
                    <FieldArrayCard 
                        key='authsCard'
                        name='required_auths'
                        label='Required Authorities'
                        error={typeof errors.required_auths==='string'?String(errors.required_auths):""}
                        addArrayFieldProps={authAddArrayProps}
                    />
                  
                </Row>
                <Row className='mb-3'>
                    <FieldArrayCard 
                        key='postingAuthsCard'
                        name='required_posting_auths'
                        label='Required Posting Authorities'
                        error={typeof errors.required_posting_auths==='string'?String(errors.required_posting_auths):""}
                        addArrayFieldProps={posintAuthAddArrayProps}
                    />
                </Row>
                <InputRow 
                    rowKey="json"
                    label="JSON"
                    rowName="json"
                    type="textarea"
                    as="textarea"
                    placeholder=""
                    value={values.json}
                    onChangeFunc={handleChange}
                    invalidFlag = {touched.json && !!errors.json}
                    error = {errors.json}
                />
                
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
