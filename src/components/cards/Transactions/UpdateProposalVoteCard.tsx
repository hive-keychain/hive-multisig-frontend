import { Formik } from "formik";
import { useState } from "react";
import { Button, Card, Container, Form, Row } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import * as yup from 'yup';
import { SignResponseType } from "../../../interfaces";
import { AddArrayFieldType } from "./AddArrayField";
import { FieldArrayCard } from "./FieldArrayCard";
import { InputRow } from "./InputRow";


const UpdateProposalVoteCard: React.FC<{}> = ()=>{
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    const [newProposalId, setNewProposalId] = useState<string>('');
    const addProposalIdBtnHandler = (push:Function) =>{
        if(newProposalId && newProposalId!==''){
            push(newProposalId)
            setNewProposalId('')
        }
    }
    const proposalIDsAddFieldProp:AddArrayFieldType={
        stateValue:newProposalId,
        placeHolder:'Posting Authority',
        setStateFunc:setNewProposalId,
        addButtonHandler:addProposalIdBtnHandler
    }
    const schema = yup.object().shape({
        approve: yup.bool().required("Required"),
        extensions: yup.array(),
        proposal_ids:  yup.array()
        .required("Required")
        .min(1, 'Minimum of 1 Proposal ID'),
        voter: yup.string().required("Required")
    })
    return(
        <Formik
        validationSchema={schema}
        onSubmit={
            values =>
            { 
                console.log(values);
                console.log("Dispatch here");
            }}
        initialValues={{
          approve: false,
          extensions: [],
          proposal_ids: [],
          voter:''
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
                        <Card.Title>Vote for Proposal</Card.Title>
                        <Form 
                         noValidate
                         onSubmit={handleSubmit}>
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
                            <Row className='mb-3'>
                                <FieldArrayCard 
                                    key='proposal_ids'
                                    name='proposal_ids'
                                    label='Proposal IDs'
                                    error={typeof errors.proposal_ids==='string'?String(errors.proposal_ids):""}
                                    addArrayFieldProps={proposalIDsAddFieldProp}
                                />
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

export default UpdateProposalVoteCard;