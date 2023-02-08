import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { SignResponseType } from '../../../interfaces';
import {
  GetNextRequestID,
  requestSignTx,
} from '../../../utils/hive-keychain.utils';
import { hiveDecimalFormat } from '../../../utils/utils';
import ErrorModal from '../../modals/Error';
import { InputRow } from './InputRow';

const WithdrawFromSavingsCard: React.FC<{}> = () => {
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
    const asset: string = hiveDecimalFormat(values.amount, 3) + ` HIVE`;
    const rqid = await GetNextRequestID(loggedInAccount.data.username);
    const tx: Hive.TransferFromSavingsOperation = {
      0: 'transfer_from_savings',
      1: {
        amount: asset,
        from: values.from,
        memo: values.memo,
        request_id: rqid,
        to: values.to,
      },
    };
    setTransaction(tx);
  };
  const schema = yup.object().shape({
    from: yup.string().required('Required'),
    to: yup.string().required('Required'),
    memo: yup.string(),
    amount: yup
      .number()
      .typeError('Must be a number')
      .positive('Must be more than 0')
      .required('Required'),
    request_id: yup.number(),
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
          amount: 0,
          from: loggedInAccount.data.username,
          memo: '',
          request_id: 0,
          to: '',
        }}>
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Card border="secondary">
            <Container>
              <Card.Body>
                <Card.Title>Withdraw from Savings</Card.Title>
                <Form noValidate onSubmit={handleSubmit}>
                  <InputRow
                    rowKey="from"
                    prepend="@"
                    label="From"
                    rowName="from"
                    type="text"
                    placeholder="Username"
                    value={values.from}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.from && !!errors.from}
                    error={errors.from}
                  />
                  <InputRow
                    rowKey="to"
                    prepend="@"
                    label="To"
                    rowName="to"
                    type="text"
                    placeholder="Username"
                    value={values.to}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.to && !!errors.to}
                    error={errors.to}
                  />
                  <InputRow
                    rowKey="amount"
                    label="Amount"
                    rowName="amount"
                    type="text"
                    append="HIVE"
                    placeholder="0"
                    value={values.amount}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.amount && !!errors.amount}
                    error={errors.amount}
                  />
                  <InputRow
                    rowKey="memo"
                    label="Memo"
                    rowName="memo"
                    type="textarea"
                    as="textarea"
                    placeholder=""
                    value={values.memo}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.memo && !!errors.memo}
                    error={errors.memo}
                  />
                  <br />
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
const makeMemo = (userMemo: string = ''): string => {
  const memo = `
        Operation: transfer_to_savings;
        Date:${Date.now()};
        UserMemo:${userMemo};
    `;
  return memo;
};

export default WithdrawFromSavingsCard;
