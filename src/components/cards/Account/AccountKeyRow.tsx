import { FC, useEffect, useState } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { Authorities } from '../../../interfaces/account.interface';
import {
  IAccountKeyRowProps,
  IDeleteAccount,
  IDeleteKey,
} from '../../../interfaces/cardInterfaces';
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
}) => {
  const [color, setColor] = useState<string>(componentColor);
  const [warningText, setWarningText] = useState<string>('');
  const [outlineColor, setOutlineColor] =
    useState<string>('gray-input-outline');
  const [deleteComponentKey, setDeleteComponentKey] = useState<string>();
  const [weight, setWeight] = useState<number>(accountKeyAuth[1]);
  const [newAuth, setNewAuth] = useState<[string, number]>(accountKeyAuth);
  const dispatch = useAppDispatch();
  const newAuthorities: Authorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );

  const accountWarning: [string, string][] = useAppSelector(
    (state) => state.updateAuthorities.accountRowWarning,
  );
  const keyWarning: [string, string][] = useAppSelector(
    (state) => state.updateAuthorities.keyRowWarning,
  );

  useEffect(() => {
    switch (type.toLowerCase()) {
      case 'accounts':
        const accWarn = accountWarning.filter(
          (acc) => acc[0] === accountKeyAuth[0],
        );
        if (accWarn.length > 0 && accWarn[0][1] !== '') {
          setWarningText(accWarn[0][1]);
        } else {
          setWarningText('');
        }
        break;
      case 'keys':
        const keyWarn = keyWarning.filter(
          (key) => key[0] === accountKeyAuth[0],
        );
        if (keyWarn.length > 0 && keyWarn[0][1] !== '') {
          setWarningText(keyWarn[0][1]);
        } else {
          setWarningText('');
        }
        break;
    }
  }, [accountWarning, keyWarning]);

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
  const handleUpdate = (v: number) => {
    setWeight(v);
  };
  const handleDelete = () => {
    setDeleteComponentKey(accountKeyAuth[0]);
  };

  return (
    <div className="mb-3">
      <Container>
        <Row>
          <Col>
            <div className="text-danger">{warningText}</div>
            <InputGroup>
              <InputGroup.Text className={outlineColor}>
                {type === 'Accounts' ? '@' : <i className="fa fa-lock"></i>}
              </InputGroup.Text>
              <Form.Control
                className={`${outlineColor} `}
                type="text"
                placeholder={accountKeyAuth[0].toString()}
                value={accountKeyAuth[0]}
                readOnly
              />
              <InputGroup.Text className={outlineColor}>Weight</InputGroup.Text>
              <Form.Control
                type={'number'}
                min="1"
                step="1"
                className={`form-control ${outlineColor}`}
                id="weightInput"
                onChange={(e) => handleUpdate(parseInt(e.target.value))}
                placeholder={weight.toString()}
                value={weight}
              />
              <Button
                className="col-md-3 mx-auto"
                variant="outline-danger"
                onClick={() => {
                  handleDelete();
                }}>
                Delete
              </Button>
            </InputGroup>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
