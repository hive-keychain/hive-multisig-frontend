import { FC, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
} from 'react-bootstrap';
import { Authorities } from '../../../interfaces/account.interface';
import {
  IAccountKeyRowProps,
  IDeleteAccount,
  IDeleteKey,
} from '../../../interfaces/cardInterfaces';
import { MiltisigAuthorityTypes } from '../../../interfaces/multisig.interface';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import { updateAccount } from '../../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import {
  deleteAccount,
  deleteKey,
  setActiveKeyDelete,
  setOwnerKeyDelete,
  setPostingKeyDelete,
} from '../../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import { useDidMountEffect } from '../../../utils/utils';

export const AccountKeyRow: FC<IAccountKeyRowProps> = ({
  authorityName,
  type,
  accountKeyAuth,
  componentColor,
  disableDelete = false,
  enableEdit = true,
}) => {
  const [color, setColor] = useState<string>(componentColor);
  const [warningText, setWarningText] = useState<string>('');
  const [outlineColor, setOutlineColor] =
    useState<string>('gray-input-outline');
  const [deleteComponentKey, setDeleteComponentKey] = useState<string>();
  const [weight, setWeight] = useState<number>(accountKeyAuth[1]);
  const [newAuth, setNewAuth] = useState<[string, number]>(accountKeyAuth);
  const [readOnly, setReadOnly] = useState<boolean>(!enableEdit);
  const dispatch = useAppDispatch();
  const newAuthorities: Authorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );

  const bots = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.bots,
  );
  const [multisigBotType, setMultisigBotType] = useState('');

  const accountWarning: [string, string][] = useAppSelector(
    (state) => state.updateAuthorities.accountRowWarning,
  );
  const keyWarning: [string, string][] = useAppSelector(
    (state) => state.updateAuthorities.keyRowWarning,
  );

  useEffect(() => {
    setReadOnly(!enableEdit);
  }, [enableEdit]);

  useEffect(() => {
    switch (type.toLowerCase()) {
      case 'accounts':
        const accWarn = accountWarning?.filter(
          (acc) => acc[0] === accountKeyAuth[0],
        );
        if (accWarn?.length > 0 && accWarn[0][1] !== '') {
          setWarningText(accWarn[0][1]);
        } else {
          setWarningText('');
        }
        break;
      case 'keys':
        const keyWarn = keyWarning?.filter(
          (key) => key[0] === accountKeyAuth[0],
        );
        if (keyWarn?.length > 0 && keyWarn[0][1] !== '') {
          setWarningText(keyWarn[0][1]);
        } else {
          setWarningText('');
        }
        break;
    }
  }, [accountWarning, keyWarning]);

  useEffect(() => {
    if (bots) {
      const index = bots.findIndex((bot) => bot[0] === accountKeyAuth[0]);
      const bot = bots[index];
      if (bot)
        if (bot[1] === 'default') {
          setMultisigBotType(MiltisigAuthorityTypes.MULTISIG_BOT);
        } else if (bot[1] === 'custom') {
          setMultisigBotType(MiltisigAuthorityTypes.CUSTOM_BOT);
        } else {
          setMultisigBotType('');
        }
    }
  }, [accountKeyAuth[0], bots]);

  useEffect(() => {
    switch (color) {
      case 'red':
        setOutlineColor('red-input-outline');
        break;
      case 'blue':
        setOutlineColor('blue-input-outline');
        break;
      default:
        setOutlineColor('gray-input-outline');
        break;
    }
  }, [color]);

  useDidMountEffect(() => {
    if (weight !== accountKeyAuth[1]) {
      setColor('blue');
    } else {
      setColor('gray');
    }
    setNewAuth([accountKeyAuth[0], weight]);
  }, [weight]);

  useDidMountEffect(() => {
    if (newAuth) {
      const payload: IAccountKeyRowProps = {
        authorityName,
        type,
        accountKeyAuth: [...newAuth],
        disableDelete,
      };
      dispatch(updateAccount(payload));
    }
  }, [newAuth]);

  useDidMountEffect(() => {
    if (deleteComponentKey !== '') {
      switch (type.toLowerCase()) {
        case 'accounts':
          const accountToDelete: IDeleteAccount = {
            type: authorityName,
            username: newAuth[0],
            authorities: newAuthorities,
          };
          dispatch(deleteAccount(accountToDelete));
          break;
        case 'keys':
          const keyToDelete: IDeleteKey = {
            type: authorityName,
            key: newAuth[0],
            authorities: newAuthorities,
          };
          dispatch(deleteKey(keyToDelete));
          dispatchDeletedKey(keyToDelete);
          break;
      }

      setDeleteComponentKey('');
    }
  }, [deleteComponentKey]);

  const dispatchDeletedKey = (keyToDelete: IDeleteKey) => {
    switch (keyToDelete.type.toLowerCase()) {
      case 'owner':
        dispatch(setOwnerKeyDelete(true));
        break;
      case 'active':
        dispatch(setActiveKeyDelete(true));
        break;
      case 'posting':
        dispatch(setPostingKeyDelete(true));
        break;
    }
  };
  const handleUpdateWeight = (weight: number) => {
    if (weight > 0) setWeight(weight);
  };
  const handleDelete = () => {
    setDeleteComponentKey(accountKeyAuth[0]);
  };

  return (
    <div className="mb-3">
      <Container>
        {multisigBotType !== '' ? (
          <Badge className="mb-1" bg="info">
            {`${multisigBotType}`}
          </Badge>
        ) : (
          ''
        )}
        <Row>
          <div className="text-danger">{warningText}</div>

          <Col>
            <InputGroup>
              <InputGroup.Text className={outlineColor}>
                {type === 'Accounts' ? '@' : <i className="fa fa-lock"></i>}
              </InputGroup.Text>
              <Form.Control
                className={`${outlineColor} account-key-row-button`}
                type="text"
                placeholder={accountKeyAuth[0].toString()}
                value={accountKeyAuth[0]}
                readOnly={readOnly}
              />
            </InputGroup>
          </Col>
          <Col>
            <InputGroup>
              <InputGroup.Text className={outlineColor}>Weight</InputGroup.Text>
              <Form.Control
                type={'number'}
                min="1"
                step="1"
                className={`form-control ${outlineColor}`}
                id="weightInput"
                onChange={(e) => handleUpdateWeight(parseInt(e.target.value))}
                placeholder={weight.toString()}
                value={weight}
                readOnly={readOnly}
              />
            </InputGroup>
          </Col>

          <Col>
            {disableDelete ? (
              ''
            ) : (
              <Button
                className="account-key-row-button"
                variant="outline-danger"
                onClick={() => {
                  handleDelete();
                }}
                disabled={disableDelete}>
                Delete
              </Button>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};
