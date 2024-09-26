import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
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
import { hiveDecimalFormat } from '../../../utils/utils';
import ErrorModal from '../../modals/Error';
import { Expiration } from './Expiration';
import { InputRow } from './InputRow';

const PowerDownCard: React.FC<{}> = () => {
  let loggedInAccount =
    useReadLocalStorage<LoginResponseType>('accountDetails');
  const dispatch = useAppDispatch();
  const [accountDetails, setAccountDetails] =
    useState<LoginResponseType>(loggedInAccount);
  const [operation, setOps] = useState<Hive.WithdrawVestingOperation>();
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

  const handleTransaction = (values: any) => {
    const asset: string =
      hiveDecimalFormat(values.vesting_shares, 6) + ` VESTS`;
    const op: Hive.WithdrawVestingOperation = [
      'withdraw_vesting',
      {
        account: values.account,
        vesting_shares: asset,
      },
    ];
    setOps(op);
  };

  const schema = yup.object().shape({
    account: yup.string().required('Required'),
    vesting_shares: yup
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
        onSubmit={(values, actions) => {
          handleTransaction(values);
          
        }}
        initialValues={{
          account: '',
          vesting_shares: 0,
        }}>
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Card border="secondary">
            <Container>
              <Card.Body>
                <Card.Title>Power Down</Card.Title>
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
                    rowKey="vesting_shares"
                    label="Vesting Shares"
                    rowName="vesting_shares"
                    type="text"
                    append="VESTS"
                    placeholder="0"
                    value={values.vesting_shares}
                    onChangeFunc={handleChange}
                    invalidFlag={
                      touched.vesting_shares && !!errors.vesting_shares
                    }
                    error={errors.vesting_shares}
                  />
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
export default PowerDownCard;
