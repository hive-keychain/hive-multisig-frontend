import { Formik } from 'formik';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { SignResponseType } from '../../../interfaces';
import { InputRow } from './InputRow';


const DelegationsCard: React.FC<{}> = () => {
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
  
    const schema = yup.object().shape({
        delegatee: yup.string().required('Required'),
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
                   console.log(values);
                   console.log("Dispatch Here")
                }}
            initialValues={{
                delegatee: '',
                delegator: loggedInAccount.data.username,
                shares: 0
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
                                <InputRow 
                                    rowKey="delegator"
                                    prepend="@"
                                    label="Delegator"
                                    rowName="delegator"
                                    type="text"
                                    placeholder="Username"
                                    value={values.delegator}
                                    onChangeFunc={handleChange}
                                    invalidFlag = {touched.delegator && !!errors.delegator}
                                    error = {errors.delegator}
                                />
                                <InputRow 
                                    rowKey="delegatee"
                                    prepend="@"
                                    label="Delegatee"
                                    rowName="delegatee"
                                    type="text"
                                    placeholder="Username"
                                    value={values.delegatee}
                                    onChangeFunc={handleChange}
                                    invalidFlag = {touched.delegatee && !!errors.delegatee}
                                    error = {errors.delegatee}
                                />
                               <InputRow 
                                    rowKey="shares"
                                    label="Shares"
                                    rowName="shares"
                                    type="text"
                                    placeholder="Username"
                                    value={values.shares}
                                    onChangeFunc={handleChange}
                                    invalidFlag = {touched.shares && !!errors.shares}
                                    error = {errors.shares}
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

        
    );
}

export default DelegationsCard;
