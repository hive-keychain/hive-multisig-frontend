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
import ErrorModal from '../../modals/Error';
import { Expiration } from './Expiration';
import { InputRow } from './InputRow';
export const CommentOperationCard = () => {
  const dispatch = useAppDispatch();
  const loggedInAccount =
    useReadLocalStorage<LoginResponseType>('accountDetails');
  const [accountDetails, setAccountDetails] =
    useState<LoginResponseType>(loggedInAccount);
  const [operation, setOps] = useState<Hive.CommentOperation>();
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
    dispatch(setExpiration(expiration));
  }, [expiration]);
  useEffect(() => {
    dispatch(setOperation(operation));
  }, [operation]);

  const handleTransaction = async (values: any) => {
    const op: Hive.CommentOperation = {
      0: 'comment',
      1: {
        parent_author: values.parent_author,
        parent_permlink: values.parent_permlink,
        author: values.author,
        permlink: values.permlink,
        title: values.title,
        body: values.body,
        json_metadata: values.json_metadata,
      },
    };
    setOps(op);
  };
  const schema = yup.object().shape({
    author: yup.string().required('Required'),
    body: yup.string().required('Required'),
    json_metadata: yup.string().required('Required'),
    parent_author: yup.string().required('Required'),
    parent_permlink: yup.string().required('Required'),
    permlink: yup.string().required('Required'),
    title: yup.string(),
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
          author: accountDetails ? accountDetails.data.username : '',
          json_metadata: '',
          body: '',
          parent_author: '',
          parent_permlink: '',
          permlink: '',
          title: '',
        }}>
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Card border="secondary">
            <Container>
              <Card.Body>
                <Card.Title>Comment</Card.Title>
                <Form noValidate onSubmit={handleSubmit}>
                  <InputRow
                    rowKey="author"
                    prepend="@"
                    label="Author"
                    rowName="author"
                    type="text"
                    placeholder="Username"
                    value={values.author}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.author && !!errors.author}
                    error={errors.author}
                  />
                  <InputRow
                    rowKey="body"
                    label="Body"
                    rowName="body"
                    type="textarea"
                    as="textarea"
                    placeholder=""
                    value={values.body}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.body && !!errors.body}
                    error={errors.body}
                  />
                  <InputRow
                    rowKey="parent_author"
                    prepend="@"
                    label="Parent Author"
                    rowName="parent_author"
                    type="text"
                    placeholder="Parent Author"
                    value={values.parent_author}
                    onChangeFunc={handleChange}
                    invalidFlag={
                      touched.parent_author && !!errors.parent_author
                    }
                    error={errors.parent_author}
                  />
                  <InputRow
                    rowKey="parent_permlink"
                    label="Parent Permlink"
                    rowName="parent_permlink"
                    type="text"
                    placeholder="Parent permlink"
                    value={values.parent_permlink}
                    onChangeFunc={handleChange}
                    invalidFlag={
                      touched.parent_permlink && !!errors.parent_permlink
                    }
                    error={errors.parent_permlink}
                  />
                  <InputRow
                    rowKey="permlink"
                    label="permlink"
                    rowName="permlink"
                    type="text"
                    placeholder="permlink"
                    value={values.permlink}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.permlink && !!errors.permlink}
                    error={errors.permlink}
                  />
                  <InputRow
                    rowKey="json_metadata"
                    label="JSON Metadata"
                    rowName="json_metadata"
                    type="textarea"
                    as="textarea"
                    placeholder=""
                    value={values.json_metadata}
                    onChangeFunc={handleChange}
                    invalidFlag={
                      touched.json_metadata && !!errors.json_metadata
                    }
                    error={errors.json_metadata}
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
