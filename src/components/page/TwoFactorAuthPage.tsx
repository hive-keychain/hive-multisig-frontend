import { useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { setReceiveBroadcastNotificationsOn } from '../../redux/features/multisig/multisigThunks';
import { twoFactorAuthActions } from '../../redux/features/twoFactorAuth/twoFactorAuthSlices';
import {
  checkDefaultBot,
  setTwoFABots,
} from '../../redux/features/twoFactorAuth/twoFactorAuthThunks';
import { initializeAuthorities } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import { allowAddKey } from '../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import AccountUtils from '../../utils/hive.utils';
import { MultisigUtils } from '../../utils/multisig.utils';
import { AuthenticatorSetup } from '../cards/TwoFactorAuth/AuthenticatorSetup';
import { ManageTwoFaAccount } from '../cards/TwoFactorAuth/ManageTwoFaAccount';
import { TwoFactorAuthSetup } from '../cards/TwoFactorAuth/TwoFactorAuthSetup';
import { TwoFactorIntro } from '../cards/TwoFactorAuth/TwoFactorIntro';
const defaultBot = process.env.TWOFA_BOT;
if (defaultBot === undefined) {
  console.error(
    'Default Bot is not defined in environment variables, this will cause error in 2FA setup.',
  );
}
export const TwoFactorAuthPage = () => {
  const dispatch = useAppDispatch();

  const proceedIntro = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.proceedIntro,
  );
  const proceedMultisig = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.proceedMultisig,
  );
  const botSetupSuccess = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.botSetupSuccess,
  );
  const hasDefaultBot = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.hasDefaultBot,
  );
  const twoFaBots = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.bots,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);

  const [authorities, setAuthorities] = useState(undefined);
  const transactionSubmittedFlag = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.transactionSubmitted,
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
      dispatch(setTwoFABots(bots));
      const hasDefaultBot = bots.findIndex((acc) => {
        return acc[0] === defaultBot;
      });
      dispatch(checkDefaultBot(hasDefaultBot >= 0));
    } else {
      dispatch(setTwoFABots(bots));
      dispatch(checkDefaultBot(false));
    }
  };
  useEffect(() => {
    dispatch(twoFactorAuthActions.resetState());
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
  useEffect(() => {
    console.log({ transactionSubmittedFlag });
  }, [transactionSubmittedFlag]);
  useEffect(() => {
    if (authorities) {
      dispatch(initializeAuthorities(authorities));
    }
  }, [authorities]);

  return useMemo(() => {
    if (authorities) {
      if (hasDefaultBot === undefined) {
        return (
          <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
              <Spinner animation="grow" />
              <p>Retrieving 2FA Data</p>
            </div>
          </div>
        );
      }

      if (proceedMultisig) {
        return <TwoFactorAuthSetup />; // STEP 3
      } else if (proceedIntro) {
        return <AuthenticatorSetup />; // STEP 2
      } else if (hasDefaultBot || twoFaBots?.length > 0) {
        return <ManageTwoFaAccount />; //STEP 4
      } else {
        return <TwoFactorIntro />; //STEP 1
      }
    }
  }, [authorities, proceedMultisig, proceedIntro, hasDefaultBot]);
};
