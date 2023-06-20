import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { KeychainSDK } from 'keychain-sdk';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { LoginResponseType } from '../../../interfaces';
import { ErrorMessage } from '../../../interfaces/errors.interface';
import { IExpiration } from '../../../interfaces/transaction.interface';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import HiveTxUtils from '../../../utils/hivetx.utils';
import { hiveDecimalFormat } from '../../../utils/utils';
import ErrorModal from '../../modals/Error';
import { Expiration } from './Expiration';
import { InputRow } from './InputRow';
function Transfer() {
  let loggedInAccount =
    useReadLocalStorage<LoginResponseType>('accountDetails');
  const dispatch = useAppDispatch();
  const method = useAppSelector(
    (state) => state.transaction.setAuthority.method,
  );
  const [accountDetails, setAccountDetails] =
    useState<LoginResponseType>(loggedInAccount);
  const [assetType, setAssetType] = useState<Hive.AssetSymbol>('HIVE');
  const [operation, setOperation] = useState<object>();
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
    if (operation) {
      (async () => {
        //TODO:
        //1. create transaction from operation
        //2. signerConnect
        //3. pass to multisig signtx
        console.log('Method is ' + method);
        const transaction = await HiveTxUtils.createTx([operation], expiration);
        const keychain = new KeychainSDK(window);
        const signature = await keychain.signTx({
          username: loggedInAccount.data.username,
          tx: transaction,
          method,
        });
        if (signature.success) {
          console.log(signature);
        } else {
          console.log(signature.error);
        }
      })();
    }
  }, [operation]);

  const handleTransaction = (values: any) => {
    const asset: string = hiveDecimalFormat(values.amount) + ` ${assetType}`;
    const tx: Hive.TransferOperation = {
      0: 'transfer',
      1: {
        from: values.from,
        to: values.to,
        amount: asset,
        memo: values.memo,
      },
    };
    setOperation(tx);
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
    from: yup.string().required('Required'),
    memo: yup.string(),
    to: yup.string().required('Required'),
    day: yup.number().typeError('Must be a number').required('Required'),
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
          to: '',
          day: 0,
        }}>
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Card border="secondary">
            <Container>
              <Card.Body>
                <Card.Title>Transfer Operation</Card.Title>
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
}

export default Transfer;
