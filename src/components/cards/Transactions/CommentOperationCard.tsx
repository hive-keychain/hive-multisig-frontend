import { Formik } from 'formik';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { SignResponseType } from '../../../interfaces';
import { InputRow } from './InputRow';

interface ICommentOpProp {
    type:string
}
export const CommentOperationCard = ({type}:ICommentOpProp) =>{
    const loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');

    const schema = yup.object().shape({
        author: yup.string().required('Required'),
        body: yup.string().required('Required'),
        json_metadata: yup.string().required('Required'),
        parent_author: yup.string(),
        parent_permalink: yup.string(),
        permalink: yup.string().required('Required'),
        title: yup.string().required('Required')
    })
    return(
       <Formik
        validationSchema={schema}
        onSubmit={values=>{
            console.log(values)
            console.log('Dispatch Here!')
        }}
        initialValues={
       {
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
                       
                        <InputRow 
                            rowKey="author"
                            prepend="@"
                            label="Author"
                            rowName="author"
                            type="text"
                            placeholder="Username"
                            value={values.author}
                            onChangeFunc={handleChange}
                            invalidFlag = {touched.author && !!errors.author}
                            error = {errors.author}
                            />
                        <InputRow 
                            rowKey="title"
                            label="Title"
                            rowName="title"
                            type="text"
                            placeholder="Title"
                            value={values.title}
                            onChangeFunc={handleChange}
                            invalidFlag = {touched.title && !!errors.title}
                            error = {errors.title}
                            />  
                         <InputRow 
                            rowKey="body"
                            label="Body"
                            rowName="body"
                            type="textarea"
                            as="textarea"
                            placeholder=""
                            value={values.body}
                            onChangeFunc={handleChange}
                            invalidFlag = {touched.body && !!errors.body}
                            error = {errors.body}
                        />
                       
                        {
                            type ==='comment'? 
                            <div>
                            <InputRow 
                                rowKey="parent_author"
                                prepend="@"
                                label="Parent Author"
                                rowName="parent_author"
                                type="text"
                                placeholder="Parent Author"
                                value={values.parent_author}
                                onChangeFunc={handleChange}
                                invalidFlag = {touched.parent_author && !!errors.parent_author}
                                error = {errors.parent_author}
                                />
                            <InputRow 
                                rowKey="parent_permalink"
                                label="Parent Permalink"
                                rowName="parent_permalink"
                                type="text"
                                placeholder="Parent Permalink"
                                value={values.parent_permalink}
                                onChangeFunc={handleChange}
                                invalidFlag = {touched.parent_permalink && !!errors.parent_permalink}
                                error = {errors.parent_permalink}
                                />
                            </div>
                            :null
                        }
                        <InputRow 
                            rowKey="permalink"
                            label="Permalink"
                            rowName="permalink"
                            type="text"
                            placeholder="Permalink"
                            value={values.permalink}
                            onChangeFunc={handleChange}
                            invalidFlag = {touched.permalink && !!errors.permalink}
                            error = {errors.permalink}
                        />
                        <InputRow 
                            rowKey="json_metadata"
                            label="JSON Metadata"
                            rowName="json_metadata"
                            type="textarea"
                            as="textarea"
                            placeholder=""
                            value={values.json_metadata}
                            onChangeFunc={handleChange}
                            invalidFlag = {touched.json_metadata && !!errors.json_metadata}
                            error = {errors.json_metadata}
                        />
                        
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
