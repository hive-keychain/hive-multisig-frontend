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
import HiveUtils from '../../../utils/hive.utils';
import { hiveDecimalFormat } from '../../../utils/utils';
import ErrorModal from '../../modals/Error';
import { Expiration } from './Expiration';
import { InputRow } from './InputRow';

function DelegationsCard() {
  let loggedInAccount =
    useReadLocalStorage<LoginResponseType>('accountDetails');
  const dispatch = useAppDispatch();
  const [accountDetails, setAccountDetails] =
    useState<LoginResponseType>(loggedInAccount);
  const [operation, setOps] = useState<Hive.DelegateVestingSharesOperation>();
  const [onErrorShow, setOnErrorShow] = useState<boolean>(false);
  const [assetType, setAssetType] = useState<Hive.AssetSymbol | string>('HP');
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
    dispatch(setExpiration(expiration));
  }, [expiration]);
  useEffect(() => {
    dispatch(setOperation(operation));
  }, [operation]);

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
      await HiveUtils.getDynamicGlobalProperties('PowerUp', []).then(
        (response) => {
          if (response) {
            var vests = HiveUtils.fromHP(
              parseInt(hiveDecimalFormat(values.vesting_shares, 3)),
              response,
            );
            asset = vests.toString() + ` VESTS`;
          }
        },
      );
    } else {
      asset = hiveDecimalFormat(values.vesting_shares, 6) + ` VESTS`;
    }
    const op: Hive.DelegateVestingSharesOperation = [
      'delegate_vesting_shares',
      {
        delegatee: values.delegatee,
        delegator: values.delegator,
        vesting_shares: asset,
      },
    ];
    setOps(op);
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
        onSubmit={(values, actions) => {
          handleTransaction(values);
          actions.resetForm();
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
}

export default DelegationsCard;
