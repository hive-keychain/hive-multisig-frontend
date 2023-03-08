import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { SignResponseType } from '../../../interfaces';
import { ErrorMessage } from '../../../interfaces/errors.interface';
import { IExpiration } from '../../../interfaces/transaction.interface';
import {
  RequestSignTx,
  fromHP,
  getDynamicGlobalProperties,
} from '../../../utils/hive-keychain.utils';
import { hiveDecimalFormat } from '../../../utils/utils';
import ErrorModal from '../../modals/Error';
import { Expiration } from './Expiration';
import { InputRow } from './InputRow';

const DelegationsCard: React.FC<{}> = () => {
  let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
  const [accountDetails, setAccountDetails] =
    useState<SignResponseType>(loggedInAccount);
  const [transaction, setTransaction] = useState<object>();
  const [onErrorShow, setOnErrorShow] = useState<boolean>(false);
  const [assetType, setAssetType] = useState<Hive.AssetSymbol | string>('HP');
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

  const schema = yup.object().shape({
    delegatee: yup.string().required('Required'),
    delegator: yup.string().required('Required'),
    vesting_shares: yup
      .number()
      .typeError('Must be a number')
      .positive('Must be more than 0')
      .required('Required'),
  });

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

  const handleAssetChange = (value: string) => {
    switch (value) {
      case 'VESTS':
        setAssetType('VESTS');
        break;
      case 'HP':
        setAssetType('HP');
        break;
    }
  };
  const handleTransaction = async (values: any) => {
    let asset: string;
    if (assetType === 'HP') {
      await getDynamicGlobalProperties('PowerUp', []).then((response) => {
        if (response) {
          var vests = fromHP(
            parseInt(hiveDecimalFormat(values.vesting_shares, 3)),
            response,
          );
          asset = vests.toString() + ` VESTS`;
        }
      });
    } else {
      asset = hiveDecimalFormat(values.vesting_shares, 6) + ` VESTS`;
    }
    const tx: Hive.DelegateVestingSharesOperation = {
      0: 'delegate_vesting_shares',
      1: {
        delegatee: values.delegatee,
        delegator: values.delegator,
        vesting_shares: asset,
      },
    };
    setTransaction(tx);
  };
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
          delegatee: '',
          delegator: accountDetails ? accountDetails.data.username : '',
          vesting_shares: 0,
        }}>
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Card border="secondary">
            <Container>
              <Card.Body>
                <Card.Title>Delegation</Card.Title>
                <Form noValidate onSubmit={handleSubmit}>
                  <InputRow
                    rowKey="delegator"
                    prepend="@"
                    label="Delegator"
                    rowName="delegator"
                    type="text"
                    placeholder="Username"
                    value={values.delegator}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.delegator && !!errors.delegator}
                    error={errors.delegator}
                  />
                  <InputRow
                    rowKey="delegatee"
                    prepend="@"
                    label="Delegatee"
                    rowName="delegatee"
                    type="text"
                    placeholder="Username"
                    value={values.delegatee}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.delegatee && !!errors.delegatee}
                    error={errors.delegatee}
                  />
                  <InputRow
                    rowKey="vesting_shares"
                    label="Vesting Shares"
                    rowName="vesting_shares"
                    type="text"
                    placeholder="0"
                    value={values.vesting_shares}
                    select={['HP', 'VESTS']}
                    selectionHandler={handleAssetChange}
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

export default DelegationsCard;
