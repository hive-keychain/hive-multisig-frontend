import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { SignResponseType } from '../../../interfaces';
import { ErrorMessage } from '../../../interfaces/errors.interface';
import { IExpiration } from '../../../interfaces/transaction.interface';
import { RequestSignTx } from '../../../utils/hive-keychain.utils';
import ErrorModal from '../../modals/Error';
import { Expiration } from './Expiration';
import { InputRow } from './InputRow';

export const VoteOperationCard = () => {
  const loggedInAccount =
    useReadLocalStorage<SignResponseType>('accountDetails');
  const [accountDetails, setAccountDetails] =
    useState<SignResponseType>(loggedInAccount);
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
    if (transaction) {
      const sign = async () => {
        const res = await RequestSignTx(
          accountDetails.data.username,
          transaction,
          expiration,
          setErrorMessage,
          'Posting',
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
    const tx: Hive.VoteOperation = {
      0: 'vote',
      1: {
        author: values.author,
        permlink: values.permlink,
        voter: values.voter,
        weight: parseInt(values.weight),
      },
    };
    setTransaction(tx);
  };

  const schema = yup.object().shape({
    author: yup.string().required('Required'),
    permlink: yup.string().required('Required'),
    voter: yup.string().required('Required'),
    weight: yup
      .number()
      .typeError('Must be a number')
      .positive('Must be more than 0')
      .required('Required'),
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
          author: '',
          permlink: '',
          voter: accountDetails ? accountDetails.data.username : '',
          weight: 0,
        }}>
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Card border="secondary">
            <Container>
              <Card.Body>
                <Card.Title>Vote</Card.Title>
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
                    invalidFlag={touched.author && !!errors.author}
                    error={errors.author}
                  />
                  <InputRow
                    rowKey="permlink"
                    label="Permlink"
                    rowName="permlink"
                    type="text"
                    placeholder="Permlink"
                    value={values.permlink}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.permlink && !!errors.permlink}
                    error={errors.permlink}
                  />
                  <InputRow
                    rowKey="voter"
                    prepend="@"
                    label="Voter"
                    rowName="voter"
                    type="text"
                    placeholder="Username"
                    value={values.voter}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.voter && !!errors.voter}
                    error={errors.voter}
                  />
                  <InputRow
                    rowKey="weight"
                    label="Weight"
                    rowName="weight"
                    type="text"
                    placeholder="100% = 10000"
                    value={values.weight}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.weight && !!errors.weight}
                    error={errors.weight}
                  />
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
