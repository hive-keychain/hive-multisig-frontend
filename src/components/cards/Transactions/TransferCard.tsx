import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { HiveMultisigSDK } from 'hive-multisig-sdk/src';
import {
  IEncodeTransaction,
  RequestSignatureMessage,
} from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { LoginResponseType } from '../../../interfaces';
import { ErrorMessage } from '../../../interfaces/errors.interface';
import { IExpiration } from '../../../interfaces/transaction.interface';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import { setExpiration } from '../../../redux/features/transaction/transactionThunks';
import HiveTxUtils from '../../../utils/hivetx.utils';
import { hiveDecimalFormat } from '../../../utils/utils';
import ErrorModal from '../../modals/Error';
import { Expiration } from './Expiration';
import { InputRow } from './InputRow';
import { SignerRow } from './SignerRow';
function Transfer() {
  let loggedInAccount =
    useReadLocalStorage<LoginResponseType>('accountDetails');
  const dispatch = useAppDispatch();
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const [accountDetails, setAccountDetails] =
    useState<LoginResponseType>(loggedInAccount);
  const [assetType, setAssetType] = useState<Hive.AssetSymbol>('HIVE');
  const [operation, setOperation] = useState<Hive.TransferOperation>();
  const [onErrorShow, setOnErrorShow] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage>({
    Title: '',
    Code: '',
    ErrorName: '',
    ErrorMessage: '',
  });
  const [expiration, setTxExpiration] = useState<IExpiration>({
    days: 0,
    hours: 0,
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
    if (operation) {
      (async () => {
        const transaction = await HiveTxUtils.createTx([operation], expiration);
        const multisig = new HiveMultisigSDK(window);
        const txEncode: IEncodeTransaction = {
          transaction: transaction,
          method: transactionState.method,
          expirationDate: new Date(transactionState.expiration),
          receiver: transactionState.receiver.toString(),
          initiator: transactionState.username.toString(),
          authority: transactionState.authority,
        };
        const encodedTxObj = await multisig.encodeTransaction(txEncode);
        const requestSignatureObj: RequestSignatureMessage = {
          signatureRequest: encodedTxObj.signRequestData,
          initialSigner: {
            username: transactionState.username,
            publicKey: transactionState.publicKey.toString(),
            signature: encodedTxObj.signedTransaction.signatures[0],
            weight: transactionState.authority.key_auths[0][1],
          },
        };
        const result = await multisig.sendSignatureRequest(requestSignatureObj);
        console.log(result);
      })();
    }
  }, [operation]);

  const handleTransaction = async (values: any) => {
    const expDate = moment()
      .add(expiration.days, 'd')
      .add(expiration.hours, 'h')
      .add(expiration.minutes, 'm')
      .toDate();
    console.log(expDate);
    setTxExpiration({
      ...expiration,
      date: expDate.toISOString(),
    });
    await dispatch(setExpiration(expDate.toISOString()));
    const asset: string = hiveDecimalFormat(values.amount) + ` ${assetType}`;
    const op: Hive.TransferOperation = {
      0: 'transfer',
      1: {
        from: values.from,
        to: values.to,
        amount: asset,
        memo: values.memo,
      },
    };
    setOperation(op);
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
    to: yup.string().required('Required'),
    memo: yup.string(),
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
          to: '',
          memo: '',
          day: 0,
        }}>
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Card border="secondary">
            <Container>
              <Card.Body>
                <Card.Title>Transfer Operation</Card.Title>
                <Form noValidate onSubmit={handleSubmit}>
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
                  <Expiration setExpiration={setTxExpiration} />

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

                  {transactionState.authority ? (
                    <div>
                      Signers
                      <div className="mt-2">
                        {transactionState.authority.account_auths.map(
                          (auth) => {
                            return (
                              <SignerRow
                                name={auth[0]}
                                weight={auth[1]}
                                key={auth[0]}
                              />
                            );
                          },
                        )}
                      </div>
                      <div>
                        {transactionState.authority.key_auths.map((auth) => {
                          return (
                            <SignerRow
                              name={auth[0].toString()}
                              weight={auth[1]}
                              key={auth[0].toString()}
                            />
                          );
                        })}
                      </div>
                      <div>
                        Weight Threshold:{' '}
                        {transactionState.authority.weight_threshold}
                      </div>
                    </div>
                  ) : null}
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
}

export default Transfer;
