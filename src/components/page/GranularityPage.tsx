import { useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { MultisigGbotConfig } from '../../interfaces/granularity.interface';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { granularityActions } from '../../redux/features/granularity/granularitySlices';
import {
  activeHasExistingGBot,
  initializeConfiguration,
  initialSetupFlag,
  postingHasExistingGBot,
  setGranularityBots,
} from '../../redux/features/granularity/granularityThunks';
import { setReceiveBroadcastNotificationsOn } from '../../redux/features/multisig/multisigThunks';
import { initializeAuthorities } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import { allowAddKey } from '../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import { GranularityUtils } from '../../utils/granularity-utils';
import AccountUtils from '../../utils/hive.utils';
import { RemoveGranularityConfirmationCard } from '../cards/Granularity/Components/RemoveGranularityConfirmationCard';
import { GranularityBotSetup } from '../cards/Granularity/GranlularityBotSetup';
import { GranularityConfigurationSetup } from '../cards/Granularity/GranularityConfigurationSetup';
import { GranularityIntro } from '../cards/Granularity/GranularityIntro';
import { GranularitySetupConfirmation } from '../cards/Granularity/GranularitySetupConfirmation';
import { MultisigGranularityHooks } from '../cards/Granularity/GranularitySetupHooks';

const defaultBot = process.env.GRANULARITY_BOT;
const GBOT_CONFIG_ID = process.env.GBOT_CONFIG_ID;

if (defaultBot === undefined) {
  console.error(
    'Default Granularity Bot is not defined in environment variables, this will cause error in 2FA setup.',
  );
}

export const GranularityPage = () => {
  const dispatch = useAppDispatch();

  const [authorities, setAuthorities] = useState(undefined);
  const granularityBots = useAppSelector(
    (state) => state.granularity.granularity.bots,
  );
  const [configuration, newConfiguration] =
    MultisigGranularityHooks.useGranularityConfiguration();
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const proceedMultisig = useAppSelector(
    (state) => state.granularity.granularity.proceedMultisig,
  );
  const [originalAuthorities, newAuthorities] =
    MultisigGranularityHooks.useAuthorities();
  const proceedConfiguration = useAppSelector(
    (state) => state.granularity.granularity.proceedConfiguration,
  );
  const proceedSetupConfirmation = useAppSelector(
    (state) => state.granularity.granularity.proceedSetupConfirmation,
  );
  const proceedIntro = useAppSelector(
    (state) => state.granularity.granularity.proceedIntro,
  );
  const proceedRemoval = useAppSelector(
    (state) => state.granularity.granularity.proceedRemoval,
  );
  const getAuthorities = async () => {
    if (signedAccountObj) {
      const auth = await AccountUtils.getAccountAuthorities(
        signedAccountObj.data.username,
      );

      if (auth) {
        setAuthorities(auth);
      }
      scanBots();
    }
  };

  const scanBots = async () => {
    const bots = await GranularityUtils.getGranularityBots(
      signedAccountObj.data.username,
    );
    console.log({ bots });
    if (bots) {
      dispatch(setGranularityBots(bots));
      dispatch(initialSetupFlag(false));
    } else {
      dispatch(initialSetupFlag(true));
      dispatch(setGranularityBots([]));
    }
  };

  useEffect(() => {
    if (originalAuthorities) {
      const hasActiveDefaultGBot =
        originalAuthorities.active.account_auths.some(
          (acc: [string, number]) => acc[0] === defaultBot,
        );
      const hasPostingDefaultGBot =
        originalAuthorities.posting.account_auths.some(
          (acc: [string, number]) => acc[0] === defaultBot,
        );
      dispatch(activeHasExistingGBot(hasActiveDefaultGBot));
      dispatch(postingHasExistingGBot(hasPostingDefaultGBot));
    }
  }, [originalAuthorities]);
  useEffect(() => {
    dispatch(granularityActions.resetState());
    getAuthorities();
    dispatch(allowAddKey(false));
    dispatch(setReceiveBroadcastNotificationsOn(true));
    return () => {
      handleCleanUp();
    };
  }, []);

  useEffect(() => {
    if (granularityBots) {
      setConfiguration();
    }
  }, [granularityBots]);

  const setConfiguration = async () => {
    const configurations = await GranularityUtils.apiGetGBotConfig(
      signedAccountObj.data.username,
    );
    if (configurations) {
      var gbotConfig: MultisigGbotConfig = {
        id: GBOT_CONFIG_ID,
        json: {
          configurations,
        },
      };
      dispatch(initializeConfiguration(gbotConfig));
    } else {
      var gbotConfig: MultisigGbotConfig = {
        id: GBOT_CONFIG_ID,
        json: {
          configurations: [
            {
              operations: [],
            },
            {
              authority: signedAccountObj.data.username,
              operations: [
                {
                  operationName: 'all',
                },
              ],
            },
          ],
        },
      };
      dispatch(initializeConfiguration(gbotConfig));
    }
  };

  useEffect(() => {
    if (authorities) {
      dispatch(initializeAuthorities(authorities));
    }
  }, [authorities]);

  const handleCleanUp = () => {
    dispatch(setReceiveBroadcastNotificationsOn(true));
  };
  return useMemo(() => {
    if (!authorities) {
      return null;
    }

    if (granularityBots === undefined) {
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <Spinner animation="grow" />
            <p>Retrieving Granularity Data</p>
          </div>
        </div>
      );
    }

    // Show GranularityConfigurationSetup only if both proceedIntro and proceedConfiguration are true
    if (proceedConfiguration) {
      return <GranularityConfigurationSetup />;
    }

    // Show GranularityBotSetup if proceedIntro is true, but proceedConfiguration is not yet true
    if (proceedIntro) {
      return <GranularityBotSetup />;
    }

    //Show the configuration setup when existing bot has been found.
    //Show the removal card when proceedRemoval is true
    if (granularityBots && granularityBots.length > 0) {
      if (proceedRemoval) {
        return <RemoveGranularityConfirmationCard />;
      } //Show the configuration setup after broadcast
      else if (proceedSetupConfirmation) {
        return <GranularitySetupConfirmation />;
      }

      return <GranularityConfigurationSetup />;
    }

    // Default to GranularityIntro if none of the other conditions are met
    return <GranularityIntro />;
  }, [
    authorities,
    proceedConfiguration,
    proceedIntro,
    granularityBots,
    proceedRemoval,
    proceedSetupConfirmation,
  ]);
};
