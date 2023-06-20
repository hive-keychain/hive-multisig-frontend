import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { LoginResponseType } from '../../../interfaces';
import { ErrorMessage } from '../../../interfaces/errors.interface';
import { IExpiration } from '../../../interfaces/transaction.interface';
import HiveUtils from '../../../utils/hive.utils';
import { hiveDecimalFormat } from '../../../utils/utils';
import ErrorModal from '../../modals/Error';
import { Expiration } from './Expiration';
import { InputRow } from './InputRow';

const WithdrawFromSavingsCard: React.FC<{}> = () => {
  let loggedInAccount = useReadLocalStorage<LoginResponseType>('accountDetails');
  const [accountDetails, setAccountDetails] =
    useState<LoginResponseType>(loggedInAccount);
  const [assetType, setAssetType] = useState<Hive.AssetSymbol>('HIVE');
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

  useEffect(() => {}, [transaction]);

  const handleTransaction = async (values: any) => {
    const asset: string = hiveDecimalFormat(values.amount) + ` ${assetType}`;
    const rqid = await HiveUtils.getNextRequestID(
      loggedInAccount.data.username,
    );
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
        error={errorMessage}
      />
      <Formik
        validationSchema={schema}
        onSubmit={(values) => {
          handleTransaction(values);
        }}
        initialValues={{
          amount: 0,
          from: accountDetails ? accountDetails.data.username : '',
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
                    placeholder="0"
                    value={values.amount}
                    select={['HIVE', 'HBD']}
                    selectionHandler={handleAssetChange}
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
const makeMemo = (userMemo: string = ''): string => {
  const memo = `
        Operation: transfer_to_savings;
        Date:${Date.now()};
        UserMemo:${userMemo};
    `;
  return memo;
};

export default WithdrawFromSavingsCard;
