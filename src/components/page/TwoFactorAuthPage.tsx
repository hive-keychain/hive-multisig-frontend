import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { twoFactorAuthActions } from '../../redux/features/twoFactorAuth/twoFactorAuthSlices';
import { checkDefaultBot } from '../../redux/features/twoFactorAuth/twoFactorAuthThunks';
import { initializeAuthorities } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import { allowAddKey } from '../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import AccountUtils from '../../utils/hive.utils';
import { AuthenticatorSetup } from '../cards/TwoFactorAuth/AuthenticatorSetup';
import { MultisigTwoFAHooks } from '../cards/TwoFactorAuth/Multisig2FAHooks';
import { TwoFactorAuthSetup } from '../cards/TwoFactorAuth/TwoFactorAuthSetup';
import { TwoFactorIntro } from '../cards/TwoFactorAuth/TwoFactorIntro';
const defaultBot = process.env.BOT;

export const TwoFactorAuthPage = () => {
  const dispatch = useAppDispatch();
  const [originalActive, newActive] = MultisigTwoFAHooks.useActiveAuthority();

  const proceedIntro = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.proceedIntro,
  );
  const proceedMultisig = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.proceedMultisig,
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
    }
  };

  const findDefaultBot = () => {
    if (originalActive) {
      const hasDefaultBot = originalActive.account_auths.findIndex((acc) => {
        return acc[0] === defaultBot;
      });
      dispatch(checkDefaultBot(hasDefaultBot >= 0));
    }
  };

  useEffect(() => {
    dispatch(twoFactorAuthActions.resetState());
    getAuthorities();
    dispatch(allowAddKey(false));
  }, []);

  useEffect(() => {
    findDefaultBot();
  }, [originalActive]);

  useEffect(() => {
    if (authorities) dispatch(initializeAuthorities(authorities));
  }, [authorities]);

  return authorities ? (
    proceedMultisig ? (
      <TwoFactorAuthSetup />
    ) : proceedIntro ? (
      <AuthenticatorSetup />
    ) : (
      <TwoFactorIntro />
    )
  ) : (
    <div className="justify-content-md-center">Retrieving Authorities</div>
  );
};
