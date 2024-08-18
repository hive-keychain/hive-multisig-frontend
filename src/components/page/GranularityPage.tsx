import { useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { granularityActions } from '../../redux/features/granularity/granularitySlices';
import {
  hasDefaultBot as checkGranularityBot,
  setGranularityBots,
} from '../../redux/features/granularity/granularityThunks';
import { setReceiveBroadcastNotificationsOn } from '../../redux/features/multisig/multisigThunks';
import { allowAddKey } from '../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import AccountUtils from '../../utils/hive.utils';
import { MultisigUtils } from '../../utils/multisig.utils';
import { GranularityBotSetup } from '../cards/Granularity/GranlularityBotSetup';
import { GranularityIntro } from '../cards/Granularity/GranularityIntro';

const defaultBot = process.env.BOT;
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
    return () => {
      handleCleanUp();
    };
  }, []);

  const handleCleanUp = () => {
    dispatch(setReceiveBroadcastNotificationsOn(true));
  };
  return useMemo(() => {
    if (authorities) {
      console.log({ authorities });
      console.log({ hasDefaultGranularityBot });

      if (hasDefaultGranularityBot === undefined) {
        return (
          <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
              <Spinner animation="grow" />
              <p>Retrieving 2FA Data</p>
            </div>
          </div>
        );
      }
      if (proceedIntro) {
        return <GranularityBotSetup />;
      } else {
        return <GranularityIntro />;
      }
    }
  }, [authorities, proceedMultisig, proceedIntro, hasDefaultGranularityBot]);
};
