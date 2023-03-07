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
import { hiveDecimalFormat } from '../../../utils/utils';
import ErrorModal from '../../modals/Error';
import { Expiration } from './Expiration';
import { InputRow } from './InputRow';

const PowerDownCard: React.FC<{}> = () => {
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
          expiration,
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

  const handleTransaction = (values: any) => {
    const asset: string =
      hiveDecimalFormat(values.vesting_shares, 6) + ` VESTS`;
    const tx: Hive.WithdrawVestingOperation = {
      0: 'withdraw_vesting',
      1: {
        account: values.account,
        vesting_shares: asset,
      },
    };
    setTransaction(tx);
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
        onSubmit={(values) => {
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
export default PowerDownCard;
