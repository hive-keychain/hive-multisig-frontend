import { Formik } from "formik";
import { Button, Card, Container, Form } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import * as yup from 'yup';
import { SignResponseType } from "../../../interfaces";
import { InputRow } from "./InputRow";


const AccountWitnessProxCard: React.FC<{}> = () =>{
    let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
   
    const schema = yup.object().shape({
        account: yup.string().required("Required"),
        proxy: yup.string().required("Required")
    })

    return (
        <Formik
        validationSchema={schema}
        onSubmit={
            values => {
                console.log(values)
                console.log("Dispatch here")
            }
        }
        initialValues={{
            account:'',
            proxy:''
        }}
        >
            {(
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
                        <Card.Title>Choose Proxy</Card.Title>
                        <Form 
                        noValidate
                        onSubmit={handleSubmit}>
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
                                rowKey="proxy"
                                prepend="@"
                                label="Proxy"
                                rowName="proxy"
                                type="text"
                                placeholder="Username"
                                value={values.proxy}
                                onChangeFunc={handleChange}
                                invalidFlag = {touched.proxy && !!errors.proxy}
                                error = {errors.proxy}
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

export default AccountWitnessProxCard;