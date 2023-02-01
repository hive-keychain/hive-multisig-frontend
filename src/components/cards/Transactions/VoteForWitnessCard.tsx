import { Formik } from "formik";
import { Button, Card, Container, Form, Row } from "react-bootstrap";
import * as yup from 'yup';
import { InputRow } from "./InputRow";


const VoteForWitnessCard: React.FC<{}> = () =>{

    const schema = yup.object().shape({
        account: yup.string().required("Required"),
        approve: yup.bool().required("Required"),
        witness: yup.string().required("Required")
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
            approve:false,
            witness:'',
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
                        <Card.Title>Vote for Witness</Card.Title>
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
                                rowKey="witness"
                                prepend="@"
                                label="Witness"
                                rowName="witness"
                                type="text"
                                placeholder="Username"
                                value={values.witness}
                                onChangeFunc={handleChange}
                                invalidFlag = {touched.witness && !!errors.witness}
                                error = {errors.witness}
                            />
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
export default VoteForWitnessCard;