import * as Hive from '@hiveio/dhive';
import { HiveMultisig } from 'hive-multisig-sdk/src';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Tab,
  Tabs,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import {
  allowAddAccount,
  allowEdit,
  disableDeleteBtn,
  updateActive,
} from '../../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import AccountUtils from '../../../utils/hive.utils';
import { MultisigUtils } from '../../../utils/multisig.utils';
import { CustomTwoFactorAuthSetup } from './CustomTwoFactorAuthSetup';
import { DefaultTwoFactorAuthSetup } from './DefaultTwoFactorAuthSetup';
import { MultisigTwoFAHooks } from './Multisig2FAHooks';
const defaultBot = process.env.BOT;

export const TwoFactorAuthSetup = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState('default');
  const dispatch = useAppDispatch();
  const [originalActive, newActive] = MultisigTwoFAHooks.useActiveAuthority();
  const [thresholdWarning] = MultisigTwoFAHooks.useWeightRestriction();
  const [multisigInitiator] = MultisigTwoFAHooks.useMultisigInitiatorHandler();
  const hasDefaultBot = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.hasDefaultBot,
  );
  const secret = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.secret,
  );
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);
  const [activeAuth, setActiveAuth] = useState<Hive.Authority>(undefined);
  const [ownerKeyCheckBoxChecked, setOwnerKeyCheckBox] =
    useState<boolean>(false);
  const [twoFaDisableCheckBoxChecked, setTwoFaDisableCheckBox] =
    useState<boolean>(false);
  const getActiveAuth = async () => {
    const auth = await AccountUtils.getActiveAuthorities(
      signedAccountObj.data.username,
    );
    if (auth) {
      setActiveAuth(auth.active);
    }
  };

  useEffect(() => {
    setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
    getActiveAuth();
  }, []);

  const handleUpdateAccount = () => {
    if (thresholdWarning !== '') {
      alert(`Invalid Threshold: ${thresholdWarning}`);
    } else if (
      !newAuthorities.active.account_auths.find((e) => e[0] === defaultBot)
    ) {
      alert(`Please add bot ${defaultBot} to your active authority`);
    } else {
      MultisigUtils.twoFAConfigBroadcast(
        signedAccountObj.data.username,
        [defaultBot, 1] as [string, number],
        secret,
        transactionState.initiator,
        newAuthorities,
      )
        .then(async (res) => {
          if (confirm('Multisig 2FA Setup Success!')) {
            navigate('/');
          }
        })
        .catch((reason) => {
          alert(`Failed to setup Multisig 2FA: ${JSON.stringify(reason)}`);
          navigate('/twoFactor');
        });
    }
  };

  const updateUseBot = async (use: boolean) => {
    console.log({ activeAuth });
    if (activeAuth) {
      let auth = structuredClone(activeAuth);
      if (use) {
        auth.account_auths.push([defaultBot, 1]);
        auth.weight_threshold += 1;
      } else {
        auth.account_auths = activeAuth.account_auths.filter(
          (acc) => acc[0] !== defaultBot,
        );
      }
      await dispatch(updateActive(auth));
    }
  };
  useEffect(() => {
    if (activeAuth) {
      if (!hasDefaultBot) {
        updateUseBot(true);
      }
    }
  }, [activeAuth]);

  useEffect(() => {
    switch (key) {
      case 'default':
        if (activeAuth) {
          if (!hasDefaultBot) {
            updateUseBot(true);
          }
        }
        dispatch(allowEdit(false));
        dispatch(disableDeleteBtn(true));
        dispatch(allowAddAccount(false));

        break;
      case 'custom':
        if (activeAuth) {
          if (!hasDefaultBot) {
            updateUseBot(false);
          }
        }
        dispatch(allowEdit(true));
        dispatch(disableDeleteBtn(false));
        dispatch(allowAddAccount(true));
        console.log('custom');
        break;
    }
  }, [key]);

  const handleOwnerKeyAgreement = (value: any) => {
    setOwnerKeyCheckBox(value);
  };
  const handle2faDisablingAgreement = (value: any) => {
    setTwoFaDisableCheckBox(value);
  };
  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="auto" lg="7">
          <Card border="secondary">
            <Container>
              <Card.Body>
                <h3 className="card-title text-center">Multisig 2FA Setup</h3>
                <Tabs
                  mountOnEnter={true}
                  id="controlled-tab"
                  activeKey={key}
                  onSelect={(k) => setKey(k)}
                  className="mb-3">
                  <Tab eventKey="default" title="Default">
                    <DefaultTwoFactorAuthSetup />
                  </Tab>

                  <Tab eventKey="custom" title="Custom">
                    <CustomTwoFactorAuthSetup />
                  </Tab>
                </Tabs>
              </Card.Body>
              {hasDefaultBot && key === 'default' ? (
                ''
              ) : (
                <div>
                  <div className="ms-3 me-3">
                    <Form>
                      <Form.Check
                        onChange={(e) => {
                          handleOwnerKeyAgreement(e.target.checked);
                        }}
                        type={'checkbox'}
                        id={`owner-key-agreement`}
                        label={`My account @${signedAccountObj.data.username} owner key is safely stored offline`}></Form.Check>
                      <Form.Check
                        onChange={(e) => {
                          handle2faDisablingAgreement(e.target.checked);
                        }}
                        type={'checkbox'}
                        id={`2fa-disabling-agreement`}
                        label={`I understand that I will need either my owner key, or my active key and a valid One Time Password (OTP) to disable the 2FA`}></Form.Check>
                    </Form>
                  </div>
                  <div className="d-flex justify-content-end mb-3 me-3">
                    <Button
                      onClick={() => {
                        handleUpdateAccount();
                      }}
                      className=""
                      variant="success"
                      disabled={
                        !ownerKeyCheckBoxChecked || !twoFaDisableCheckBoxChecked
                      }>
                      Submit
                    </Button>
                  </div>
                </div>
              )}
            </Container>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
