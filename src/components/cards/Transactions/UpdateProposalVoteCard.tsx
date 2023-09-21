import * as Hive from '@hiveio/dhive';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form, Row } from 'react-bootstrap';
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
import { AddArrayFieldType } from './AddArrayField';
import { Expiration } from './Expiration';
import { FieldArrayCard } from './FieldArrayCard';
import { InputRow } from './InputRow';

const UpdateProposalVoteCard: React.FC<{}> = () => {
  let loggedInAccount =
    useReadLocalStorage<LoginResponseType>('accountDetails');
  const dispatch = useAppDispatch();
  const [accountDetails, setAccountDetails] =
    useState<LoginResponseType>(loggedInAccount);
  const [newProposalId, setNewProposalId] = useState<string>('');
  const [operation, setOps] = useState<Hive.UpdateProposalVotesOperation>();
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
  const handleTransaction = async (values: any) => {
    var p_ids: number[] = values.proposal_ids.map((x: string) => {
      return parseInt(x, 10);
    });
    const op: Hive.UpdateProposalVotesOperation = [
      'update_proposal_votes',
      {
        approve: values.approve,
        extensions: values.extensions,
        proposal_ids: p_ids,
        voter: values.voter,
      },
    ];
    setOps(op);
  };

  const addProposalIdBtnHandler = (push: Function) => {
    if (newProposalId && newProposalId !== '') {
      push(newProposalId);
      setNewProposalId('');
    }
  };
  const proposalIDsAddFieldProp: AddArrayFieldType = {
    stateValue: newProposalId,
    placeHolder: 'Proposal ID',
    setStateFunc: setNewProposalId,
    addButtonHandler: addProposalIdBtnHandler,
  };
  const schema = yup.object().shape({
    approve: yup.bool().required('Required'),
    extensions: yup.array(),
    proposal_ids: yup
      .array()
      .required('Required')
      .min(1, 'Minimum of 1 Proposal ID'),
    voter: yup.string().required('Required'),
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
          actions.resetForm();
        }}
        initialValues={{
          approve: false,
          extensions: [],
          proposal_ids: [],
          voter: accountDetails ? accountDetails.data.username : '',
        }}>
        {({ handleSubmit, handleChange, values, touched, errors }) => (
          <Card border="secondary">
            <Container>
              <Card.Body>
                <Card.Title>Vote for Proposal</Card.Title>
                <Form noValidate onSubmit={handleSubmit}>
                  <InputRow
                    rowKey="voter"
                    prepend="@"
                    label="Voter"
                    rowName="voter"
                    type="text"
                    placeholder="Username"
                    value={values.voter}
                    onChangeFunc={handleChange}
                    invalidFlag={touched.voter && !!errors.voter}
                    error={errors.voter}
                  />
                  <Row className="mb-3">
                    <FieldArrayCard
                      key="proposal_ids"
                      name="proposal_ids"
                      label="Proposal IDs"
                      error={
                        typeof errors.proposal_ids === 'string'
                          ? String(errors.proposal_ids)
                          : ''
                      }
                      addArrayFieldProps={proposalIDsAddFieldProp}
                    />
                  </Row>
                  <Row className="mb-3">
                    <Form.Group>
                      <Form.Label>Approval</Form.Label>
                      <Form.Check
                        type="checkbox"
                        label="Approve"
                        name="approve"
                        id="approve"
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Row>
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

export default UpdateProposalVoteCard;
