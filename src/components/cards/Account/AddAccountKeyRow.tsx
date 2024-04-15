import * as Hive from '@hiveio/dhive';
import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import { LoginResponseType } from '../../../interfaces';
import { IAddAccountKeyProps } from '../../../interfaces/cardInterfaces';
import AccountUtils from '../../../utils/hive.utils';
import { useDidMountEffect } from '../../../utils/utils';
import NewKeys from '../../modals/NewKeys';

export function AddAccountKeyRow({
  authAccountType,
  setNewAccount,
}: IAddAccountKeyProps) {
  let loggedInAccount =
    useReadLocalStorage<LoginResponseType>('accountDetails');
  const [user, setUser] = useState<LoginResponseType>(loggedInAccount);
  const [accountName, setAccountName] = useState<string>('');
  const [weight, setAccountWeight] = useState<number>(1);
  const [privateKey, setPrivateKey] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('');
  const [isKeysCoppied, setIsKeysCoppied] = useState<boolean>(false);
  const [showNewKeys, setShowNewKeys] = useState<boolean>(false);
  useEffect(() => {
    setUser(loggedInAccount);
  }, [user]);
  useEffect(() => {
    setAccountName(publicKey);
  }, [publicKey]);

  useDidMountEffect(() => {
    if (privateKey !== '') {
      setShowNewKeys(true);
    }
  }, [privateKey]);

  useEffect(() => {
    if (!showNewKeys && isKeysCoppied) {
      handleAddOnClick();
    }
  }, [showNewKeys, isKeysCoppied]);

  const handleAddOnClick = () => {
    if (accountName !== '') {
      setNewAccount([accountName, weight]);
      setAccountName('');
      setAccountWeight(1);
    }
  };
  const handleNewKeyOnClick = () => {
    const pvtKey: Hive.PrivateKey = AccountUtils.getPrivateKeyFromSeed(
      user.data.username + Date.now() + Math.random(),
    );
    const pubKey: Hive.PublicKey = pvtKey.createPublic();
    setPrivateKey(pvtKey.toString());
    setPublicKey(pubKey.toString());
  };
  return (
    <div>
      <div>
        <NewKeys
          show={showNewKeys}
          setShowNewKeys={setShowNewKeys}
          setKeysCoppied={setIsKeysCoppied}
          publicKey={publicKey}
          privateKey={privateKey}
        />
      </div>
      <div>
        <Container>
          <Row>
            <Col>
              <InputGroup>
                <InputGroup.Text>
                  {authAccountType === 'Accounts' ? (
                    '@'
                  ) : (
                    <i className="fa fa-lock"></i>
                  )}
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder={`Add ${
                    authAccountType === 'Accounts' ? 'Account' : 'Key'
                  }`}
                  onChange={(e) => {
                    setAccountName(e.target.value);
                  }}
                  value={accountName}
                />
                <InputGroup.Text>Weight</InputGroup.Text>
                <Form.Control
                  type="number"
                  min="1"
                  step="1"
                  id="weightInput"
                  placeholder={'1'}
                  onChange={(e) => {
                    setAccountWeight(parseInt(e.target.value));
                  }}
                  value={weight}
                />
                {authAccountType === 'Keys' ? (
                  <Button
                    className="col-md-3 mx-auto"
                    variant="outline-secondary"
                    onClick={() => {
                      handleNewKeyOnClick();
                    }}>
                    Get New Key
                  </Button>
                ) : (
                  <div></div>
                )}
                <Button
                  className="col-md-3 mx-auto"
                  variant="outline-primary"
                  onClick={() => {
                    handleAddOnClick();
                  }}>
                  Add
                </Button>
              </InputGroup>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
