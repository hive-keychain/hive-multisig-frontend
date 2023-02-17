import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import * as yup from 'yup';
import { SignResponseType } from '../../../interfaces';
import { IExpiration } from '../../../interfaces/transaction.interface';
import { requestSignTx } from '../../../utils/hive-keychain.utils';
import ErrorModal from '../../modals/Error';
import { Expiration } from './Expiration';
import { InputRow } from './InputRow';

export const BlogpostOperationCard = () => {
  const loggedInAccount =
    useReadLocalStorage<SignResponseType>('accountDetails');
  const [transaction, setTransaction] = useState<object>();
  const [onErrorShow, setOnErrorShow] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
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
    const tx: Hive.CommentOperation = {
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
    setTransaction(tx);
  };
  const schema = yup.object().shape({
    author: yup.string().required('Required'),
    body: yup.string().required('Required'),
    json_metadata: yup.string().required('Required'),
    parent_author: yup.string(),
    parent_permlink: yup.string(),
    permlink: yup.string().required('Required'),
    title: yup.string().required('Required'),
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
        onSubmit={(values, helpers) => {
          handleTransaction(values);
        }}
        initialValues={{
          author: loggedInAccount.data.username,
          json_metadata: '',
          body: '',
          parent_author: '',
          parent_permlink: '',
          permlink: '',
          title: '',
        }}>
        {({
          handleSubmit,
          handleChange,
          handleReset,
          values,
          touched,
          errors,
        }) => (
          <Card border="secondary">
            <Container>
              <Card.Body>
                <Card.Title>Blog</Card.Title>
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
                    rowKey="title"
                    label="Title"
                    rowName="title"
                    type="text"
                    placeholder="Title"
                    value={values.title}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.title && !!errors.title}
                    error={errors.title}
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
