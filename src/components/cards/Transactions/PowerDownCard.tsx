import { Formik } from "formik";
import { Button, Card, Container, Form } from "react-bootstrap";
import * as yup from 'yup';
import { InputRow } from "./InputRow";

const PowerDownCard: React.FC<{}> = () => {
  
    const schema = yup.object().shape({
        account: yup.string().required("Required"),
        vesting_shares: yup.number()
        .typeError('Must be a number')
        .positive('Must be more than 0')
        .required('Required')
    })
    return (
        <Formik
            validationSchema={schema}
            onSubmit={
                values =>{
                    console.log(values);
                }
            }  
            initialValues={{
                account: '',
                vesting_shares: 0,
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
                                <Card.Title>Power Up</Card.Title>
                                <Form
                                noValidate
                                onSubmit={handleSubmit}
                                >
                                <InputRow 
                                    rowKey="account"
                                    prepend="@"
                                    label="Account"
                                    rowName="account"
                                    type="text"
                                    placeholder="Username"
                                    value={values.account}
                                    onChangeFunc={handleChange}
                                    invalidFlag = {touched.account && !!errors.account}
                                    error = {errors.account}
                                />
                                <InputRow 
                                    rowKey="vesting_shares"
                                    label="Vesting Shares"
                                    rowName="vesting_shares"
                                    type="text"
                                    placeholder="0"
                                    value={values.vesting_shares}
                                    onChangeFunc={handleChange}
                                    invalidFlag = {touched.vesting_shares && !!errors.vesting_shares}
                                    error = {errors.vesting_shares}
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
export default PowerDownCard;