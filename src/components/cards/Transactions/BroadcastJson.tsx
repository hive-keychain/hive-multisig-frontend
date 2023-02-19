import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form, Row } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { SignResponseType } from '../../../interfaces';
import { ErrorMessage } from '../../../interfaces/errors.interface';
import { IExpiration } from '../../../interfaces/transaction.interface';
import { RequestSignTx } from '../../../utils/hive-keychain.utils';
import ErrorModal from '../../modals/Error';
import { AddArrayFieldType } from './AddArrayField';
import { Expiration } from './Expiration';
import { FieldArrayCard } from './FieldArrayCard';
import { InputRow } from './InputRow';

function BroadcastJson() {
  let loggedInAccount = useReadLocalStorage<SignResponseType>('accountDetails');
  const [newAuth, setNewAuth] = useState<string>('');
  const [newPostingAuth, setNewPostingAuth] = useState<string>('');
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

  const handleTransaction = async (values: any) => {
    const tx: Hive.CustomJsonOperation = {
      0: 'custom_json',
      1: {
        id: values.id,
        json: values.json,
        required_auths: values.required_auths,
        required_posting_auths: values.required_posting_auths,
      },
    };
    setTransaction(tx);
  };

  const schema = yup.object().shape({
    id: yup
      .string()
      .required('Required')
      .max(32, 'ID string must be less than 32 characters long'),
    json: yup.string().required('Required'),
    required_auths: yup
      .array()
      .required('Required')
      .min(1, 'Minimum of 1 Authority'),
    required_posting_auths: yup
      .array()
      .required('Required')
      .min(1, 'Minimum of 1 Posting Authority'),
  });
  const addAuthBtnClicked = (push: Function) => {
    if (newAuth && newAuth !== '') {
      push(newAuth);
      setNewAuth('');
    }
  };
  const addPostingAuthBtnClicked = (push: Function) => {
    if (newPostingAuth && newPostingAuth !== '') {
      push(newPostingAuth);
      setNewPostingAuth('');
    }
  };
  const authAddArrayProps: AddArrayFieldType = {
    stateValue: newAuth,
    placeHolder: 'Authority',
    setStateFunc: setNewAuth,
    addButtonHandler: addAuthBtnClicked,
  };
  const posintAuthAddArrayProps: AddArrayFieldType = {
    stateValue: newPostingAuth,
    placeHolder: 'Posting Authority',
    setStateFunc: setNewPostingAuth,
    addButtonHandler: addPostingAuthBtnClicked,
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
          id: '',
          json: '',
          required_auths: [],
          required_posting_auths: [],
        }}>
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Card border="secondary">
            <Container>
              <Card.Body>
                <Card.Title>Broadcast JSON</Card.Title>
                <Form noValidate onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <Form.Group controlId="fromValidation">
                      <InputRow
                        rowKey="id"
                        label="ID"
                        rowName="id"
                        type="text"
                        placeholder=""
                        value={values.id}
                        onChangeFunc={handleChange}
                        invalidFlag={touched.id && !!errors.id}
                        error={errors.id}
                      />
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <FieldArrayCard
                      key="authsCard"
                      name="required_auths"
                      label="Required Authorities"
                      error={
                        typeof errors.required_auths === 'string'
                          ? String(errors.required_auths)
                          : ''
                      }
                      addArrayFieldProps={authAddArrayProps}
                    />
                  </Row>
                  <Row className="mb-3">
                    <FieldArrayCard
                      key="postingAuthsCard"
                      name="required_posting_auths"
                      label="Required Posting Authorities"
                      error={
                        typeof errors.required_posting_auths === 'string'
                          ? String(errors.required_posting_auths)
                          : ''
                      }
                      addArrayFieldProps={posintAuthAddArrayProps}
                    />
                  </Row>
                  <InputRow
                    rowKey="json"
                    label="JSON"
                    rowName="json"
                    type="textarea"
                    as="textarea"
                    placeholder=""
                    value={values.json}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.json && !!errors.json}
                    error={errors.json}
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

export default BroadcastJson;
