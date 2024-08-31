import { useEffect, useMemo, useState } from 'react';
import { MultisigGbotConfig } from '../../interfaces/granularity.interface';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { granularityActions } from '../../redux/features/granularity/granularitySlices';
import {
  hasDefaultBot as checkGranularityBot,
  initializeConfiguration,
  setGranularityBots,
} from '../../redux/features/granularity/granularityThunks';
import { setReceiveBroadcastNotificationsOn } from '../../redux/features/multisig/multisigThunks';
import { initializeAuthorities } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import { allowAddKey } from '../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import AccountUtils from '../../utils/hive.utils';
import { MultisigUtils } from '../../utils/multisig.utils';
import { GranularityConfigurationSetup } from '../cards/Granularity/GranularityConfigurationSetup';

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
  const proceedConfiguration = useAppSelector(
    (state) => state.granularity.granularity.proceedConfiguration,
  );

  const hasDefaultGranularityBot = useAppSelector(
    (state) => state.granularity.granularity.hasDefaultBot,
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
    const bots = await MultisigUtils.getMultisigBots(
      signedAccountObj.data.username,
    );
    if (bots) {
      dispatch(setGranularityBots(bots));
      const defaultBotIndex = bots.findIndex((acc) => {
        return acc[0] === defaultBot;
      });
      dispatch(checkGranularityBot(defaultBotIndex >= 0));
    } else {
      dispatch(setGranularityBots(bots));
      dispatch(checkGranularityBot(false));
    }
  };

  useEffect(() => {
    dispatch(granularityActions.resetState());
    getAuthorities();
    dispatch(allowAddKey(false));
    dispatch(setReceiveBroadcastNotificationsOn(true));

    const testConfig = {
      id: 'multisig-gbot-config', // You can replace this with your own logic to generate a unique ID
      json: {
        configurations: [
          {
            operations: [
              { operationName: 'vote' },
              { operationName: 'comment' },
            ],
          },
        ],
      },
    } as MultisigGbotConfig;
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
      return null; // or a placeholder if you need to return something
    }

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
    // if (proceedConfiguration) {
    return <GranularityConfigurationSetup />;
    // }

    // Show GranularityBotSetup if proceedIntro is true, but proceedConfiguration is not yet true
    // if (proceedIntro) {
    //   return <GranularityBotSetup />;
    // }

    // Default to GranularityIntro if none of the other conditions are met
    // return <GranularityIntro />;
  }, [
    authorities,
    proceedConfiguration,
    proceedIntro,
    hasDefaultGranularityBot,
  ]);
};
