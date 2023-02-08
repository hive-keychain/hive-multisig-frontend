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

const AccountWitnessProxCard: React.FC<{}> = () => {
  let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
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
      );
    }
  }, [transaction]);

  const handleTransaction = async (values: any) => {
    const tx: Hive.AccountWitnessProxyOperation = {
      0: 'account_witness_proxy',
      1: {
        account: values.account,
        proxy: values.proxy,
      },
    };
    setTransaction(tx);
  };
  const schema = yup.object().shape({
    account: yup.string().required('Required'),
    proxy: yup.string().required('Required'),
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
          account: loggedInAccount.data.username,
          proxy: '',
        }}>
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Card border="secondary">
            <Container>
              <Card.Body>
                <Card.Title>Choose Proxy</Card.Title>
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
                    rowKey="proxy"
                    prepend="@"
                    label="Proxy"
                    rowName="proxy"
                    type="text"
                    placeholder="Username"
                    value={values.proxy}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.proxy && !!errors.proxy}
                    error={errors.proxy}
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

export default AccountWitnessProxCard;
