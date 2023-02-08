import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { SignResponseType } from '../../../interfaces';
import { requestSignTx } from '../../../utils/hive-keychain.utils';
import ErrorModal from '../../modals/Error';
import { InputRow } from './InputRow';

export const VoteOperationCard = () => {
  const loggedInAccount =
    useReadLocalStorage<SignResponseType>('accountDetails');
  const [transaction, setTransaction] = useState<object>();
  const [onErrorShow, setOnErrorShow] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!onErrorShow) {
      setErrorMessage('');
    }
  }, [onErrorShow]);
  useEffect(() => {
    if (errorMessage !== '') {
      setOnErrorShow(true);
    }
  }, [errorMessage]);
  useEffect(() => {
    if (transaction) {
      requestSignTx(
        loggedInAccount.data.username,
        transaction,
        setErrorMessage,
        'Posting',
      );
    }
  }, [transaction]);

  const handleTransaction = async (values: any) => {
    const tx: Hive.VoteOperation = {
      0: 'vote',
      1: {
        author: values.author,
        permlink: values.permlink,
        voter: values.voter,
        weight: values.weight,
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
        message={errorMessage}
      />
      <Formik
        validationSchema={schema}
        onSubmit={(values) => {
          handleTransaction(values);
        }}
        initialValues={{
          author: loggedInAccount.data.username,
          permlink: '',
          voter: '',
          weight: '',
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
