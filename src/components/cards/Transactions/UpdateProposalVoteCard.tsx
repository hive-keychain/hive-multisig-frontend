import { Formik } from "formik";
import { ReactNode, useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import * as yup from 'yup';
import { SignResponseType } from "../../../interfaces";
import { useDidMountEffect } from "../../../utils/utils";

interface IExtensionRowProps {
    extension:string
    handleDelete:Function
}
interface IAddExtensionRowProps{
    handleAdd:Function
}

interface IProposalIDsRowProps{
    proposalId:string
    handleDelete:Function
}
interface IAddProposalIdRowProps{
    handleAdd:Function
}
const ExtensionRow: React.FC<IExtensionRowProps> = ({extension, handleDelete}) => {
    return(
        <Row className="mb-3">
            <Col >
            <InputGroup hasValidation>
                <InputGroup.Text>@</InputGroup.Text>
                <Form.Control
                className='gray-input-outline'
                value={String(extension)}
                readOnly
                />
                </InputGroup>
            </Col>
            <Col > 
                <Button
                variant="outline-danger"
                onClick={() => {
                  handleDelete(extension);
                }}>
                  Delete
              </Button>
            </Col>
        </Row>
    )
}

const AddExtensionRow: React.FC<IAddExtensionRowProps> = ({handleAdd}) =>{
    const[extensionString, setExtensionString] = useState<string>('')
    
    const onAddBtnClicked = () =>{
        if(extensionString && extensionString!==''){
            handleAdd(extensionString);
            setExtensionString('');
        }
    }
    return(
      
        <Row className="mb-3">
            <Col >
            <InputGroup hasValidation>
                <InputGroup.Text>@</InputGroup.Text>
                <Form.Control
                className='gray-input-outline'
                type='text'
                placeholder='Username'
                value={extensionString}
                onChange={(e) => {setExtensionString(e.target.value)}}
                />
            </InputGroup>
            </Col>
            <Col > 
                <Button
                variant="success"
                onClick={ () => {onAddBtnClicked()}}
                >
                Add
                </Button>
            </Col>  
        </Row>
                  
    )
}

const ProposalIDRow: React.FC<IProposalIDsRowProps> = ({proposalId,handleDelete}) => {
   
    return(
        <Row className="mb-3">
            <Col >
            <InputGroup hasValidation>
                <Form.Control
                className='gray-input-outline'
                value={String(proposalId)}
                readOnly
                />
                </InputGroup>
            </Col>
            <Col > 
                <Button
                variant="outline-danger"
                onClick={() => {
                  handleDelete(proposalId);
                }}>
                  Delete
              </Button>
            </Col>
        </Row>
    )
}

const AddProposalIDRow: React.FC<IAddProposalIdRowProps> = ({handleAdd}) =>{
    const [input, setInput] = useState('')
    const onAddBtnClicked = ()=>{
        if(input && input!==''){
            handleAdd(input)
            setInput('')
        }
    }
    return (
        <Row className="mb-3">
        <Col >
        <InputGroup hasValidation>
            <Form.Control
            className='gray-input-outline'
            type='text'
            placeholder='Proposal ID'
            value={input}
            onChange={(e) => {setInput(e.target.value.replace(/[^\d.-]/g, ''))}}
            />
        </InputGroup>
        </Col>
        <Col > 
            <Button
            variant="success"
            onClick={ () => {onAddBtnClicked()}}
            >
            Add
            </Button>
        </Col>  
    </Row>
    )
}
interface errors {
    extensions: string,
    proposal_id: string,
    voter: string,
}
const UpdateProposalVoteCard: React.FC<{}> = ()=>{
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
    const [approval,setApproval] = useState<boolean>(false)
    const [extensionList, setExtensionList] = useState<string[]>([])
    const [proposalIdList, setProposalIdList] = useState<string[]>([])
    const [voterUsername, setVoterUsername] = useState<string>(loggedInAccount.data.username)
    const [extensionRows, setExtensionRows] = useState<ReactNode[]>()
    const [proposalIdRows, setProposalIdRows] = useState<ReactNode[]>()
    const [inputErrors, setErrors] = useState<errors>({extensions:'', proposal_id:'',voter:''})
    const [submissionFlag, setSubmissionFlag] = useState<boolean>(false);
   
    useEffect(()=>{
        if(submissionFlag){
            console.log("Dispatch here");
        }
    },[submissionFlag])
    useEffect(()=>{
        console.log(inputErrors)
        if(inputErrors.extensions === '' && inputErrors.proposal_id === '' && inputErrors.voter ===''){
            setSubmissionFlag(true);
        }else{
            setSubmissionFlag(false);
        }
    },[inputErrors])
    const checkErrors = () =>{
       extensionRowsError();
       proposalIdRowsError();
       votersError();
        
    }
    const extensionRowsError = ()=>{
        if(!checkExtensionList()){
            setErrors((prevState) => {
               return ({
                ...prevState,
                extensions:'Provite at least one extension'
               })
            })
        }else{
            setErrors((prevState) => {
                return ({
                 ...prevState,
                 extensions:''
                })
             })
        }
    }
    const proposalIdRowsError = () => {
        if(!checkProposalIdList()){
            setErrors((prevState) => {
                return ({
                    ...prevState,
                    proposal_id:'Provide at least one proposal id'
                })
            })
        }else{
            setErrors((prevState) => {
                return ({
                    ...prevState,
                    proposal_id:''
                })
            })
        }
    }
    const votersError = () => {
        if(!voterUsername || voterUsername===''){
            setErrors((prevState) => {
                return ({
                    ...prevState,
                    voter:'Provide Voter'
                })
            })
        }else{
            setErrors((prevState) => {
                return ({
                    ...prevState,
                    voter:''
                })
            })
        }
    }

    const checkExtensionList = ():boolean =>{
       return extensionList && extensionList.length >0;
    }
    const checkProposalIdList = ():boolean =>{
        return proposalIdList && proposalIdList.length>0;
    }
    const handleDeleteExtension = (ext:string)=>{
       const index = extensionList.indexOf(ext);
       if(index!==-1){
           const newList = [...extensionList.slice(0,index),...extensionList.slice(index+1)];
           setExtensionList([...newList]);
       }
    }
    const handleDeleteProposalId = (id:string) => {
        const index = proposalIdList.indexOf(id);
        if(index!==-1){
            const newList = [...proposalIdList.slice(0,index), ...proposalIdList.slice(index+1)];
            setProposalIdList([...newList]);
        }
    }
    useDidMountEffect(()=>{
        if(extensionRows.length>0){
            extensionRowsError();
        }
    },[extensionRows])
    useDidMountEffect(()=>{
        if(proposalIdRows.length>0){
            proposalIdRowsError();
        }
    },[proposalIdRows])
    useEffect(()=>{
        const extRows =   extensionList.map((ext:string):ReactNode=>{
            return <ExtensionRow key={ext} extension={ext} handleDelete={handleDeleteExtension}/>
        })
        setExtensionRows([...extRows]);
    },[extensionList])

    useEffect(()=>{
        const newRows = proposalIdList.map((id:string):ReactNode=>{
            return <ProposalIDRow key={id} proposalId={id} handleDelete={handleDeleteProposalId}/>
        })
        setProposalIdRows([...newRows])
    },[proposalIdList])

    const schema = yup.object().shape({
        voter:  yup.string().required("Required"),
        approve: yup.bool()
    })

    return(
    <Formik
    validationSchema={schema}
    onSubmit={ 
        (values) => {
            setVoterUsername(values.voter);
            setApproval(values.approve);
            checkErrors();
        }
    }
    
    initialValues={{
        voter:voterUsername,
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
                <Card border="secondary">
                    <Container>
                    <Card.Body>
                    <Card.Title>Vote for Proposal</Card.Title>
                    <Form
                    noValidate
                    onSubmit={handleSubmit}>
                          <Row className='mb-3'>
                                <Form.Group controlId="voteValidation1">
                                    <Form.Label>Voter</Form.Label>
                                    <InputGroup hasValidation>
                                        <InputGroup.Text>@</InputGroup.Text>
                                        <Form.Control
                                        type="text"
                                        name="voter"
                                        placeholder="Username"
                                        value={String(values.voter)}
                                        onChange={handleChange}
                                        isInvalid={touched.voter && !!errors.voter}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {String(errors.voter)}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                            </Row>

                            <Form.Label>Extensions</Form.Label>
                            <Card>
                                <Card.Body>
                                <Form.Group controlId="voteValidation2">
                                {extensionRows}
                                    <AddExtensionRow handleAdd={(ext:string) => {
                                        if(!extensionList.includes(ext)){
                                            setExtensionList([...extensionList,ext])
                                        }
                                        }}/>
                                </Form.Group>
                                {inputErrors.extensions && inputErrors.extensions!==''?<div style={{ color: 'red' }}>{inputErrors.extensions}</div>:null}

                            </Card.Body>
                            </Card>
                            <br/>
                            <Form.Label>Proposal IDs</Form.Label>
                            <Card>
                                <Card.Body>
                                <Form.Group controlId="voteValidation3">
                                    {proposalIdRows}
                                    <AddProposalIDRow handleAdd={(id:string) => {
                                        if(!proposalIdList.includes(id)){
                                            setProposalIdList([...proposalIdList,id])
                                        }
                                    }}/>
                                </Form.Group>
                                {inputErrors.proposal_id && inputErrors.proposal_id!==''?<div style={{ color: 'red' }}>{inputErrors.proposal_id}</div>:null}
                            </Card.Body>
                            </Card>
                            <br/>
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
            )
        }
    </Formik>
    )
}

export default UpdateProposalVoteCard;