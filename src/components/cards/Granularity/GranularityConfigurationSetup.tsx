import { KeychainKeyTypes } from 'hive-keychain-commons';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Container,
  Row,
  ToggleButton,
} from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import {
  proceedConfiguration,
  proceedIntro,
  proceedRemovalConfirmation,
  proceedSetupConfirmation,
  updateGranularityConfiguration,
} from '../../../redux/features/granularity/granularityThunks';
import {
  updateActive,
  updatePosting,
} from '../../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import { GranularityUtils } from '../../../utils/granularity-utils';
import { MultisigUtils } from '../../../utils/multisig.utils';
import { AllUsersConfigCard } from './Components/AllUsersConfigCard';
import { CustomUsersConfigCard } from './Components/CustomUsersConfigCard';
import { RemoveGranularityModal } from './Components/RemoveGranularityModal';
import { MultisigGranularityHooks } from './GranularitySetupHooks';
var deepequal = require('deep-equal');
export const GranularityConfigurationSetup = () => {
  const dispatch = useAppDispatch();
  const [disableButton, setDisableButtons] = useState(true);
  const [removeGranularityToggle, setRemoveGranularityToggle] = useState(false);
  const [showRemovalModal, setShowRemovalModal] = useState(false);
  const [configuration, newConfiguration] =
    MultisigGranularityHooks.useGranularityConfiguration();

  const [authority, newAuthorities] = MultisigGranularityHooks.useAuthorities();
  const initialSetupFlag = useAppSelector(
    (state) => state.granularity.granularity.initialSetupFlag,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const bots = useAppSelector((state) => state.granularity.granularity.bots);
  const hasPostingDefaultGBot = useAppSelector(
    (state) => state.granularity.granularity.postingHasExistingGBot,
  );
  const hasActiveDefaultGBot = useAppSelector(
    (state) => state.granularity.granularity.activeHasExistingGBot,
  );
  useEffect(() => {
    if (initialSetupFlag) {
      console.log('disable');
      setDisableButtons(false);
    } else {
      const disable = deepequal(configuration, newConfiguration, {
        strict: true,
      });
      setDisableButtons(disable);
    }
  }, [initialSetupFlag, newConfiguration, configuration]);

  useEffect(() => {
    if (initialSetupFlag) {
      console.log('disable');
      setDisableButtons(false);
    } else {
      setDisableButtons(!removeGranularityToggle);
    }
  }, [removeGranularityToggle]);
  const handleDiscard = () => {
    dispatch(updateGranularityConfiguration(configuration));
    setRemoveGranularityToggle(false);
  };

  const handleUpdateAccount = async () => {
    if (removeGranularityToggle) {
      setShowRemovalModal(true);
    } else {
      const botAuth: [string, number] = GranularityUtils.getAuthority(
        bots[0].botName,
        newAuthorities,
      );
      const configToBroadcast =
        GranularityUtils.moveChangeConfigToCustomJson(newConfiguration);
      const res = await MultisigUtils.granularityConfigBroadcast(
        signedAccountObj.data.username,
        botAuth,
        configToBroadcast,
        transactionState.initiator,
        newAuthorities,
        initialSetupFlag,
      );

      if (res) {
        dispatch(proceedIntro(false));
        dispatch(proceedConfiguration(false));
        dispatch(proceedSetupConfirmation(true));
        alert(res);
      }
    }
  };
  const handleRemoveGranularity = async () => {
    let proceedRemoval = false;
    console.log({ bots });
    const activeBotAuths = bots
      .map((bot) => {
        if (
          bot.keyType.toLowerCase() === KeychainKeyTypes.active.toLowerCase()
        ) {
          return GranularityUtils.getAuthority(
            bot.botName,
            newAuthorities,
            KeychainKeyTypes.active,
          );
        }
        return null; // Explicitly return null for bots that don’t match
      })
      .filter(Boolean); // Filter out any null or undefined values

    const postingBotAuths = bots
      .map((bot) => {
        if (
          bot.keyType.toLowerCase() === KeychainKeyTypes.posting.toLowerCase()
        ) {
          return GranularityUtils.getAuthority(
            bot.botName,
            newAuthorities,
            KeychainKeyTypes.posting,
          );
        }
        return null;
      })
      .filter(Boolean);

    console.log({ activeBotAuths });
    console.log({ postingBotAuths });
    if (activeBotAuths && activeBotAuths.length > 0) {
      const active = structuredClone(newAuthorities.active);

      let newActive = {
        ...active,
        account_auths: [
          ...newAuthorities.active.account_auths.filter(
            (acc) => !activeBotAuths.some((ac) => ac[0] === acc[0]),
          ),
        ],
      };
      newActive.weight_threshold -= activeBotAuths.reduce((sum, item) => {
        if (Array.isArray(item) && typeof item[1] === 'number') {
          return sum + item[1];
        }
        return sum;
      }, 0);
      newActive.weight_threshold = Math.max(newActive.weight_threshold, 1);
      await dispatch(updateActive(newActive));
      proceedRemoval = true;
    }

    if (postingBotAuths && postingBotAuths.length > 0) {
      const posting = structuredClone(newAuthorities.posting);

      let newPosting = {
        ...posting,
        account_auths: [
          ...newAuthorities.posting.account_auths.filter(
            (acc) => !postingBotAuths.some((ac) => ac[0] === acc[0]),
          ),
        ],
      };

      newPosting.weight_threshold -= postingBotAuths.reduce((sum, item) => {
        if (Array.isArray(item) && typeof item[1] === 'number') {
          return sum + item[1];
        }
        return sum;
      }, 0);

      newPosting.weight_threshold = Math.max(newPosting.weight_threshold, 1);

      await dispatch(updatePosting(newPosting));
      proceedRemoval = true;
    }
    console.log({ proceedRemoval });
    dispatch(proceedRemovalConfirmation(proceedRemoval));
  };

  return (
    <Container className="d-flex flex-fill justify-content-md-center">
      <RemoveGranularityModal
        show={showRemovalModal}
        handleCancel={() => {
          setShowRemovalModal(false);
        }}
        handleSubmit={() => {
          setShowRemovalModal(false);
          handleRemoveGranularity();
        }}
      />
      <Card border="secondary" className="w-100">
        <Container fluid>
          <Card.Body>
            <h3 className="card-title text-center">
              Granularity Configuration
            </h3>
          </Card.Body>
          <Row className="justify-content-between">
            <Col xs={12} md={6} className="mb-3">
              <Card className="h-100" border="secondary">
                <h4 className="text-center mt-2">All Users</h4>
                <AllUsersConfigCard />
              </Card>
            </Col>
            <Col xs={12} md={6} className="mb-3">
              <Card className="h-100" border="secondary">
                <h4 className="text-center mt-2">Custom</h4>
                <CustomUsersConfigCard />
              </Card>
            </Col>
          </Row>
        </Container>

        <div className="d-flex justify-content-end mb-3 me-3 rem-10">
          {hasActiveDefaultGBot || hasPostingDefaultGBot ? (
            <ToggleButton
              variant="outline-danger"
              id="toggle-remove-granularity"
              checked={removeGranularityToggle}
              type="checkbox"
              onChange={(e) =>
                setRemoveGranularityToggle(e.currentTarget.checked)
              }
              value={''}>
              <i className="fa fa-trash" aria-hidden="true"></i>
              Remove Granularity
            </ToggleButton>
          ) : (
            ''
          )}

          <Button
            onClick={() => {
              handleDiscard();
            }}
            disabled={disableButton}
            className="ms-2"
            variant="danger">
            Discard
          </Button>

          <Button
            disabled={disableButton}
            onClick={() => {
              handleUpdateAccount();
            }}
            className="ms-2"
            variant="success">
            Submit
          </Button>
        </div>

        <div className=" d-flex justify-content-center">
          <p className="text-danger ms-2">
            {removeGranularityToggle
              ? '\t ⚠  Warning: the granularity configuration will be deleted when you press submit.'
              : ''}
          </p>
        </div>
      </Card>
    </Container>
  );
};
