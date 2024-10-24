import { useEffect, useMemo, useState } from 'react';
import { testConfig } from '../../../granularity-sample-config';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { granularityActions } from '../../redux/features/granularity/granularitySlices';
import {
  activeHasExistingGBot,
  initializeConfiguration,
  postingHasExistingGBot,
  setGranularityBots,
} from '../../redux/features/granularity/granularityThunks';
import { setReceiveBroadcastNotificationsOn } from '../../redux/features/multisig/multisigThunks';
import { initializeAuthorities } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import { allowAddKey } from '../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import { GranularityUtils } from '../../utils/granularity-utils';
import AccountUtils from '../../utils/hive.utils';
import { GranularityBotSetup } from '../cards/Granularity/GranlularityBotSetup';
import { GranularityConfigurationSetup } from '../cards/Granularity/GranularityConfigurationSetup';
import { GranularityIntro } from '../cards/Granularity/GranularityIntro';
import { MultisigGranularityHooks } from '../cards/Granularity/GranularitySetupHooks';

const defaultBot = process.env.GRANULARITY_BOT;
if (defaultBot === undefined) {
  console.error(
    'Default Granularity Bot is not defined in environment variables, this will cause error in 2FA setup.',
  );
}

export const GranularityPage = () => {
  const dispatch = useAppDispatch();
  const [authorities, setAuthorities] = useState(undefined);
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const proceedMultisig = useAppSelector(
    (state) => state.granularity.granularity.proceedMultisig,
  );
  const [originalAuthorities, newAuthorities] =
    MultisigGranularityHooks.useAuthorities();
  const proceedConfiguration = useAppSelector(
    (state) => state.granularity.granularity.proceedConfiguration,
  );

  const proceedIntro = useAppSelector(
    (state) => state.granularity.granularity.proceedIntro,
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
    if (bots) {
      dispatch(setGranularityBots(bots));
    } else {
      dispatch(setGranularityBots(bots));
    }
  };

  useEffect(() => {
    if (originalAuthorities) {
      const hasActiveDefaultGBot =
        originalAuthorities.active.account_auths.some(
          (acc) => acc[0] === defaultBot,
        );
      const hasPostingDefaultGBot =
        originalAuthorities.posting.account_auths.some(
          (acc) => acc[0] === defaultBot,
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
    //TODO: Replace with the config retrieved from the chain
    dispatch(initializeConfiguration(testConfig));

    return () => {
      handleCleanUp();
    };
  }, []);

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

    //TODO: retrieve gbot config
    // if (hasDefaultGranularityBot === undefined) {
    //   return (
    //     <div className="d-flex justify-content-center align-items-center vh-100">
    //       <div className="text-center">
    //         <Spinner animation="grow" />
    //         <p>Retrieving 2FA Data</p>
    //       </div>
    //     </div>
    //   );
    // }

    // Show GranularityConfigurationSetup only if both proceedIntro and proceedConfiguration are true
    if (proceedConfiguration) {
      return <GranularityConfigurationSetup />;
    }

    // Show GranularityBotSetup if proceedIntro is true, but proceedConfiguration is not yet true
    if (proceedIntro) {
      return <GranularityBotSetup />;
    }

    // Default to GranularityIntro if none of the other conditions are met
    return <GranularityIntro />;
  }, [authorities, proceedConfiguration, proceedIntro]);
};
