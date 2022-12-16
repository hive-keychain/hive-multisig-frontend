import * as Hive from '@hiveio/dhive';
import { ReactNode, useState } from 'react';
import {
  Button,
  Card,
  Container,
  Form,
  InputGroup,
  Stack,
} from 'react-bootstrap';
import { useAppDispatch } from '../../redux/app/hooks';
import { updateAccount } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import { useDidMountEffect } from '../../utils/utils';

export interface IAccountKeyRowProps {
  authorityName: string;
  type: string;
  accountKeyAuth?: [string, number];
  threshold?: number;
}
 interface IAccountKeysCardProps {
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



export function AccountKeyRow({
  authorityName,
  type,
  accountKeyAuth,
}: IAccountKeyRowProps) {
  const [editFlag, setEdiFlag] = useState<string>('text-body');
  const [deleteAccKeyAuth, setDeleteAccKeyAuth] = useState<string>();
  const [weight, setWeight] = useState<number>(accountKeyAuth[1]);
  const [newAuth, setNewAuth] = useState<[string,number]>(accountKeyAuth);
  const dispatch = useAppDispatch();
 

  useDidMountEffect(()=> {
    if (weight !== accountKeyAuth[1]) {
      setEdiFlag('text-danger');
    } else {
      setEdiFlag('text-body');
    }
    setNewAuth([accountKeyAuth[0],weight]);
  },[weight])

  useDidMountEffect(()=>{
    if(newAuth){
      const payload: IAccountKeyRowProps = {
        authorityName,
        type,
        accountKeyAuth: [...newAuth]
      }
      dispatch(updateAccount(payload));
    }
  },[newAuth])
 
  const handleUpdate = (v:number) =>{
    setWeight(v);
  }
  const handleDelete = () => {
    setDeleteAccKeyAuth(accountKeyAuth[0]);
  };

  return (
    <Stack direction="horizontal" gap={3}>
      <InputGroup className="mb-3 ">
        <InputGroup.Text id="basic-addon1">
          {type === 'Accounts' ? (
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
          onChange={(e) => handleUpdate(parseInt(e.target.value))}
          placeholder={weight.toString()}
          value={weight}
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
                  type={authAccountType}
                  accountKeyAuth={accountKeyAuth}
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

export function AuthorityWeightThreshold({authorityName, type, threshold}: IAccountKeyRowProps) {
  const [weight, setNewWeightThresh] = useState<number>(threshold);
  const [editFlag, setEdiFlag] = useState<string>('text-body');
  const dispatch = useAppDispatch();
  useDidMountEffect(() => {
    if (weight !== threshold) {
      setEdiFlag('text-danger');
    } else {
      setEdiFlag('text-body');
    }
    const payload:IAccountKeyRowProps ={
      authorityName,
      type,
      threshold: weight
    }
    dispatch(updateAccount(payload));
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
          placeholder={weight.toString()}
          value={weight}
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
          placeholder={'1'}
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
  const thresh: IAccountKeyRowProps = {
    type: 'threshold',
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
              type={thresh.type}
              authorityName={thresh.authorityName}
              threshold={thresh.threshold}
            />
          </Stack>
        </Card.Body>
      </Container>
    </Card>
  );
}
