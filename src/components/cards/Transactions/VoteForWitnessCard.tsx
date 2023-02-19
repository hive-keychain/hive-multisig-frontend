import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form, Row } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { SignResponseType } from '../../../interfaces';
import { ErrorMessage } from '../../../interfaces/errors.interface';
import { IExpiration } from '../../../interfaces/transaction.interface';
import { RequestSignTx } from '../../../utils/hive-keychain.utils';
import ErrorModal from '../../modals/Error';
import { Expiration } from './Expiration';
import { InputRow } from './InputRow';

const VoteForWitnessCard: React.FC<{}> = () => {
  let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
  const [transaction, setTransaction] = useState<object>();
  const [onErrorShow, setOnErrorShow] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage>({
    Title: '',
    Code: '',
    ErrorName: '',
    ErrorMessage: '',
  });
  const [expiration, setExpiration] = useState<IExpiration>({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    if (expiration) {
      console.log(expiration);
    }
  }, [expiration]);
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
    if (transaction) {
      const sign = async () => {
        const res = await RequestSignTx(
          loggedInAccount.data.username,
          transaction,
          setErrorMessage,
        );
        if (res) {
          setErrorMessage({
            Title: 'Transaction Success!',
            Code: '',
            ErrorName: '',
            ErrorMessage: '',
          });
        }
      };
      sign().catch(() => {});
    }
  }, [transaction]);

  const handleTransaction = async (values: any) => {
    const tx: Hive.AccountWitnessVoteOperation = {
      0: 'account_witness_vote',
      1: {
        account: values.account,
        approve: values.approve,
        witness: values.witness,
      },
    };
    setTransaction(tx);
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
        onSubmit={(values) => {
          handleTransaction(values);
        }}
        initialValues={{
          account: loggedInAccount.data.username,
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
                  <Expiration setExpiration={setExpiration} />
                  <Button
                    type="submit"
                    className="pull-right"
                    variant="success">
                    Submit
                  </Button>
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
