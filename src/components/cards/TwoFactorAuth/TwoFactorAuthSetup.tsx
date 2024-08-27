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
import { IDeleteAccount } from '../../../interfaces/cardInterfaces';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import {
  botSetupSuccess,
  setAddedBot,
  setIsMultisigTransaction,
  setTwoFABots,
  transactionSubmitted,
} from '../../../redux/features/twoFactorAuth/twoFactorAuthThunks';
import { initializeAuthorities } from '../../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import {
  allowAddAccount,
  allowDeleteOnlyBot,
  allowEdit,
  deleteAccount,
  disableDeleteBtn,
  updateActive,
} from '../../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import { MultisigUtils } from '../../../utils/multisig.utils';
import { CustomTwoFactorAuthSetup } from './CustomTwoFactorAuthSetup';
import { DefaultTwoFactorAuthSetup } from './DefaultTwoFactorAuthSetup';
import { MultisigTwoFAHooks } from './Multisig2FAHooks';
import { TwoFAConfirmation } from './TwoFAConfirmation';
const defaultBot = process.env.TWOFA_BOT;

export const TwoFactorAuthSetup = () => {
  const [key, setKey] = useState('default');
  const dispatch = useAppDispatch();
  const [addedActiveAuthorities, latestAddedActiveAuthority] =
    MultisigTwoFAHooks.useAddedActiveAuthority();
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
  const originalAuthorities = useAppSelector(
    (state) => state.updateAuthorities.Authorities,
  );
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);
  const [botToBeAdded, setBotTobeAdded] = useState<[string, number]>([
    defaultBot,
    1,
  ]);
  const [disableSubmitBtn, setDisableSubmitBtn] = useState(false);
  const [accountEdited] = MultisigTwoFAHooks.useAccountEditedFlag();
  const [ownerKeyCheckBoxChecked, setOwnerKeyCheckBox] =
    useState<boolean>(false);
  const [twoFaDisableCheckBoxChecked, setTwoFaDisableCheckBox] =
    useState<boolean>(false);
  const transactionSubmittedFlag = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.transactionSubmitted,
  );
  useEffect(() => {
    setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
  }, []);
  useEffect(() => {
    checkAddedCustomBot();
  }, [latestAddedActiveAuthority]);

  useEffect(() => {
    dispatch(allowAddAccount(addedActiveAuthorities.length === 0));
  }, [addedActiveAuthorities]);

  useEffect(() => {
    setDisableSubmitBtn(
      !(
        accountEdited &&
        ownerKeyCheckBoxChecked &&
        twoFaDisableCheckBoxChecked
      ),
    );
  }, [accountEdited, ownerKeyCheckBoxChecked, twoFaDisableCheckBoxChecked]);

  const handleAddBot = () => {
    MultisigUtils.twoFAConfigBroadcast(
      signedAccountObj.data.username,
      botToBeAdded as [string, number],
      secret,
      transactionState.initiator,
      newAuthorities,
    )
      .then(async (res: string) => {
        dispatch(setIsMultisigTransaction(res.includes('multisig')));
        dispatch(setAddedBot(botToBeAdded));
        dispatch(transactionSubmitted(true));
        dispatch(botSetupSuccess(true));
      })
      .catch((reason) => {
        alert(`Failed to setup Multisig 2FA: ${JSON.stringify(reason)}`);
        dispatch(transactionSubmitted(false));
        dispatch(botSetupSuccess(false));
        window.location.reload();
      });
  };

  const checkAddedCustomBot = async () => {
    const latest = latestAddedActiveAuthority
      ? latestAddedActiveAuthority
      : undefined;
    if (latest) {
      const username = latest[0];
      const weight = latest[1];
      const isMultisigBot = latest[2] === 'bot';
      if (key === 'custom' && username !== defaultBot) {
        if (!isMultisigBot) {
          alert(
            `You are adding ${latest[0]} that is not configured as a 2FA Bot`,
          );
          const accountToDelete: IDeleteAccount = {
            type: 'active',
            username: username as string,
            authorities: newAuthorities,
          };
          dispatch(deleteAccount(accountToDelete));
          setBotTobeAdded(undefined);
        } else {
          setBotTobeAdded([username, weight] as [string, number]);
          dispatch(setTwoFABots([[username as string, key]]));
        }
      } else if (username === defaultBot) {
        dispatch(setTwoFABots([[username as string, key]]));
      }
    }
  };

  const handleUpdateAccount = () => {
    if (thresholdWarning !== '') {
      alert(`Invalid Threshold: ${thresholdWarning}`);
    } else {
      handleAddBot();
    }
  };

  const updateUseBot = async (use: boolean) => {
    if (originalAuthorities) {
      let newActive = structuredClone(originalAuthorities.active);
      if (use) {
        newActive.account_auths.push([defaultBot, 1]);
        newActive.weight_threshold += 1;
      }
      setBotTobeAdded([defaultBot, 1]);

      await dispatch(updateActive(newActive));
    }
  };

  useEffect(() => {
    dispatch(initializeAuthorities(originalAuthorities));
    setOwnerKeyCheckBox(false);
    setTwoFaDisableCheckBox(false);
    switch (key) {
      case 'default':
        if (originalAuthorities) {
          if (!hasDefaultBot) {
            updateUseBot(true);
          }
        }
        dispatch(allowEdit(false));
        dispatch(disableDeleteBtn(true));
        dispatch(allowAddAccount(false));
        dispatch(allowDeleteOnlyBot(false));

        break;
      case 'custom':
        if (originalAuthorities) {
          if (!hasDefaultBot) {
            updateUseBot(false);
          }
        }
        dispatch(allowEdit(true));
        dispatch(disableDeleteBtn(true));
        dispatch(allowAddAccount(true));
        dispatch(allowDeleteOnlyBot(true));
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

  return transactionSubmittedFlag ? (
    <TwoFAConfirmation />
  ) : (
    <Container>
      <Row className="justify-content-md-center">
        <Col>
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
                    <DefaultTwoFactorAuthSetup isManageTwoFA={false} />
                  </Tab>

                  <Tab eventKey="custom" title="Custom">
                    <CustomTwoFactorAuthSetup isManageTwoFA={false} />
                  </Tab>
                </Tabs>
              </Card.Body>
              <div>
                <div className="ms-3 me-3">
                  <Form>
                    <Form.Check
                      onChange={(e) => {
                        handleOwnerKeyAgreement(e.target.checked);
                      }}
                      checked={ownerKeyCheckBoxChecked}
                      type={'checkbox'}
                      id={`owner-key-agreement`}
                      label={`My account @${signedAccountObj.data.username} owner key is safely stored offline`}></Form.Check>
                    <Form.Check
                      onChange={(e) => {
                        handle2faDisablingAgreement(e.target.checked);
                      }}
                      checked={twoFaDisableCheckBoxChecked}
                      type={'checkbox'}
                      id={`2fa-disabling-agreement`}
                      label={`I understand that I will need either my owner key, or my active key and a valid One Time Password (OTP) to disable the 2FA`}></Form.Check>
                  </Form>
                </div>
                <div className="d-flex justify-content-end mb-3 me-3 rem-10">
                  <Button
                    onClick={() => {
                      handleUpdateAccount();
                    }}
                    className=""
                    variant="success"
                    disabled={disableSubmitBtn}>
                    Submit
                  </Button>
                </div>
              </div>
            </Container>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
