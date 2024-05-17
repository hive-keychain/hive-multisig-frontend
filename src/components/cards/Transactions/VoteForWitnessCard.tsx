import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form, Row } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { LoginResponseType } from '../../../interfaces';
import { ErrorMessage } from '../../../interfaces/errors.interface';
import { IExpiration } from '../../../interfaces/transaction.interface';
import { useAppDispatch } from '../../../redux/app/hooks';
import {
  setExpiration,
  setOperation,
} from '../../../redux/features/transaction/transactionThunks';
import ErrorModal from '../../modals/Error';
import { Expiration } from './Expiration';
import { InputRow } from './InputRow';

const VoteForWitnessCard: React.FC<{}> = () => {
  let loggedInAccount =
    useReadLocalStorage<LoginResponseType>('accountDetails');
  const dispatch = useAppDispatch();
  const [accountDetails, setAccountDetails] =
    useState<LoginResponseType>(loggedInAccount);
  const [operation, setOps] = useState<Hive.AccountWitnessVoteOperation>();
  const [onErrorShow, setOnErrorShow] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage>({
    Title: '',
    Code: '',
    ErrorName: '',
    ErrorMessage: '',
  });
  const [expiration, setTxExpiration] = useState<IExpiration>({
    minutes: 0,
    date: undefined,
  });
  useEffect(() => {
    setAccountDetails(loggedInAccount);
  }, [loggedInAccount]);

  useEffect(() => {
    if (!onErrorShow) {
      setErrorMessage({
        Title: '',
        Code: '',
        ErrorName: '',
        ErrorMessage: '',
      });
    }
  }, [onErrorShow]);
  useEffect(() => {
    if (errorMessage.Title !== '') {
      setOnErrorShow(true);
    }
  }, [errorMessage]);
  useEffect(() => {
    dispatch(setExpiration(expiration));
  }, [expiration]);
  useEffect(() => {
    dispatch(setOperation(operation));
  }, [operation]);

  const handleTransaction = async (values: any) => {
    const op: Hive.AccountWitnessVoteOperation = [
      'account_witness_vote',
      {
        account: values.account,
        approve: values.approve,
        witness: values.witness,
      },
    ];
    setOps(op);
  };
  const schema = yup.object().shape({
    account: yup.string().required('Required'),
    approve: yup.bool().required('Required'),
    witness: yup.string().required('Required'),
  });
  return (
    <div>
      <ErrorModal
        show={onErrorShow}
        setShow={setOnErrorShow}
        error={errorMessage}
      />
      <Formik
        validationSchema={schema}
        onSubmit={(values, actions) => {
          handleTransaction(values);
          
        }}
        initialValues={{
          account: accountDetails ? accountDetails.data.username : '',
          approve: false,
          witness: '',
        }}>
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Card border="secondary">
            <Container>
              <Card.Body>
                <Card.Title>Vote for Witness</Card.Title>
                <Form noValidate onSubmit={handleSubmit}>
                  <InputRow
                    rowKey="account"
                    prepend="@"
                    label="Account"
                    rowName="account"
                    type="text"
                    placeholder="Username"
                    value={values.account}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.account && !!errors.account}
                    error={errors.account}
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
                    invalidFlag={touched.witness && !!errors.witness}
                    error={errors.witness}
                  />
                  <Row className="mb-3">
                    <Form.Group>
                      <Form.Label>Approval</Form.Label>
                      <Form.Check
                        type="checkbox"
                        label="Approve"
                        name="approve"
                        id="approve"
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Row>
                  <Expiration setExpiration={setTxExpiration} />
                  <div className="d-flex justify-content-end">
                    <Button type="submit" className="" variant="success">
                      Submit
                    </Button>
                  </div>
                  <br />
                  <br />
                </Form>
              </Card.Body>
            </Container>
          </Card>
        )}
      </Formik>
    </div>
  );
};
export default VoteForWitnessCard;
