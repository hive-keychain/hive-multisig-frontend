import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { initializeAuthorities } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import AccountUtils from '../../utils/hive.utils';
import { AuthenticatorSetup } from '../cards/TwoFactorAuth/AuthenticatorSetup';
import { MultisigTwoFactorAuthSetup } from '../cards/TwoFactorAuth/MultisigTwoFactorAuthSetup';
import { TwoFactorIntro } from '../cards/TwoFactorAuth/TwoFactorIntro';

export const TwoFactorAuthPage = () => {
  const dispatch = useAppDispatch();

  const twoFactorEnabled = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.enabled,
  );

  const proceedIntro = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.proceedIntro,
  );
  const proceedMultisig = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.proceedMultisig,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const [authorities, setAuthorities] = useState(undefined);
  const getAuthorities = async () => {
    const auth = await AccountUtils.getAccountAuthorities(
      signedAccountObj.data.username,
    );
    if (auth) {
      setAuthorities(auth);
    }
  };
  useEffect(() => {
    getAuthorities();
  }, []);

  useEffect(() => {
    if (authorities) dispatch(initializeAuthorities(authorities));
  }, [authorities]);

  //TODO: retrieve custom json to determine if the 2FA is already enabled
  //PROCESS:
  // always show intro
  // when proceed clicked, move to 2fa setup
  // when setup succeed, proceed to multisig setup
  //  checks in multisig setup:
  // 1) check if hive.multisig is existing
  // 2) if yes: check wether the threshold is enough against the total weight of accounts+keys, bump the threshold
  // 3) if no: add hive.multisig, check the total weights against the threshold, bump the threshold

  return authorities ? (
    proceedMultisig ? (
      <MultisigTwoFactorAuthSetup />
    ) : proceedIntro ? (
      <AuthenticatorSetup />
    ) : (
      <TwoFactorIntro />
    )
  ) : (
    <div className="justify-content-md-center">Retrieving Authorities</div>
  );
};
