import { useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
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
const defaultBot = process.env.BOT;

export const TwoFactorAuthPage = () => {
  const dispatch = useAppDispatch();

  const proceedIntro = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.proceedIntro,
  );
  const proceedMultisig = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.proceedMultisig,
  );

  const hasDefaultBot = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.hasDefaultBot,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);

  const [authorities, setAuthorities] = useState(undefined);

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
      dispatch(checkDefaultBot(false));
    }
  };
  useEffect(() => {
    console.log('load');
    dispatch(twoFactorAuthActions.resetState());
    getAuthorities();
    dispatch(allowAddKey(false));
  }, []);

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
        return <TwoFactorAuthSetup />;
      } else if (proceedIntro) {
        return <AuthenticatorSetup />;
      } else if (hasDefaultBot) {
        return <ManageTwoFaAccount />;
      } else {
        return <TwoFactorIntro />;
      }
    }
  }, [authorities, proceedMultisig, proceedIntro, hasDefaultBot]);
};
