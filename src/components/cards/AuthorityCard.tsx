import * as Hive from '@hiveio/dhive';
import * as _ from 'lodash';
import { ReactNode, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Container,
  Form,
  InputGroup,
  Stack,
} from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { updateAccount } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';

interface IAccountKeyRowProps {
  authorityName: string;
  authAccountType: string;
  accountKeyAuth: [string, number];
  accountKeyAuths: [string, number][];
}
export interface IAccountKeysCardProps {
  authorityName: string;
  authAccountType: string;
  accountKeyAuths: [string, number][];
}
interface IAuthorityCardProps {
  authorityName: string;
  authority: Hive.AuthorityType;
}
interface IAddAccountKeyProps {
  authAccountType: string;
}
interface IAuthorityThreshProps {
  authorityName: string;
  threshold: number;
}

export function AccountKeyRow({
  authorityName,
  authAccountType,
  accountKeyAuth,
  accountKeyAuths,
}: IAccountKeyRowProps) {
  const [editFlag, setEdiFlag] = useState<string>('text-body');
  const [updateAccountKeyAuth, updateAccKeyAuth] = useState<[string, number]>();
  const [newAccountKeyAuths, setNewAccountKeyAuths] =
    useState<[string, number][]>(accountKeyAuths);
  const [deleteAccKeyAuth, setDeleteAccKeyAuth] = useState<string>();
  const dispatch = useAppDispatch();
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  const update = (
    index: number,
    newVal: [string, number],
  ): [string, number][] => {
    const newAuths: [string, number][] = newAccountKeyAuths.map((val, i) => {
      if (i === index) {
        return newVal;
      } else {
        return val;
      }
    });
    return newAuths;
  };
  useEffect(() => {
    if (updateAccountKeyAuth) {
      //if account/key exists then apply the update
      const index = newAccountKeyAuths.findIndex(
        (e) => e[0] === updateAccountKeyAuth[0],
      );
      if (index !== -1) {
        setNewAccountKeyAuths(update(index, updateAccountKeyAuth));
      }
    }
  }, [updateAccountKeyAuth]);

  useEffect(() => {
    if (updateAccountKeyAuth) {
      console.log('2newAccountKeyAuths: ', newAccountKeyAuths);
      const prop: IAccountKeysCardProps = {
        authorityName,
        authAccountType,
        accountKeyAuths: _.cloneDeep(newAccountKeyAuths),
      };
      dispatch(updateAccount(prop));
    }
  }, [newAccountKeyAuths]);

  const handleUpdate = (newWeight: number) => {
    if (newWeight !== accountKeyAuth[1]) {
      setEdiFlag('text-danger');
    } else {
      setEdiFlag('text-body');
    }
    updateAccKeyAuth([accountKeyAuth[0], newWeight]);
  };

  const handleDelete = () => {
    setDeleteAccKeyAuth(accountKeyAuth[0]);
  };

  return (
    <Stack direction="horizontal" gap={3}>
      <InputGroup className="mb-3 ">
        <InputGroup.Text id="basic-addon1">
          {authAccountType === 'Accounts' ? (
            '@'
          ) : (
            <i className="fa fa-lock"></i>
          )}
        </InputGroup.Text>
        <Form.Control
          className="me-auto "
          type="text"
          placeholder={accountKeyAuth[0].toString()}
          readOnly
        />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text className={editFlag} id="basic-addon1">
          Weight
        </InputGroup.Text>
        <Form.Control
          type="number"
          min="1"
          step="1"
          className="form-control"
          id="weightInput"
          onChange={(e) => {
            handleUpdate(parseInt(e.target.value));
          }}
          placeholder={accountKeyAuth[1].toString()}
        />
      </InputGroup>
      <Button
        className="mb-3"
        variant="outline-danger"
        onClick={() => {
          handleDelete();
        }}>
        Delete
      </Button>
    </Stack>
  );
}

export function AccountKeysCard({
  authorityName,
  authAccountType,
  accountKeyAuths,
}: IAccountKeysCardProps) {
  const [cardBorder, setCardBorder] = useState<string>('secondary');

  return (
    <Card border={cardBorder}>
      <Container>
        <Card.Body>
          <Card.Title>{authAccountType}</Card.Title>
          <Stack gap={2}>
            {accountKeyAuths.map(
              (accountKeyAuth): ReactNode => (
                <AccountKeyRow
                  key={accountKeyAuth[0].toString()}
                  authorityName={authorityName}
                  authAccountType={authAccountType}
                  accountKeyAuth={accountKeyAuth}
                  accountKeyAuths={accountKeyAuths}
                />
              ),
            )}
            <AddAccountKeyRow authAccountType={authAccountType} />
          </Stack>
        </Card.Body>
      </Container>
    </Card>
  );
}

export function AuthorityWeightThreshold(props: IAuthorityThreshProps) {
  const [weight, setNewWeightThresh] = useState<number>(props.threshold);
  const [editFlag, setEdiFlag] = useState<string>('text-body');

  useEffect(() => {
    if (weight !== props.threshold) {
      setEdiFlag('text-danger');
    } else {
      setEdiFlag('text-body');
    }
  }, [weight]);

  return (
    <div>
      <InputGroup className="mb-3">
        <InputGroup.Text className={editFlag} id="basic-addon1">
          Weight Threshold
        </InputGroup.Text>
        <Form.Control
          type="number"
          min="1"
          step="1"
          className="form-control"
          id="threshInput"
          onChange={(e) => {
            setNewWeightThresh(parseInt(e.target.value));
          }}
          placeholder={props.threshold.toString()}
        />
      </InputGroup>
    </div>
  );
}
export function AddAccountKeyRow(props: IAddAccountKeyProps) {
  return (
    <Stack direction="horizontal" gap={3}>
      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">
          {props.authAccountType === 'Accounts' ? (
            '@'
          ) : (
            <i className="fa fa-lock"></i>
          )}
        </InputGroup.Text>
        <Form.Control
          className="me-auto"
          type="text"
          placeholder={`Add ${
            props.authAccountType === 'Accounts' ? 'Account' : 'Key'
          }`}
        />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">Weight</InputGroup.Text>
        <Form.Control
          type="number"
          min="1"
          step="1"
          className="form-control"
          id="weightInput"
          placeholder={'2'}
        />
      </InputGroup>
      <Button className="mb-3" variant="outline-primary">
        Add{' '}
      </Button>
    </Stack>
  );
}
export function AuthorityCard(props: IAuthorityCardProps) {
  const accounts: IAccountKeysCardProps = {
    authorityName: props.authorityName,
    authAccountType: 'Accounts',
    accountKeyAuths: props.authority.account_auths,
  };
  let keyAuths: [string, number][] = [];
  const castToString = ([k, w]: [string | Hive.PublicKey, number]) => {
    keyAuths.push([k.toString(), w]);
  };
  props.authority.key_auths.forEach((e) => {
    castToString(e);
  });
  const keys: IAccountKeysCardProps = {
    authorityName: props.authorityName,
    authAccountType: 'Keys',
    accountKeyAuths: keyAuths,
  };
  const thresh: IAuthorityThreshProps = {
    authorityName: props.authorityName,
    threshold: props.authority.weight_threshold,
  };
  return (
    <Card>
      <Container>
        <Card.Body>
          <Card.Title>{props.authorityName}</Card.Title>
          <Stack gap={2}>
            <AccountKeysCard
              authorityName={props.authorityName}
              authAccountType={accounts.authAccountType}
              accountKeyAuths={accounts.accountKeyAuths}
            />
            <AccountKeysCard
              authorityName={props.authorityName}
              authAccountType={keys.authAccountType}
              accountKeyAuths={keys.accountKeyAuths}
            />
            <AuthorityWeightThreshold
              authorityName={props.authorityName}
              threshold={thresh.threshold}
            />
          </Stack>
        </Card.Body>
      </Container>
    </Card>
  );
}
function useAppSelector(arg0: (state: any) => any) {
  throw new Error('Function not implemented.');
}
