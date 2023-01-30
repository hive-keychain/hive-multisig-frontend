import { Formik } from 'formik';
import { Button, Card, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { SignResponseType } from '../../../interfaces';

interface ICommentOpProp {
    type:string
}
export const CommentOperationCard = ({type}:ICommentOpProp) =>{
    const loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');

    const blogSchema =  yup.object().shape({
        author: yup.string().required('Required'),
        body: yup.string().required('Required'),
        json_metadata: yup.string().required('Required'),
        permalink: yup.string().required('Required'),
        title: yup.string().required('Required')
    })
    const commentSchema = yup.object().shape({
        author: yup.string().required('Required'),
        body: yup.string().required('Required'),
        json_metadata: yup.string().required('Required'),
        parent_author: yup.string().required('Required'),
        parent_permalink: yup.string().required('Required'),
        permalink: yup.string().required('Required'),
        title: yup.string().required('Required')
    })
    return(
       <Formik
        validationSchema={ type ==='blog'? blogSchema:commentSchema}
        onSubmit={values=>{
            console.log('Dispatch Here!')
        }}
        initialValues={
        type ==='blog'?
        {
            author: loggedInAccount.data.username,
            json_metadata: '',
            body: '',
            permalink: '',
            title: '',
        }:{
            author: loggedInAccount.data.username,
            json_metadata: '',
            body: '',
            parent_author:'',
            parent_permalink:'',
            permalink: '',
            title: '',
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
                    <Card.Title>{type ==='blog'? "Blog": "Comment"}</Card.Title>
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
                        <Form.Label>Title</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                            type="text"
                            name="title"
                            value={String(values.title)}
                            onChange={handleChange}
                            isInvalid={touched.title && !!errors.title}
                            />
                            <Form.Control.Feedback type="invalid">{String(errors.title)}</Form.Control.Feedback>
                        </InputGroup>
                        </Form.Group>
                        </Row>
                        <Row className='mb-3'>
                        <Form.Group >
                        <Form.Label>Body</Form.Label>
                            <InputGroup>
                            <Form.Control 
                            as="textarea" 
                            aria-label="With textarea" 
                            name="body"
                            value={String(values.body)}
                            onChange={handleChange}
                            isInvalid={touched.body && !!errors.body}
                            />
                            <Form.Control.Feedback type="invalid">{String(errors.body)}</Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                        </Row>
                        {
                            type ==='comment'? 
                            <div>
                            <Row className='mb-3'>
                            <Form.Group controlId='fromValidation'>
                            <Form.Label>Parent Author</Form.Label>
                            <InputGroup hasValidation>
                                <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                                <Form.Control
                                type="text"
                                name="author"
                                placeholder="Username"
                                value={String(values.parent_author)}
                                onChange={handleChange}
                                isInvalid={touched.parent_author && !!errors.parent_author}
                                />
                                <Form.Control.Feedback type="invalid">{String(errors.parent_author)}</Form.Control.Feedback>
                            </InputGroup>
                            </Form.Group>
                            </Row>
                            <Row className='mb-3'>
                            <Form.Group controlId='fromValidation'>
                            <Form.Label>Parent Permalink</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                type="text"
                                name="parent_permalink"
                                value={String(values.parent_permalink)}
                                onChange={handleChange}
                                isInvalid={touched.parent_permalink && !!errors.parent_permalink}
                                />
                                <Form.Control.Feedback type="invalid">{String(errors.parent_permalink)}</Form.Control.Feedback>
                            </InputGroup>
                            </Form.Group>
                            </Row>
                            </div>
                            :null
                        }
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
                        <Form.Group >
                        <Form.Label>JSON Metadata</Form.Label>
                            <InputGroup>
                            <Form.Control 
                            as="textarea" 
                            aria-label="With textarea" 
                            name="json_metadata"
                            value={String(values.json_metadata)}
                            onChange={handleChange}
                            isInvalid={touched.json_metadata && !!errors.json_metadata}
                            />
                            <Form.Control.Feedback type="invalid">{String(errors.json_metadata)}</Form.Control.Feedback>
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
