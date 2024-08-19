import { HiveMultisig } from 'hive-multisig-sdk/src';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Form, Row, Tab, Tabs } from 'react-bootstrap';
import { IDeleteAccount } from '../../../interfaces/cardInterfaces';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import {
  proceedConfiguration,
  setGranularityBots,
} from '../../../redux/features/granularity/granularityThunks';
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
import { CustomGranularityBotSetup } from './CustomGranularityBotSetup';
import { DefaultGranularityBotSetup } from './DefaultGranularityBotSetup';
import { MultisigGranularityHooks } from './GranularitySetupHooks';
const defaultBot = process.env.BOT;

export const GranularityBotSetup = () => {
  const [key, setKey] = useState<string>('default');
  const dispatch = useAppDispatch();
  const [authorities, setAuthorities] = useState(undefined);
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const proceedMultisig = useAppSelector(
    (state) => state.granularity.granularity.proceedMultisig,
  );
  const transactionSubmittedFlag = useAppSelector(
    (state) => state.granularity.granularity.transactionSubmitted,
  );
  const [addedActiveAuthorities, latestAddedActiveAuthority] =
    MultisigGranularityHooks.useAddedActiveAuthority();
  const hasDefaultGranularityBot = useAppSelector(
    (state) => state.granularity.granularity.hasDefaultBot,
  );
  const [originalAuthorities, newAuthorities] =
    MultisigGranularityHooks.useAuthorities();
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);
  const [botToBeAdded, setBotTobeAdded] = useState<[string, number]>([
    defaultBot,
    1,
  ]);
  const [accountEdited] = MultisigGranularityHooks.useAccountEditedFlag();

  const [ownerKeyCheckBoxChecked, setOwnerKeyCheckBox] =
    useState<boolean>(false);
  const [botDisableCheckBoxChecked, setBotDisableCheckBox] =
    useState<boolean>(false);

  const [disableSubmitBtn, setDisableSubmitBtn] = useState(false);

  // Effects
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
      !(accountEdited && ownerKeyCheckBoxChecked && botDisableCheckBoxChecked),
    );
  }, [accountEdited, ownerKeyCheckBoxChecked, botDisableCheckBoxChecked]);

  useEffect(() => {
    dispatch(initializeAuthorities(originalAuthorities));
    setOwnerKeyCheckBox(false);
    setBotDisableCheckBox(false);
    switch (key) {
      case 'default':
        if (originalAuthorities) {
          if (!hasDefaultGranularityBot) {
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
          if (!hasDefaultGranularityBot) {
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
  // Functions

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
            `You are adding ${latest[0]} that is not configured as a Multisig Bot`,
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
          dispatch(setGranularityBots([[username as string, key]]));
        }
      } else if (username === defaultBot) {
        dispatch(setGranularityBots([[username as string, key]]));
      }
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
  const handleOwnerKeyAgreement = (value: any) => {
    setOwnerKeyCheckBox(value);
  };
  const handleBotDisablingAgreement = (value: any) => {
    setBotDisableCheckBox(value);
  };

  const handleProceedConfiguration = () => {
    dispatch(proceedConfiguration(true));
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Card border="secondary">
          <Container>
            <Card.Body>
              <h3 className="card-title text-center">
                Multisig Granularity Bot Setup
              </h3>
              <Tabs
                mountOnEnter={true}
                id="controlled-tab"
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-3">
                <Tab eventKey="default" title="Default">
                  <DefaultGranularityBotSetup isManageGranularity={false} />
                </Tab>

                <Tab eventKey="custom" title="Custom">
                  <CustomGranularityBotSetup isManageGranularity={false} />
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
                      handleBotDisablingAgreement(e.target.checked);
                    }}
                    checked={botDisableCheckBoxChecked}
                    type={'checkbox'}
                    id={`bot-disabling-agreement`}
                    label={`I understand that I will need either my owner key, or my active key and a valid One Time Password (OTP) to disable the Granularity Bot`}></Form.Check>
                </Form>
              </div>
              <div className="d-flex justify-content-end mb-3 me-3 rem-10">
                <Button
                  onClick={() => {
                    handleProceedConfiguration();
                  }}
                  className=""
                  variant="success"
                  disabled={disableSubmitBtn}>
                  Next
                </Button>
              </div>
            </div>
          </Container>
        </Card>
      </Row>
    </Container>
  );
};
