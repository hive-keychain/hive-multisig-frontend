import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { SignResponseType } from '../../../interfaces';
import { requestSignTx } from '../../../utils/hive-keychain.utils';
import { hiveDecimalFormat } from '../../../utils/utils';
import ErrorModal from '../../modals/Error';
import { InputRow } from './InputRow';
const RecurrentTransferCard: React.FC<{}> = () => {
  const loggedInAccount =
    useReadLocalStorage<SignResponseType>('accountDetails');
  const [assetType, setAssetType] = useState<Hive.AssetSymbol>('HIVE');
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
    const asset: string = hiveDecimalFormat(values.amount) + ` ${assetType}`;
    const tx: Hive.RecurrentTransferOperation = {
      0: 'recurrent_transfer',
      1: {
        amount: asset,
        executions: values.executions,
        extensions: values.extensions,
        from: values.from,
        memo: values.memo,
        recurrence: values.recurrence,
        to: values.to,
      },
    };
    setTransaction(tx);
  };
  const handleAssetChange = (value: string) => {
    switch (value) {
      case 'HBD':
        setAssetType('HBD');
        break;
      case 'HIVE':
        setAssetType('HIVE');
        break;
    }
  };
  const schema = yup.object().shape({
    amount: yup
      .number()
      .typeError('Must be a number')
      .positive('Must be more than 0')
      .required('Required'),
    executions: yup
      .number()
      .typeError('Must be a number')
      .positive('Must be more than 0')
      .required('Required'),
    extensions: yup.array(),
    from: yup.string().required('Required'),
    memo: yup.string().required('Required'),
    recurrence: yup
      .number()
      .typeError('Must be a number')
      .positive('Must be more than 0')
      .required('Required'),
    to: yup.string().required('Required'),
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
          executions: 2,
          extensions: [],
          from: loggedInAccount.data.username,
          memo: '',
          recurrence: 24,
          to: '',
        }}>
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Card border="secondary">
            <Container>
              <Card.Body>
                <Card.Title>Recurrent Transfer</Card.Title>
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
                    placeholder="0"
                    value={values.amount}
                    select={['HIVE', 'HBD']}
                    selectionHandler={handleAssetChange}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.amount && !!errors.amount}
                    error={errors.amount}
                  />
                  <InputRow
                    rowKey="executions"
                    label="Executions"
                    rowName="executions"
                    type="text"
                    placeholder="0"
                    value={values.executions}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.executions && !!errors.executions}
                    error={errors.executions}
                  />
                  <InputRow
                    rowKey="recurrence"
                    label="Recurrence"
                    rowName="executions"
                    type="text"
                    placeholder="0"
                    value={values.recurrence}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.recurrence && !!errors.recurrence}
                    error={errors.recurrence}
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

export default RecurrentTransferCard;
