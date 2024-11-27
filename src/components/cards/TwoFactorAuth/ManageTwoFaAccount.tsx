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
import { IAccountKeyRowProps } from '../../../interfaces/cardInterfaces';
import { IExpiration } from '../../../interfaces/transaction.interface';
import { TwoFACodes } from '../../../interfaces/twoFactorAuth.interface';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import { setTwoFASigners } from '../../../redux/features/multisig/multisigThunks';
import {
  isManageTwoFA,
  removeBotSuccess,
  setIsMultisigTransaction,
  setRemovedBot,
  transactionSubmitted,
  updateThreshSuccess,
  updateWeightSuccess,
} from '../../../redux/features/twoFactorAuth/twoFactorAuthThunks';
import {
  initializeAuthorities,
  updateAccount,
} from '../../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import {
  allowAddActiveAccount,
  allowAddKey,
  allowDeleteOnlyBot,
  allowEdit,
  disableDeleteBtn,
  setThresholdWarning,
} from '../../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import HiveTxUtils from '../../../utils/hivetx.utils';
import { MultisigUtils } from '../../../utils/multisig.utils';
import { OtpModal } from '../../modals/OtpModal';
import { CustomTwoFactorAuthSetup } from './CustomTwoFactorAuthSetup';
import { DefaultTwoFactorAuthSetup } from './DefaultTwoFactorAuthSetup';
import { MultisigTwoFAHooks } from './Multisig2FAHooks';
import { TwoFAConfirmation } from './TwoFAConfirmation';
var deepequal = require('deep-equal');
const defaultBot = process.env.TWOFA_BOT;
export const ManageTwoFaAccount = () => {
  const dispatch = useAppDispatch();
  const multisig = useMultisigState();

  const [suggestedThreshold] = useSuggestNewThreshold();
  const [askOtp, setAskOtp] = useState<boolean>(false);
  const [key, setKey] = useState('default');
  const [deletedActiveAuthority] =
    MultisigTwoFAHooks.useDeletedActiveAuthority();
  const twoFASigners = useAppSelector(
    (state) => state.multisig.multisig.twoFASigners,
  );
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  const thresholdWarning = useAppSelector(
    (state) => state.updateAuthorities.thresholdWarning,
  );
  const bots = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.bots,
  );
  const originalAuthorities = useAppSelector(
    (state) => state.updateAuthorities.Authorities,
  );
  const transactionSubmittedFlag = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.transactionSubmitted,
  );
  const [accountRemoved, threshEdited, weightUpdated] =
    MultisigTwoFAHooks.useAccountEditedFlag();
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const hasDefaultBot = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.hasDefaultBot,
  );
  const [ownerKeyCheckBoxChecked, setOwnerKeyCheckBox] =
    useState<boolean>(false);
  const [twoFaDisableCheckBoxChecked, setTwoFaDisableCheckBox] =
    useState<boolean>(false);
  useEffect(() => {
    allowRemoveBot();
    dispatch(isManageTwoFA(true));
    initi2FASigners();
  }, []);
  const [disableSubmitBtn, setDisableSubmitBtn] = useState(false);

  useEffect(() => {
    handleOnTabChanged();
  }, [key]);
  useEffect(() => {
    if (suggestedThreshold) {
      console.log({ suggestedThreshold });
      dispatch(
        setThresholdWarning(
          'You may not set a threshold bigger than the sum of the authority weights. ' +
            `Please increase the weights of your authorities or decrease the threshold to ${suggestedThreshold}`,
        ),
      );
    } else {
      dispatch(setThresholdWarning(``));
    }
  }, [suggestedThreshold]);

  useEffect(() => {
    console.log({ deletedActiveAuthority });
    handleDefaultBotReduceThresh();
  }, [deletedActiveAuthority]);

  useEffect(() => {
    setDisableSubmitBtn(
      !(
        (accountRemoved || threshEdited || weightUpdated) &&
        ownerKeyCheckBoxChecked &&
        twoFaDisableCheckBoxChecked
      ),
    );
  }, [
    accountRemoved,
    threshEdited,
    weightUpdated,
    ownerKeyCheckBoxChecked,
    twoFaDisableCheckBoxChecked,
  ]);

  useEffect(() => {
    dispatch(removeBotSuccess(accountRemoved));
    dispatch(updateThreshSuccess(threshEdited));
    dispatch(updateWeightSuccess(weightUpdated));
  }, [accountRemoved, threshEdited, weightUpdated]);

  const initi2FASigners = async () => {
    if (bots) {
      let botSigners: TwoFACodes = {};
      for (let i = 0; i < bots.length; i++) {
        botSigners[bots[i][0]] = '';
      }
      dispatch(setTwoFASigners(botSigners));
    }
  };
  const allowRemoveBot = async () => {
    dispatch(allowAddKey(false));
    dispatch(allowAddActiveAccount(false));
    dispatch(disableDeleteBtn(true));
    dispatch(allowDeleteOnlyBot(true));
    dispatch(allowEdit(key !== 'default'));
  };
  const handleOtpSubmit = async () => {
    try {
      const updateAccountOp = await MultisigUtils.getUpdateAccountOp(
        newAuthorities,
      );
      const tx = await HiveTxUtils.createTx([updateAccountOp], {
        date: undefined,
        minutes: 60,
      } as IExpiration);

      MultisigUtils.broadcastTransaction(
        tx,
        signedAccountObj.data.username,
        transactionState.initiator,
        twoFASigners,
      )
        .then((res: string) => {
          dispatch(setIsMultisigTransaction(res.includes('multisig')));
          dispatch(transactionSubmitted(true));
          dispatch(setRemovedBot(deletedActiveAuthority as [string, number]));
        })
        .catch((e) => {
          alert(e);
          dispatch(transactionSubmitted(false));
          window.location.reload();
        });
    } catch (error) {
      alert(error);
      window.location.reload();
    }
  };

  const handleDefaultBotReduceThresh = () => {
    if (deletedActiveAuthority && deletedActiveAuthority[0] === defaultBot) {
      const payload: IAccountKeyRowProps = {
        type: 'threshold',
        authorityName: 'active',
        threshold:
          originalAuthorities.active.weight_threshold -
          deletedActiveAuthority[1],
      };
      dispatch(updateAccount(payload));
    }
  };

  const handleUpdateAccount = async () => {
    if (thresholdWarning !== '') {
      alert(`Invalid Threshold: ${thresholdWarning}`);
    }
    setAskOtp(true);
  };
  const handleReset = async () => {
    dispatch(initializeAuthorities(originalAuthorities));
    setOwnerKeyCheckBox(false);
    setTwoFaDisableCheckBox(false);
  };

  const handleOwnerKeyAgreement = (value: any) => {
    setOwnerKeyCheckBox(value);
  };
  const handle2faDisablingAgreement = (value: any) => {
    setTwoFaDisableCheckBox(value);
  };

  const handleOnTabChanged = () => {
    handleReset();
    switch (key) {
      case 'default':
        dispatch(allowEdit(false));

        break;
      case 'custom':
        dispatch(allowEdit(true));
        break;
    }
  };

  return transactionSubmittedFlag ? (
    <TwoFAConfirmation />
  ) : (
    <Container>
      <div>
        <OtpModal handleSubmit={handleOtpSubmit} show={askOtp} />
      </div>
      <Row className="justify-content-md-center">
        <Col>
          <Card border="secondary">
            <Container>
              <Card.Body>
                <h3 className="card-title text-center">
                  Manage Multisig 2FA Bot
                </h3>
                <Tabs
                  mountOnEnter={true}
                  id="controlled-tab"
                  activeKey={key}
                  onSelect={(k) => setKey(k)}
                  className="mb-3">
                  <Tab eventKey="default" title="Default">
                    <DefaultTwoFactorAuthSetup isManageTwoFA={true} />
                  </Tab>

                  <Tab eventKey="custom" title="Custom">
                    <CustomTwoFactorAuthSetup isManageTwoFA={true} />
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
                      type={'checkbox'}
                      id={`owner-key-agreement`}
                      label={`My account @${signedAccountObj.data.username} owner key is safely stored offline`}
                      checked={ownerKeyCheckBoxChecked}></Form.Check>
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
                  {accountRemoved ? (
                    <Button
                      onClick={() => {
                        handleReset();
                      }}
                      variant="danger">
                      Reset
                    </Button>
                  ) : (
                    ''
                  )}
                  <Button
                    onClick={() => {
                      handleUpdateAccount();
                    }}
                    className="ms-2"
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

const useSuggestNewThreshold = () => {
  const [originalActive, newActive] = MultisigTwoFAHooks.useActiveAuthority();
  const [suggestedThreshold, setSuggestedThreshold] = useState(undefined);

  useEffect(() => {
    if (newActive) {
      if (!deepequal(originalActive, newActive, { strict: true })) {
        const newThresh = suggestNewThreshold(newActive);
        setSuggestedThreshold(newThresh);
      }
    }
  }, [newActive]);

  return [suggestedThreshold];
};

const suggestNewThreshold = (activeAuthority: Hive.AuthorityType) => {
  if (activeAuthority) {
    const currentThresh = activeAuthority.weight_threshold;
    const totalActiveWeight = activeAuthority.account_auths.reduce(
      (total, account) => total + account[1],
      0,
    );
    const totalKeyWeight = activeAuthority.key_auths.reduce(
      (total, key) => total + key[1],
      0,
    );
    const totalWeight = totalActiveWeight + totalKeyWeight;
    if (currentThresh > totalWeight) {
      return totalWeight;
    } else {
      return undefined;
    }
  }
};

const useMultisigState = () => {
  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);

  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  useEffect(() => {
    if (signedAccountObj) {
      setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
    }
  }, []);
  return multisig;
};
