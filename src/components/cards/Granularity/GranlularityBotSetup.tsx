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
  updatePosting,
} from '../../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import { MultisigUtils } from '../../../utils/multisig.utils';
import { CustomGranularityBotSetup } from './CustomGranularityBotSetup';
import { DefaultGranularityBotSetup } from './DefaultGranularityBotSetup';
import { MultisigGranularityHooks } from './GranularitySetupHooks';
const defaultBot = process.env.GRANULARITY_BOT;

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

  const [addedPostingAuthorities, latestAddedPostingAuthority] =
    MultisigGranularityHooks.useAddedPostingAuthority();

  const granularityBots = useAppSelector(
    (state) => state.granularity.granularity.bots,
  );
  const [originalAuthorities, newAuthorities] =
    MultisigGranularityHooks.useAuthorities();
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);

  const [accountEdited] = MultisigGranularityHooks.useAccountEditedFlag();

  const [ownerKeyCheckBoxChecked, setOwnerKeyCheckBox] =
    useState<boolean>(false);
  const [botDisableCheckBoxChecked, setBotDisableCheckBox] =
    useState<boolean>(false);

  const hasPostingDefaultGBot = useAppSelector(
    (state) => state.granularity.granularity.postingHasExistingGBot,
  );
  const hasActiveDefaultGBot = useAppSelector(
    (state) => state.granularity.granularity.activeHasExistingGBot,
  );
  const [disableSubmitBtn, setDisableSubmitBtn] = useState(false);

  // Effects
  useEffect(() => {
    setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
  }, []);

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
  }, [key]);

  useEffect(() => {
    switch (key) {
      case 'default':
        if (originalAuthorities) {
          upadteUseActiveGBot(true);
          updateUsePostingGBot(true);
        }
        dispatch(allowEdit(false));
        dispatch(disableDeleteBtn(true));
        dispatch(allowAddAccount(false));
        dispatch(allowDeleteOnlyBot(false));

        break;
      case 'custom':
        if (originalAuthorities) {
          upadteUseActiveGBot(false);
          updateUsePostingGBot(false);
        }
        dispatch(allowEdit(true));
        dispatch(disableDeleteBtn(true));
        dispatch(allowAddAccount(true));
        dispatch(allowDeleteOnlyBot(true));
        console.log('custom');
        break;
    }
  }, [key, originalAuthorities]);

  useEffect(() => {
    validateAndAddActiveBot();
  }, [latestAddedActiveAuthority]);

  useEffect(() => {
    validateAndAddPostingBot();
  }, [latestAddedPostingAuthority]);

  // Functions

  const validateAndAddActiveBot = async () => {
    const latest = latestAddedActiveAuthority
      ? latestAddedActiveAuthority
      : undefined;
    if (latest) {
      const [username, weight] = latest;
      const isGranularityBot = latest[2] === 'bot';
      if (key === 'custom' && username !== defaultBot) {
        if (!isGranularityBot) {
          alert(
            `You are adding ${latest[0]} that is not configured as a Granularity Bot`,
          );
          const accountToDelete: IDeleteAccount = {
            type: 'active',
            username: username as string,
            authorities: newAuthorities,
          };
          dispatch(deleteAccount(accountToDelete));
        } else {
          var bots = structuredClone(granularityBots);
          bots.push({
            botName: username as string,
            type: 'custom',
            keyType: 'active',
          });
          dispatch(setGranularityBots(bots));
        }
      } else if (username === defaultBot) {
        var bots = structuredClone(granularityBots);
        bots.push({
          botName: username as string,
          type: 'custom',
          keyType: 'active',
        });
        dispatch(setGranularityBots(bots));
      }
    }
  };
  const validateAndAddPostingBot = async () => {
    const latest = latestAddedPostingAuthority
      ? latestAddedPostingAuthority
      : undefined;

    if (latest) {
      const [username, weight] = latest;
      const isGranularityBot = latest[2] === 'bot';
      // Ensure it's a custom key and not the default bot
      if (key === 'custom' && username !== defaultBot) {
        if (!isGranularityBot) {
          alert(
            `You are adding ${latest[0]} that is not configured as a Granularity Bot`,
          );
          // Delete the unrecognized bot from posting authorities
          const accountToDelete: IDeleteAccount = {
            type: 'posting', // Changed from 'active' to 'posting'
            username: username as string,
            authorities: newAuthorities,
          };

          dispatch(deleteAccount(accountToDelete));
        } else {
          // Add the recognized custom bot to the granularity bots for posting
          const bots = structuredClone(granularityBots);
          bots.push({
            botName: username as string,
            type: 'custom',
            keyType: 'posting', // Changed from 'active' to 'posting'
          });
          dispatch(setGranularityBots(bots));
        }
      } else if (username === defaultBot) {
        // If it's the default bot, still add it to the list for posting
        const bots = structuredClone(granularityBots);
        bots.push({
          botName: username as string,
          type: 'custom',
          keyType: 'posting', // Changed from 'active' to 'posting'
        });
        dispatch(setGranularityBots(bots));
      }
    }
  };

  const upadteUseActiveGBot = async (use: boolean) => {
    let newActive = structuredClone(originalAuthorities.active);

    console.log({ hasActiveDefaultGBot });
    if (use && !hasActiveDefaultGBot) {
      newActive.account_auths.push([defaultBot, 1]);
      newActive.weight_threshold += 1;
    }
    await dispatch(updateActive(newActive));
  };
  const updateUsePostingGBot = async (use: boolean) => {
    let newPosting = structuredClone(originalAuthorities.posting);

    if (use && !hasPostingDefaultGBot) {
      newPosting.account_auths.push([defaultBot, 1]);
      newPosting.weight_threshold += 1;
    }
    await dispatch(updatePosting(newPosting));
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
